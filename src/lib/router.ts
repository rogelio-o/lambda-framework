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

  public subpath: string

  constructor(opts?: {[name: string]: any}) {
    const options = opts || {}

    this._subrouters = []
    this._params = {}
    this._httpStack = []
    this._caseSensitive = options.caseSensitive || false
    this._strict = options.strict || false
  }

  get subrouters(): Array<IRouter> {
    return this._subrouters;
  }

  get httpStack(): Array<IHttpLayer> {
    return this._httpStack;
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
    router.subpath = path;
    this._subrouters.push(router);

    return this;
  }

  route(path: string): IHttpRoute {
    const route = new HttpRoute(path)
    const layer = new HttpLayer(path, {
      sensitive: this._caseSensitive,
      strict: this._strict,
      end: true
    }, route.dispatch)
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
      /* TODO this._done = wrap(this._done, (old, err) => {
        if (err || this._options.length === 0) return old(err);
        sendOptionsResponse(res, this._options, old);
      })*/
    } else {
      const routerExecutor:IHttpRouterExecutor = new HttpRouterExecutor(this, req, res, out);
      routerExecutor.next();
    }
  }

  eventHandle(req: IEventRequest, next: INext): void {
    // TODO
  }

}
