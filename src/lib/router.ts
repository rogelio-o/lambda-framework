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

export default class Router implements IRouter {

  private _subpath: string
  private _subrouters: Array<IRouter>
  private _params: {[name: string]: Array<IHttpPlaceholderHandler>}
  private _httpStack: Array<IHttpLayer>
  private _eventStack: Array<IEventLayer>
  private _caseSensitive: boolean
  private _strict: boolean

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

  setSubpath(subpath: string): void {
    this._subpath = subpath;
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
    router.setSubpath(path);
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

  httpHandle(req: IHttpRequest, res: IHttpResponse, next: INext): void {
    // TODO
  }

  eventHandle(req: IEventRequest, next: INext): void {
    // TODO
  }

}
