import INext from "./../INext";
import IHttpHandler from "./IHttpHandler";
import IHttpRequest from "./IHttpRequest";
import IHttpResponse from "./IHttpResponse";
import IHttpRoute from "./IHttpRoute";

/**
 * A layer to be processed over a request.
 */
export default interface IHttpLayer {

  route: IHttpRoute;

  parsePathParameters(path: string): { [name: string]: string };

  match(path: string): boolean;

  handle(req: IHttpRequest, res: IHttpResponse, next: INext, error?: Error): void;

  isErrorHandler(): boolean;

}
