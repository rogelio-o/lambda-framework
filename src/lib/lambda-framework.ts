import IApp from './types/app'
import IRouter from './types/router'
import Router from './router'
import defaultConfiguration from './configuration/default-configuration'
import IHttpHandler from './types/http-handler'
import IHttpPlaceholderHandler from './types/http-placeholder-handler'
import IHttpRoute from './types/http-route'
import IEventHandler from './types/event-handler'
import IEventRoutePredicate from './types/event-route-predicate'
import IHttpRequest from './types/http-request'
import IEventRequest from './types/event-request'
import IHttpResponse from './types/http-response'
import HttpRequest from './http/request'
import HttpResponse from './http/response'
import EventRequest from './event/request'
import httpFinalHandler from './http/final-handler'
import eventFinalHandler from './event/final-handler'
import Configuration from './configuration/configuration'
import HttpError from './exceptions/http-error'
import { getEventType } from './utils/utils'
import { Context, Callback, APIGatewayEvent } from 'aws-lambda'

export default class App implements IApp {

  private _settings: object

  private _router: IRouter

  constructor() {
    this._settings = {}
    this._router = new Router();
  }

  init(settings?: object):void {
    this._initDefaultConfiguration(settings);
  }

  /* configuration */

  private _initDefaultConfiguration(settings: object):void {
    this._settings = settings ? settings : defaultConfiguration
  }

  enable(key: string): void {
    this._settings[key] = true;
  }

  disable(key: string): void {
    this._settings[key] = false;
  }

  set(key: string, value: any): void {
    this._settings[key] = value;
  }

  get(key: string): any {
    return this._settings[key]
  }

  /* Router */

  private _logError(err: Error): void {
    /* istanbul ignore next */
    if (this.get(Configuration.ENVIRONMENT) !== 'test') {
      console.error(err instanceof HttpError ? err.cause.message : err.message);
    }
  }

  handle(event: any, context: Context, callback?: Callback): void {
    const type = getEventType(event)
    if(type === 'APIGatewayEvent') {
      const req: IHttpRequest = new HttpRequest(this, event, null) // TODO
      const res: IHttpResponse = new HttpResponse(this, req, callback)
      const done = httpFinalHandler(req, res, {
        env: this.get(Configuration.ENVIRONMENT),
        onerror: this._logError
      })
      this._router.httpHandle(req, res, done)
    } else {
      const req: IEventRequest = new EventRequest(event)
      const done = eventFinalHandler(req, {
        env: this.get(Configuration.ENVIRONMENT),
        onerror: this._logError
      })
      this._router.eventHandle(req, done)
    }
  }

  use(path?: string, ...handler: Array<IHttpHandler>): IApp {
    this._router.use(handler, path)

    return this;
  }

  mount(router: IRouter, path?: string): IApp {
    this._router.mount(router, path)

    return this;
  }

  param(name: string, handler: IHttpPlaceholderHandler): IApp {
    this._router.param(name, handler)

    return this;
  }

  route(path: string): IHttpRoute {
    return this._router.route(path);
  }

  event(event: string|IEventRoutePredicate, handler: IEventHandler): IApp {
    this._router.event(event, handler)

    return this;
  }

}
