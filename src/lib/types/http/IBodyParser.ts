import IHttpHandler from "./IHttpHandler";

/**
 * A layer that set the request body depending of its type.
 */
export default interface IBodyParser {

  create(): IHttpHandler;

}
