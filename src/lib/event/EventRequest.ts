import IEventRequest from "./../types/event/IEventRequest";
import INext from "./../types/INext";
import IRawEvent from "./../types/IRawEvent";

/**
 * It represents an incoming event.
 */
export default class EventRequest implements IEventRequest {

  public next: INext;
  public processed: boolean;

  private _event: IRawEvent;
  private _context: { [name: string]: any };

  constructor(event: IRawEvent) {
    this.processed = false;
    this._event = event;
    this._context = {};
  }

  get event(): any {
    return this._event;
  }

  get eventType(): string {
    return this._event.type;
  }

  get context(): { [name: string]: any } {
    return this._context;
  }

}
