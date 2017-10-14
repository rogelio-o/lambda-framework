import IEventHandler from './../types/event-handler'
import IEventLayer from './../types/event-layer'
import IEventRequest from './../types/event-request'
import IEventRoutePredicate from './../types/event-route-predicate'
import INext from './../types/next'

export default class EventLayer implements IEventLayer {

  private _event: string|IEventRoutePredicate
  private _options: {}
  private _handler: IEventHandler

  constructor(event: string|IEventRoutePredicate, options: {}, handler: IEventHandler) {
    this._event = event
    this._options = options
    this._handler = handler
  }

  match(req: IEventRequest): boolean {
    if(typeof this._event === 'string') {
      return this._event === req.eventType
    } else {
      return this._event(req)
    }
  }

  handle(req: IEventRequest, next: INext, error: Error) {
    if(this._handler) {
      this._handler(req, next, error);
    } else {
      next(error);
    }
  }

  isErrorHandler() {
    return this._handler != null && this._handler.length == 3;
  }

}
