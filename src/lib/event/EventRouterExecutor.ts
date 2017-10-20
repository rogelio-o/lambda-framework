import IEventLayer from "./../types/event/IEventLayer";
import IEventRequest from "./../types/event/IEventRequest";
import IEventRouterExecutor from "./../types/event/IEventRouterExecutor";
import INext from "./../types/INext";
import IRouter from "./../types/IRouter";

function restore(fn: INext, req: IEventRequest, ...params: string[]): INext {
  const vals = [];

  for (let i = 0; i < params.length; i += 1 ) {
    vals[i] = req[params[i]];
  }

  return (err?: Error): void => {
    // restore vals
    for (let i = 0; i < params.length; i += 1 ) {
      req[params[i]] = vals[i];
    }

    fn(err);
  };
}

/**
 * This class execute all the layers for an incoming event.
 */
export default class EventRouterExecutor implements IEventRouterExecutor {

  private _router: IRouter;
  private _req: IEventRequest;
  private _stackIndex: number;
  private _subrouterIndex: number;
  private _done: INext;

  constructor(router: IRouter, req: IEventRequest, done: INext) {
    this._router = router;
    this._req = req;
    this._stackIndex = 0;
    this._subrouterIndex = 0;
    this._done =  restore(done, req,  "next ");

    req.next = this.next;
  }

  public next(error?: Error): void {
    if (this._stackIndex < this._router.eventStack.length) {
      // Process from stack
      const layer: IEventLayer = this.findNextLayer();

      if (!layer) {
        // If no layer found, call next again to process subrouters or finalize
        this.next(error);
      } else if (error && !layer.isErrorHandler()) {
        // We process only error handlers if there is an error
        this.next(error);
      } else {
        layer.handle(this._req, this.next.bind(this), error);
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
        subrouter.eventHandle(this._req, this.next.bind(this));
      }
    } else {
      // Finalize
      setImmediate(this._done, error);
    }
  }

  private findNextLayer(): IEventLayer {
    let result: IEventLayer = null;
    while (this._stackIndex < this._router.eventStack.length) {
      const layer: IEventLayer = this._router.eventStack[this._stackIndex];
      this._stackIndex += 1 ;

      if (layer.match(this._req)) {
        result = layer;
        break;
      }
    }

    return result;
  }

  private findNextSubrouter(): IRouter {
    let result: IRouter = null;
    while (this._subrouterIndex < this._router.subrouters.length) {
      const subrouter: IRouter = this._router.subrouters[this._subrouterIndex];
      this._subrouterIndex += 1 ;

      if (subrouter.eventStack.length > 0) {
        result = subrouter;
        break;
      }
    }
    return result;
  }

}
