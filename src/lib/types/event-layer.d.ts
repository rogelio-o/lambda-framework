import IEventRoutePredicate from './event-route-predicate'
import IEventHandler from './event-handler'
import IEventRequest from './event-request'

export default interface IEventLayer {

  match(req: IEventRequest): boolean

}
