import IHttpPlaceholderHandler from './http-placeholder-handler'
import IHttpHandler from './http-handler'
import IHttpRoute from './http-route'
import IHttpRequest from './http-request'
import IHttpResponse from './http-response'
import IEventRequest from './event-request'
import INext from './next'
import IEventHandler from './event-handler'
import IEventRoutePredicate from './event-route-predicate'
import IApp from './app'
import IHttpLayer from './http-layer'
import IEventLayer from './event-layer'

export default interface IRouter {

  readonly httpStack: Array<IHttpLayer>

  readonly eventStack: Array<IEventLayer>

  readonly subrouters: Array<IRouter>

  /**
   * Get the indicated subpath for the router when
   * it is done a subrouter. If it is not a subrouter,
   * the subpath will be null.
   */
  readonly subpath: string

  /**
   * Get the full subpath of the router, it is done
   * by the concadenation of each subpath of each router
   * from the begginig (root router) to the end.
   */
  readonly fullSubpath: string

  /**
   * Map the given param placeholder `name`(s) to the given callback.
   *
   * Parameter mapping is used to provide pre-conditions to HTTP routes
   * which use normalized placeholders. For example a _:user_id_ parameter
   * could automatically load a user's information from the database without
   * any additional code.
   *
   * The callback uses the same signature as middleware, the only difference
   * being that the value of the placeholder is passed, in this case the _id_
   * of the user. Once the `next()` function is invoked, just like middleware
   * it will continue on to execute the route, or subsequent parameter functions.
   *
   * @param  {string}       name
   * @param  {IHttpHandler} handler
   */
  param(name: string, handler: IHttpPlaceholderHandler): IRouter

  /**
   * Use the given handler, with optional path, defaulting to "/".
   *
   * Use (like `.all`) will run for any http METHOD, but it will not add
   * handlers for those methods so OPTIONS requests will not consider `.httpUse`
   * functions even if they could respond.
   *
   * @param  {string}              path
   * @param  {Array<IHttpHandler>} handlers
   * @return {IRouter}
   */
  use(handler: IHttpHandler|Array<IHttpHandler>, path?: string): IRouter

  /**
   * Mount router in the given path. If no path is given, the default path
   * will be /. The path is applied only for HTTP routing.
   *
   * @param  {IRouter} router
   * @param  {string}  path
   * @return {IApp}
   */
  mount(router: IRouter, path?: string): IRouter

  /**
   * Create a new HTTP route for the given path.
   *
   * @param  {string}     path
   * @param  {string}     method
   * @return {IHttpRoute}
   */
  route(path: string): IHttpRoute

  /**
   * Use the given handler for the given event or for the event requests
   * which matches with the given predicate.
   *
   * @param  {string|IEventRoutePredicate} event
   * @param {IEventHandler} handler
   * @return {IEventRoute}
   */
  event(event: string|IEventRoutePredicate, handler: IEventHandler): IRouter

  /**
   * Handle an incoming HTTP request.
   *
   * @param {IHttpRequest}  req
   * @param {IHttpResponse} res
   * @param {INext}         next
   */
  httpHandle(req: IHttpRequest, res: IHttpResponse, next: INext): void

  /*
  This method transform a router to a subrouter of the
  given subrouter in the given subpath.
   */
  doSubrouter(subpath: string, parent: IRouter)

  /**
   * Call the handlers added with the method _param_
   * for the params of the layer.
   *
   * @param { [name: string]: string }  layerParams
   * @param {IHttpRequest}  req
   * @param {IHttpResponse} res
   * @param {INext}         done
   */
  httpProcessParams(layerParams: { [name: string]: string }, executedParams: Array<string>, req: IHttpRequest, res: IHttpResponse, done: INext): void

  /**
   * Returns the available methods for the
   * given path.
   *
   * @param  {string}        path
   * @return {Array<string>}
   */
  getAvailableMethodsForPath(path: string): Array<string>

  /**
   * Handle an incoming event.
   *
   * @param {IEventRequest} req
   * @param {INext}         next
   */
  eventHandle(req: IEventRequest, next: INext): void

}
