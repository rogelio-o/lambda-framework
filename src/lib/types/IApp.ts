import IEventHandler from "./event/IEventHandler";
import IEventRoutePredicate from "./event/IEventRoutePredicate";
import IHttpHandler from "./http/IHttpHandler";
import IHttpPlaceholderHandler from "./http/IHttpPlaceholderHandler";
import IHttpRoute from "./http/IHttpRoute";
import ITemplateRenderer from "./http/renderEngine/ITemplateRenderer";
import IRawCallback from "./IRawCallback";
import IRawEvent from "./IRawEvent";
import IRouter from "./IRouter";

/**
 * It stores the main router and the configuration parameters. Also,
 * it is the main door to start the process when the handler of the
 * lambda function is called.
 */
export default interface IApp {

  /**
   * Set to _true_ the configuration param `key`.
   *
   * @param {string} key
   */
  enable(key: string): void;

  /**
   * Set to _false_ the configuration param `key`.
   * @param {string} key
   */
  disable(key: string): void;

  /**
   * Set to `value` the configuration param `key`.
   *
   * @param {string} key
   * @param {any}    value
   */
  set(key: string, value: any): void;

  /**
   * Return the value of the configuration param `key`.
   *
   * @param  {string} key
   * @return {any}
   */
  get(key: string): any;

  /**
   * Handle an incoming lambda function.
   *
   * @param {any}      event
   * @param {Callback} callback
   */
  handle(event: IRawEvent, callback: IRawCallback): void;

  /**
   * Use the given handler, with optional path, defaulting to "/".
   *
   * Use (like `.all`) will run for any http METHOD, but it will not add
   * handlers for those methods so OPTIONS requests will not consider `.httpUse`
   * functions even if they could respond.
   *
   * @param  {string}              path
   * @param  {IHttpHandler[]} handlers
   * @return {IRouter}
   */
  use(handler: IHttpHandler|IHttpHandler[], path?: string): IApp;

  /**
   * Mount router in the given path. If no path is given, the default path
   * will be /. The path is applied only for HTTP routing.
   *
   * @param  {IRouter} router
   * @param  {string}  path
   * @return {IApp}
   */
  mount(router: IRouter, path?: string): IApp;

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
  param(name: string, handler: IHttpPlaceholderHandler): IApp;

  /**
   * Create a new HTTP route for the given path.
   *
   * @param  {string}     path
   * @param  {string}     method
   * @return {IHttpRoute}
   */
  route(path: string): IHttpRoute;

  /**
   * Use the given handler for the given event or for the event requests
   * which matches with the given predicate.
   *
   * @param  {string|IEventRoutePredicate} event
   * @param {IEventHandler} handler
   * @return {IEventRoute}
   */
  event(event: string|IEventRoutePredicate, handler: IEventHandler): IApp;

  /**
   * Add a render engine to be used in `IHttpResponse.request`.
   *
   * @param  {ITemplateRenderer}      renderer              The function to render the template
   *                                                        file with the params.
   * @param  {{[name: string]: any}}  engineConfiguration   Conf params that will be passed to template
   *                                                        renderer in each call.
   * @return {IRouter}
   */
  addTemplateEngine(renderer: ITemplateRenderer, engineConfiguration?: {[name: string]: any}): IApp;

}
