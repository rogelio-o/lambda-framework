import IEventRequest from './../types/event-request'
import { getEventType } from './../utils/utils'
import INext from './../types/next'

export default class EventRequest implements IEventRequest {

  private _event: any;

  next: INext

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
