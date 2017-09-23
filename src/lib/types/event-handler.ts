import IEventRequest from './event-request'
import INext from './next'

export default interface IEventHandler {
    (req: IEventRequest, next: INext): void;
}
