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

function restore(fn: INext, req: IHttpRequest, ...params: string[]) {
  var vals = new Array(params.length);

  for (var i = 0; i < params.length; i++) {
    vals[i] = req[params[i]];
  }

  return function (err) {
    // restore vals
    for (var i = 0; i < params.length; i++) {
      req[params[i]] = vals[i];
    }

    return fn.apply(this);
  };
}

// wrap a function
function wrap(old: Function, fn: Function) {
  return function proxy() {
    var args = new Array(1);
    args[0] = old;

    fn.apply(this, args);
  };
}

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

  private _subpath: string
  private _subrouters: Array<IRouter>
  private _params: {[name: string]: Array<IHttpPlaceholderHandler>}
  private _httpStack: Array<IHttpLayer>
  private _eventStack: Array<IEventLayer>
  private _caseSensitive: boolean
  private _strict: boolean

  private _idStack: number
  private _idSubrouter: number
  private _options: Array<string>
  private _done: INext
  private _parentParams: { [name: string]: any }

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

  private _httpNext(err?: Error) {

  }

  httpHandle(req: IHttpRequest, res: IHttpResponse, out: INext): void {
    this._idStack = 0
    this._idSubrouter = 0
    this._options = []
    this._done =  restore(out, req, 'basePath', 'originalBasePath', 'next', 'params');
    this._parentParams = req.params

    req.next = this._httpNext
    req.originalBasePath = req.basePath || ''
    req.basePath = req.originalBasePath + (this._subpath || '')

    if(req.method === 'OPTIONS') {
      this._done = wrap(this._done, (old, err) => {
        if (err || this._options.length === 0) return old(err);
        sendOptionsResponse(res, this._options, old);
      })
    }

    this._httpNext()
  }

  eventHandle(req: IEventRequest, next: INext): void {
    // TODO
  }

}
