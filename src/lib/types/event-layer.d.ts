import IEventRoutePredicate from './event-route-predicate'
import IEventHandler from './event-handler'
import IEventRequest from './event-request'
import INext from './next'

export default interface IEventLayer {

  match(req: IEventRequest): boolean

  handle(req: IEventRequest, next: INext, error?: Error): void

  isErrorHandler(): boolean

}
