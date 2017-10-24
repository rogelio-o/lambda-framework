/**
 * This class execute all the layers for an incoming request.
 */
export default interface IHttpRouterExecutor {

  next(error?: Error): void;

}
