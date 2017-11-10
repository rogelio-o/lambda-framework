import EventLayer from "./event/EventLayer";
import EventRouterExecutor from "./event/EventRouterExecutor";
import HttpLayer from "./http/HttpLayer";
import HttpRoute from "./http/HttpRoute";
import HttpRouterExecutor from "./http/HttpRouterExecutor";
import TemplateEngine from "./http/renderEngine/TemplateEngine";
import IEventHandler from "./types/event/IEventHandler";
import IEventLayer from "./types/event/IEventLayer";
import IEventRequest from "./types/event/IEventRequest";
import IEventRoutePredicate from "./types/event/IEventRoutePredicate";
import IEventRouterExecutor from "./types/event/IEventRouterExecutor";
import IHttpHandler from "./types/http/IHttpHandler";
import IHttpLayer from "./types/http/IHttpLayer";
import IHttpPlaceholderHandler from "./types/http/IHttpPlaceholderHandler";
import IHttpRequest from "./types/http/IHttpRequest";
import IHttpResponse from "./types/http/IHttpResponse";
import IHttpRoute from "./types/http/IHttpRoute";
import IHttpRouterExecutor from "./types/http/IHttpRouterExecutor";
import ITemplateEngine from "./types/http/renderEngine/ITemplateEngine";
import ITemplateRenderer from "./types/http/renderEngine/ITemplateRenderer";
import INext from "./types/INext";
import IRouter from "./types/IRouter";

const HTTP_METHODS = ["GET", "PUT", "DELETE", "POST"];

// send an OPTIONS response
function sendOptionsResponse(res: IHttpResponse, options: string[], next: INext): void {
  try {
    const body = options.join(",");
    res.putHeader("Allow", body);
    res.send(body);
  } catch (err) {
    next(err);
  }
}

/**
 * The objects that describe the layers to apply over path and events. The
 * routers can be subrouters of other routers. Also, handlers can be set
 * to be run when an param appears in a path of an incoming HTTP request.
 */
export default class Router implements IRouter {

  private _subrouters: IRouter[];
  private _params: {[name: string]: IHttpPlaceholderHandler[]};
  private _httpStack: IHttpLayer[];
  private _eventStack: IEventLayer[];
  private _caseSensitive: boolean;
  private _strict: boolean;
  private _subpath: string;
  private _parent: IRouter;
  private _templateEngine: ITemplateEngine;

  constructor(opts?: {[name: string]: any}) {
    const options = opts || {};

    this._subrouters = [];
    this._params = {};
    this._httpStack = [];
    this._eventStack = [];
    this._caseSensitive = options.caseSensitive || false;
    this._strict = options.strict || false;
  }

  get subrouters(): IRouter[] {
    return this._subrouters;
  }

  get httpStack(): IHttpLayer[] {
    return this._httpStack;
  }

  get eventStack(): IEventLayer[] {
    return this._eventStack;
  }

  get parent(): IRouter {
    return this._parent;
  }

  get subpath(): string {
    return this._subpath;
  }

  get fullSubpath(): string {
    if (!this._subpath || !this._parent) {
      return this._subpath;
    } else {
      let result = null;

      if (this.parent) {
        const parentFullSubpath = this.parent.fullSubpath;
        if (parentFullSubpath) {
          result = parentFullSubpath;
        }
      }

      if (!result) {
        result = "";
      }

      result = result + this._subpath;

      return result;
    }
  }

  get templateEngine(): ITemplateEngine {
    if (this._templateEngine) {
      return this._templateEngine;
    } else if (this._parent) {
      return this._parent.templateEngine;
    } else {
      return null;
    }
  }

  public param(name: string, handler: IHttpPlaceholderHandler): IRouter {
    if (!this._params[name]) {
      this._params[name] = [];
    }
    this._params[name].push(handler);

    return this;
  }

  public use(handler: IHttpHandler|IHttpHandler[], path?: string): IRouter {
    let fns: IHttpHandler[];
    if (Array.isArray(handler)) {
      fns = handler;
    } else {
      fns = [handler];
    }

    const layers: IHttpLayer[] = fns.map(
      (fn) => new HttpLayer(
        this,
        path,
        {
          sensitive: this._caseSensitive,
          strict: false,
          end: false
        },
        fn
      )
  );

    this._httpStack = this._httpStack.concat(layers);

    return this;
  }

  public mount(router: IRouter, path?: string): IRouter {
    router.doSubrouter(path, this);
    this._subrouters.push(router);

    return this;
  }

  public route(path: string): IHttpRoute {
    const layer = new HttpLayer(this, path, {
      sensitive: this._caseSensitive,
      strict: this._strict,
      end: true
    });
    const route = new HttpRoute(layer);
    layer.route = route;

    this._httpStack.push(layer);

    return route;
  }

  public event(event: string|IEventRoutePredicate, handler: IEventHandler): IRouter {
    const layer = new EventLayer(
      event,
      {
        end: true
      },
      handler
    );

    this._eventStack.push(layer);

    return this;
  }

  public httpHandle(req: IHttpRequest, res: IHttpResponse, out: INext): void {
    if (req.method === "OPTIONS") {
      const options = this.getAvailableMethodsForPath(req.path);
      if (options.length === 0) {
        return out();
      } else {
        sendOptionsResponse(res, options, out);
      }
    } else {
      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(this, req, res, out);
      res.router = this;
      routerExecutor.next();
    }
  }

  public doSubrouter(subpath: string, parent: IRouter): void {
    this._subpath = subpath;
    this._parent = parent;
  }

  public httpProcessParams(layerParams: { [name: string]: string }, executedParams: string[], req: IHttpRequest, res: IHttpResponse, done: INext): void {
    const keys = Object.keys(layerParams);
    if (keys.length > 0) {
      const processParam = (index: number) => {
        const partialDone: INext = (error?: Error) => {
          if (error) {
            done(error);
          } else {
            const newIndex = index + 1;
            if (newIndex < keys.length) {
              processParam(newIndex);
            } else {
              done();
            }
          }
        };

        const key = keys[index];
        const value = layerParams[key];
        const handlers = this._params[key];
        if (executedParams.indexOf(key) === -1 && handlers && handlers.length > 0) {
          const processHandler = (index2: number) => {
            const partialPartialDone: INext = (error?: Error) => {
              if (error) {
                partialDone(error);
              } else {
                const newIndex = index2 + 1;
                if (newIndex < handlers.length) {
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

  public getAvailableMethodsForPath(path: string): string[] {
    const result: string[] = [];

    this._httpStack.forEach((layer) => {
      if (layer.route && layer.match(path)) {
        HTTP_METHODS.forEach((method) => {
          if (result.indexOf(method) === -1 && layer.route.hasMethod(method)) {
            result.push(method);
          }
        });
      }
    });

    this._subrouters.forEach((subrouter) => {
      subrouter.getAvailableMethodsForPath(path).forEach((method) => {
        if (result.indexOf(method) === -1) {
          result.push(method);
        }
      });
    });

    return result;
  }

  public eventHandle(req: IEventRequest, out: INext): void {
    const routerExecutor: IEventRouterExecutor = new EventRouterExecutor(this, req, out);
    routerExecutor.next();
  }

  public addTemplateEngine(renderer: ITemplateRenderer, engineConfiguration?: {[name: string]: any}): IRouter {
    this._templateEngine = new TemplateEngine(renderer, engineConfiguration);

    return this;
  }

}
