import * as mixin from "utils-merge";
import IHttpLayer from "./../types/http/IHttpLayer";
import IHttpRequest from "./../types/http/IHttpRequest";
import IHttpResponse from "./../types/http/IHttpResponse";
import IHttpRouterExecutor from "./../types/http/IHttpRouterExecutor";
import INext from "./../types/INext";
import IRouter from "./../types/IRouter";

function restore(fn: INext, req: IHttpRequest, ...params: string[]): INext {
  const vals = [];

  for (let i = 0; i < params.length; i += 1) {
    vals[i] = req[params[i]];
  }

  return (err?: Error): void => {
    // restore vals
    for (let e = 0; e < params.length; e += 1) {
      req[params[e]] = vals[e];
    }

    fn(err);
  };
}

// merge params with parent params
function mergeParams(params: { [name: string]: any }, parent: { [name: string]: any }): { [name: string]: any } {
  if (!parent) {
    return params;
  }

  const obj = mixin({}, parent);
  return mixin(obj, params);
}

/**
 * This class execute all the layers for an incoming request.
 */
export default class HttpRouterExecutor implements IHttpRouterExecutor {

  private _router: IRouter;
  private _req: IHttpRequest;
  private _res: IHttpResponse;
  private _stackIndex: number;
  private _subrouterIndex: number;
  private _parentParams: { [name: string]: any };
  private _done: INext;
  private _executedParams: string[];

  constructor(router: IRouter, req: IHttpRequest, res: IHttpResponse, done: INext) {
    this._router = router;
    this._req = req;
    this._res = res;
    this._stackIndex = 0;
    this._subrouterIndex = 0;
    this._parentParams = req.params;
    this._done =  restore(done, req, "basePath", "originalBasePath", "next", "params");
    this._executedParams = [];

    req.next = this.next.bind(this);
    req.originalBasePath = req.basePath || "";
    req.basePath = req.originalBasePath + (router.subpath || "");
  }

  public next(error?: Error): void {
    if (this._stackIndex < this._router.httpStack.length) {
      // Process from stack
      const layer: IHttpLayer = this.findNextLayer();

      if (!layer) {
        // If no layer found, call next again to process subrouters or finalize
        this.next(error);
      } else if (error && !layer.isErrorHandler()) {
        // We process only error handlers if there is an error
        this.next(error);
      } else {
        this._req.route = layer.route;
        const layerParams = layer.parsePathParameters(this._req.path);
        this._req.params = mergeParams(layerParams, this._parentParams);

        this._router.httpProcessParams(layerParams, this._executedParams, this._req, this._res, (paramsError) => {
          if (paramsError) {
            this.next(paramsError);
          } else {
            layer.handle(this._req, this._res, this.next.bind(this), error);
          }
        });
      }
    } else if (this._subrouterIndex < this._router.subrouters.length) {
      // Process from subrouters
      const subrouter: IRouter = this.findNextSubrouter();

      if (!subrouter) {
        // If no subrouter found, call next again to finalize
        this.next(error);
      } else {
        // Process the subrouter and come back to this executor
        // to process a new subrouter o to finalize
        subrouter.httpHandle(this._req, this._res, this.next.bind(this));
      }
    } else {
      // Finalize
      setImmediate(this._done, error);
    }
  }

  private findNextLayer(): IHttpLayer {
    let result: IHttpLayer = null;
    while (this._stackIndex < this._router.httpStack.length) {
      const layer: IHttpLayer = this._router.httpStack[this._stackIndex];
      this._stackIndex += 1;

      if (layer.match(this._req.path)) {
        const route = layer.route;

        // Check methods for routes
        if (!route || route.hasMethod(this._req.method)) {
          result = layer;
          break;
        }
      }
    }

    return result;
  }

  private findNextSubrouter(): IRouter {
    let result: IRouter = null;
    while (this._subrouterIndex < this._router.subrouters.length) {
      const subrouter: IRouter = this._router.subrouters[this._subrouterIndex];
      this._subrouterIndex += 1;

      if (subrouter.fullSubpath == null || this._req.path.startsWith(subrouter.fullSubpath)) {
        result = subrouter;
        break;
      }
    }
    return result;
  }

}
