import IHttpRouterExecutor from './../types/http-router-executor'
import IRouter from './../types/router'
import IHttpRequest from './../types/http-request'
import IHttpResponse from './../types/http-response'
import INext from './../types/next'
import IHttpLayer from './../types/http-layer'

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

export default class HttpRouterExecutor implements IHttpRouterExecutor {

  private _router:IRouter
  private _req:IHttpRequest
  private _res:IHttpResponse
  private _stackIndex:number
  private _routerIndex:number
  private _parentParams: { [name: string]: any }
  private _done:INext

  constructor(router: IRouter, req:IHttpRequest, res:IHttpResponse, done:INext) {
    this._router = router;
    this._stackIndex = 0;
    this._routerIndex = -1;
    this._parentParams = req.params
    this._done =  restore(done, req, 'basePath', 'originalBasePath', 'next', 'params');

    req.next = this.next
    req.originalBasePath = req.basePath || ''
    req.basePath = req.originalBasePath + (router.subpath || '')
  }

  private _findNextLayer():IHttpLayer {
    let result:IHttpLayer = null;
    while(this._stackIndex < this._router.httpStack.length) {
      let layer:IHttpLayer = this._router.httpStack[this._stackIndex];
      this._stackIndex++;

      if(layer.match(this._req.path)) {
        const route = layer.route;

        // Check methods for routes
        if(!route || route.hasMethod(this._req.method)) {
          result = layer;
          break;
        }
      }
    }

    return result;
  }

  private _findNextSubrouter():IRouter {
    // TODO find next router matching with the param
    return null;
  }

  next(error?: Error): void {
    if(this._stackIndex < this._router.httpStack.length) {
      // Process from stack
      const layer:IHttpLayer = this._findNextLayer();

      if(!layer) {
        // If no layer found, call next again to process subrouters or finalize
        this.next(error);
      } else if(error && !layer.isErrorHandler()) {
        // We process only error handlers if there is an error
        this.next(error);
      } else {
        this._req.route = layer.route;
        // TODO this._req.params = layer.params (merge with parents);

        // TODO process_params (of layer path)

        layer.handle(this._req, this._res, this.next, error);
      }
    } else if(this._routerIndex < this._router.subrouters.length) {
      // Process from subrouters
      const subrouter:IRouter = this._findNextSubrouter();

      if(!subrouter) {
        // If no subrouter found, call next again to finalize
        this.next(error);
      } else {
        // Process the subrouter and come back to this executor
        // to process a new subrouter o to finalize
        subrouter.httpHandle(this._req, this._res, this.next);
      }
    } else {
      // Finalize
      this._done(error);
    }
  }

}
