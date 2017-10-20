import IEventRequest from "./../types/event/IEventRequest";
import INext from "./../types/INext";
import { getEventType } from "./../utils/utils";

/**
 * It represents an incoming event.
 */
export default class EventRequest implements IEventRequest {

  public next: INext;

  private _event: any;
  private _context: { [name: string]: any };

  constructor(event: any) {
    this._event = event;
    this._context = {};
  }

  get event(): any {
    return this._event;
  }

  get eventType(): string {
    return getEventType(this._event);
  }

  get context(): { [name: string]: any } {
    return this._context;
  }

}
