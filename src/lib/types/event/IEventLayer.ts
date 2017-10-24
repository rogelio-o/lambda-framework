import INext from "./../INext";
import IEventHandler from "./IEventHandler";
import IEventRequest from "./IEventRequest";
import IEventRoutePredicate from "./IEventRoutePredicate";

/**
 * A event router layer to be executed over an event request.
 */
export default interface IEventLayer {

  match(req: IEventRequest): boolean;

  handle(req: IEventRequest, next: INext, error?: Error): void;

  isErrorHandler(): boolean;

}
