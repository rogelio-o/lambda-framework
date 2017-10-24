import INext from "./../INext";
import IHttpHandler from "./IHttpHandler";
import IHttpLayer from "./IHttpLayer";
import IHttpRequest from "./IHttpRequest";
import IHttpResponse from "./IHttpResponse";

/**
 * This class represents a route to be handled.
 */
export default interface IHttpRoute {

  readonly layer: IHttpLayer;

  hasMethod(method: string): boolean;

  dispatch(req: IHttpRequest, res: IHttpResponse, next: INext): void;

  get(handler: IHttpHandler): IHttpRoute;

  put(handler: IHttpHandler): IHttpRoute;

  delete(handler: IHttpHandler): IHttpRoute;

  post(handler: IHttpHandler): IHttpRoute;

  all(handler: IHttpHandler): IHttpRoute;

}
