import INext from "./../INext";
import IHttpRequest from "./IHttpRequest";
import IHttpResponse from "./IHttpResponse";

/**
 * A handler that is executed over a layer.
 */
type IHttpHandler = (req: IHttpRequest, res: IHttpResponse, next?: INext, error?: Error) => void;
export default IHttpHandler;
