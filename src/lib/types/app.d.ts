import IHttpPlaceholderHandler from './http-placeholder-handler'
import IHttpHandler from './http-handler'
import IHttpRoute from './http-route'
import IEventHandler from './event-handler'
import IEventRoutePredicate from './event-route-predicate'
import IRouter from './router'
import { Context, Callback } from 'aws-lambda'

export default interface IApp {

    /**
     * Initialize the framework with the configuration of `settings`. If
     * no `settings`are given, the framework is initialized with the
     * default configuration.
     *
     * @param {object} settings
     */
    init(settings?: object): void

    /**
     * Set to _true_ the configuration param `key`.
     *
     * @param {string} key
     */
    enable(key: string): void

    /**
     * Set to _false_ the configuration param `key`.
     * @param {string} key
     */
    disable(key: string): void

    /**
     * Set to `value` the configuration param `key`.
     *
     * @param {string} key
     * @param {any}    value
     */
    set(key: string, value: any): void

    /**
     * Return the value of the configuration param `key`.
     *
     * @param  {string} key
     * @return {any}
     */
    get(key: string): any

    /**
     * Handle an incoming lambda funciton.
     *
     * @param {any}      event
     * @param {Context}  context
     * @param {Callback} callback
     */
    handle(event: any, context: Context, callback?: Callback): void

    /**
     * Use the given handler, with optional path, defaulting to "/".
     *
     * Use (like `.all`) will run for any http METHOD, but it will not add
     * handlers for those methods so OPTIONS requests will not consider `.httpUse`
     * functions even if they could respond.
     *
     * @param  {string}              path
     * @param  {Array<IHttpHandler>} ...handler
     * @return {IRouter}
     */
    use(path?: string, ...handler: Array<IHttpHandler>): IApp

    /**
     * Mount router in the given path. If no path is given, the default path
     * will be /. The path is applied only for HTTP routing.
     *
     * @param  {IRouter} router
     * @param  {string}  path
     * @return {IApp}
     */
    mount(router: IRouter, path?: string): IApp

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
    param(name: string, handler: IHttpPlaceholderHandler): IApp

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
    event(event: string|IEventRoutePredicate, handler: IEventHandler): IApp

}
