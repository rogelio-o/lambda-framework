import INext from "./../INext";
import IEventRequest from "./IEventRequest";

/**
 * A event router layer to be executed over an event request.
 */
export default interface IEventLayer {

  match(req: IEventRequest): boolean;

  handle(req: IEventRequest, next: INext, error?: Error): void;

  isErrorHandler(): boolean;

}
