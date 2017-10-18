import INext from "./../INext";
import IEventRequest from "./IEventRequest";

/**
 * It represents the function that a layer will be run over an event request.
 */
type IEventHandler = (req: IEventRequest, next?: INext, error?: Error) => void;
export default IEventHandler;
