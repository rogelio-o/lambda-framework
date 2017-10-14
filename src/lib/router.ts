import IRouter from './types/router'
import IHttpPlaceholderHandler from './types/http-placeholder-handler'
import IHttpHandler from './types/http-handler'
import IHttpRoute from './types/http-route'
import HttpRoute from './http/route'
import IEventHandler from './types/event-handler'
import IEventRoutePredicate from './types/event-route-predicate'
import IHttpLayer from './types/http-layer'
import HttpLayer from './http/layer'
import IEventLayer from './types/event-layer'
import EventLayer from './event/layer'
import IHttpRequest from './types/http-request'
import IEventRequest from './types/event-request'
import IHttpResponse from './types/http-response'
import INext from './types/next'
import IHttpRouterExecutor from './types/http-router-executor'
import HttpRouterExecutor from './http/router-executor'
import IEventRouterExecutor from './types/event-router-executor'
import EventRouterExecutor from './event/router-executor'

const HTTP_METHODS = ['GET', 'PUT', 'DELETE', 'POST'];

// send an OPTIONS response
function sendOptionsResponse(res: IHttpResponse, options: Array<string>, next: INext) {
  try {
    var body = options.join(',');
    res.putHeader('Allow', body);
    res.send(body);
  } catch (err) {
    next(err);
  }
}

export default class Router implements IRouter {

  private _subrouters: Array<IRouter>
  private _params: {[name: string]: Array<IHttpPlaceholderHandler>}
  private _httpStack: Array<IHttpLayer>
  private _eventStack: Array<IEventLayer>
  private _caseSensitive: boolean
  private _strict: boolean
  private _subpath: string
  private _parent: IRouter

  constructor(opts?: {[name: string]: any}) {
    const options = opts || {}

    this._subrouters = []
    this._params = {}
    this._httpStack = []
    this._eventStack = []
    this._caseSensitive = options.caseSensitive || false
    this._strict = options.strict || false
  }

  get subrouters(): Array<IRouter> {
    return this._subrouters;
  }

  get httpStack(): Array<IHttpLayer> {
    return this._httpStack;
  }

  get eventStack(): Array<IEventLayer> {
    return this._eventStack;
  }

  get parent(): IRouter {
    return this._parent;
  }

  get subpath(): string {
    return this._subpath;
  }

  get fullSubpath(): string {
    if(!this._subpath && !this._parent) {
      return this._subpath;
    } else {
      let result = null;

      if(this.parent) {
        const parentFullSubpath = this.parent.fullSubpath;
        if(parentFullSubpath) result = parentFullSubpath;
      }

      if(!result) {
        result = '';
      }

      result = result + this._subpath;

      return result;
    }
  }

  param(name: string, handler: IHttpPlaceholderHandler): IRouter {
    if(!this._params[name]) this._params[name] = []
    this._params[name].push(handler)

    return this;
  }

  use(handler: IHttpHandler|Array<IHttpHandler>, path?: string): IRouter {
    if(!path) path = '/'
    let fns: Array<IHttpHandler>
    if(Array.isArray(handler)) {
      fns = handler
    } else {
      fns = [handler]
    }

    const layers: Array<IHttpLayer> = fns.map(fn => new HttpLayer(path, {
      sensitive: this._caseSensitive,
      strict: false,
      end: false
    }, fn))

    this._httpStack = this._httpStack.concat(layers)

    return this;
  }

  mount(router: IRouter, path?: string): IRouter {
    router.doSubrouter(path, this);
    this._subrouters.push(router);

    return this;
  }

  route(path: string): IHttpRoute {
    const layer = new HttpLayer(path, {
      sensitive: this._caseSensitive,
      strict: this._strict,
      end: true
    })
    const route = new HttpRoute(layer)
    layer.route = route

    this._httpStack.push(layer)

    return route;
  }

  event(event: string|IEventRoutePredicate, handler: IEventHandler): IRouter {
    const layer = new EventLayer(event, {
      end: true
    }, handler)

    this._eventStack.push(layer)

    return this;
  }

  httpHandle(req: IHttpRequest, res: IHttpResponse, out: INext): void {
    if(req.method === 'OPTIONS') {
      const options = this.getAvailableMethodsForPath(req.path);
      if (options.length === 0)
        return out();
      else
        sendOptionsResponse(res, options, out);
    } else {
      const routerExecutor:IHttpRouterExecutor = new HttpRouterExecutor(this, req, res, out);
      routerExecutor.next();
    }
  }

  doSubrouter(subpath: string, parent: IRouter) {
    this._subpath = subpath;
    this._parent = parent;
  }

  httpProcessParams(layerParams: { [name: string]: string }, executedParams: Array<string>, req: IHttpRequest, res: IHttpResponse, done: INext): void {
    const keys = Object.keys(layerParams);
    if(keys.length > 0) {
      const processParam = (index: number) => {
        const partialDone: INext = (error?: Error) => {
          if(error) {
            done(error);
          } else {
            const newIndex = index + 1;
            if(newIndex < keys.length) {
              processParam(newIndex);
            } else {
              done();
            }
          }
        };

        const key = keys[index];
        const value = layerParams[key];
        const handlers = this._params[key];
        if(executedParams.indexOf(key) == -1 && handlers && handlers.length > 0) {
          const processHandler = (index2: number) => {
            const partialPartialDone: INext = (error?: Error) => {
              if(error) {
                partialDone(error);
              } else {
                const newIndex = index + 1;
                if(newIndex < handlers.length) {
                  processHandler(newIndex);
                } else {
                  executedParams.push(key);
                  partialDone();
                }
              }
            };

            const handler = handlers[index2];
            handler(req, res, partialPartialDone, value);
          };

          processHandler(0);
        } else {
          partialDone();
        }
      };

      processParam(0);
    } else {
      done();
    }
  }

  getAvailableMethodsForPath(path: string): Array<string> {
    const result = [];

    this._httpStack.forEach((layer) => {
      if(layer.route) {
        HTTP_METHODS.forEach((method) => {
          if(result.indexOf(method) == -1 && layer.route.hasMethod(method)) {
            result.push(method);
          }
        })
      }
    });

    this._subrouters.forEach((subrouter) => {
      subrouter.getAvailableMethodsForPath(path).forEach((method) => {
        if(result.indexOf(method) == -1) {
          result.push(method);
        }
      });
    });

    return result;
  }

  eventHandle(req: IEventRequest, out: INext): void {
    const routerExecutor:IEventRouterExecutor = new EventRouterExecutor(this, req, out);
    routerExecutor.next();
  }

}
