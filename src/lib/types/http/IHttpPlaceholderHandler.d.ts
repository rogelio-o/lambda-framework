import INext from "./../INext";
import IHttpRequest from "./IHttpRequest";
import IHttpResponse from "./IHttpResponse";

/**
 * A handler for when a param appears in the request path.
 */
type IHttpPlaceholderHandler = (req: IHttpRequest, res: IHttpResponse, next: INext, placeholderValue: any) => void;

export default IHttpPlaceholderHandler;
