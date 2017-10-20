import IEventHandler from "./../types/event/IEventHandler";
import IEventLayer from "./../types/event/IEventLayer";
import IEventRequest from "./../types/event/IEventRequest";
import IEventRoutePredicate from "./../types/event/IEventRoutePredicate";
import INext from "./../types/INext";

/**
 * A event router layer to be executed over an event request.
 */
export default class EventLayer implements IEventLayer {

  private _event: string|IEventRoutePredicate;
  private _options: {};
  private _handler: IEventHandler;

  constructor(event: string|IEventRoutePredicate, options: {}, handler: IEventHandler) {
    this._event = event;
    this._options = options;
    this._handler = handler;
  }

  public match(req: IEventRequest): boolean {
    if (typeof this._event === "string") {
      return this._event === req.eventType;
    } else {
      return this._event(req);
    }
  }

  public handle(req: IEventRequest, next: INext, error: Error): void {
    if (this._handler) {
      this._handler(req, next, error);
    } else {
      next(error);
    }
  }

  public isErrorHandler(): boolean {
    return this._handler != null && this._handler.length === 3;
  }

}
