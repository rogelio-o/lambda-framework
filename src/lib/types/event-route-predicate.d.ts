import IEventRequest from './event-request'

export default interface IEventRoutePredicate {
    (req: IEventRequest): boolean;
}
