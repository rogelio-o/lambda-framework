import IEventRequest from "./IEventRequest";

/**
 * A predicated to test an incoming event to know if it
 * have to be processed by the layer.
 */
type IEventRoutePredicate = (req: IEventRequest) => boolean;
export default IEventRoutePredicate;
