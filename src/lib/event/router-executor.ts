import IEventRouterExecutor from './../types/event-router-executor'
import IRouter from './../types/router'
import IEventRequest from './../types/event-request'
import INext from './../types/next'
import IEventLayer from './../types/event-layer'

function restore(fn: INext, req: IEventRequest, ...params: string[]) {
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

export default class EventRouterExecutor implements IEventRouterExecutor {

  private _router:IRouter
  private _req:IEventRequest
  private _stackIndex:number
  private _subrouterIndex:number
  private _done:INext

  constructor(router: IRouter, req:IEventRequest, done:INext) {
    this._router = router;
    this._stackIndex = 0;
    this._subrouterIndex = 0;
    this._done =  restore(done, req, 'next');

    req.next = this.next
  }

  private _findNextLayer():IEventLayer {
    let result:IEventLayer = null;
    while(this._stackIndex < this._router.eventStack.length) {
      let layer:IEventLayer = this._router.eventStack[this._stackIndex];
      this._stackIndex++;

      if(layer.match(this._req)) {
        result = layer;
        break;
      }
    }

    return result;
  }

  private _findNextSubrouter():IRouter {
    let result:IRouter = null;
    while(this._subrouterIndex < this._router.subrouters.length) {
      let subrouter:IRouter = this._router.subrouters[this._subrouterIndex];
      this._subrouterIndex++;

      if(subrouter.eventStack.length > 0) {
        result = subrouter;
        break;
      }
    }
    return result;
  }

  next(error?: Error): void {
    if(this._stackIndex < this._router.eventStack.length) {
      // Process from stack
      const layer:IEventLayer = this._findNextLayer();

      if(!layer) {
        // If no layer found, call next again to process subrouters or finalize
        this.next(error);
      } else if(error && !layer.isErrorHandler()) {
        // We process only error handlers if there is an error
        this.next(error);
      } else {
        layer.handle(this._req, this.next, error);
      }
    } else if(this._subrouterIndex < this._router.subrouters.length) {
      // Process from subrouters
      const subrouter:IRouter = this._findNextSubrouter();

      if(!subrouter) {
        // If no subrouter found, call next again to finalize
        this.next(error);
      } else {
        // Process the subrouter and come back to this executor
        // to process a new subrouter o to finalize
        subrouter.eventHandle(this._req, this.next);
      }
    } else {
      // Finalize
      setImmediate(this._done, error);
    }
  }

}
