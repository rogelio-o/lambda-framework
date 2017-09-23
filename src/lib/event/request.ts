import IEventRequest from './../types/event-request'
import { getEventType } from './../utils/utils'

export default class EventRequest implements IEventRequest {

  private _event: any;

  constructor(event: any) {
    this._event = event;
  }

  get event(): any {
    return this._event
  }

  get eventType(): string {
    return getEventType(this._event)
  }

}
