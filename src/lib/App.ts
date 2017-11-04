import { Callback, Context } from "aws-lambda";
import configuration from "./configuration/configuration";
import defaultConfiguration from "./configuration/defaultConfiguration";
import eventFinalHandler from "./event/eventFinalHandler";
import EventRequest from "./event/EventRequest";
import HttpError from "./exceptions/HttpError";
import httpFinalHandler from "./http/httpFinalHandler";
import HttpRequest from "./http/HttpRequest";
import HttpResponse from "./http/HttpResponse";
import DefaultTemplateLoader from "./http/renderEngine/DefaultTemplateLoader";
import TemplateEngine from "./http/renderEngine/TemplateEngine";
import Router from "./Router";
import IEventHandler from "./types/event/IEventHandler";
import IEventRequest from "./types/event/IEventRequest";
import IEventRoutePredicate from "./types/event/IEventRoutePredicate";
import IHttpHandler from "./types/http/IHttpHandler";
import IHttpPlaceholderHandler from "./types/http/IHttpPlaceholderHandler";
import IHttpRequest from "./types/http/IHttpRequest";
import IHttpResponse from "./types/http/IHttpResponse";
import IHttpRoute from "./types/http/IHttpRoute";
import ITemplateEngine from "./types/http/renderEngine/ITemplateEngine";
import ITemplateLoader from "./types/http/renderEngine/ITemplateLoader";
import ITemplateRenderer from "./types/http/renderEngine/ITemplateRenderer";
import IApp from "./types/IApp";
import IRouter from "./types/IRouter";
import { getEventType } from "./utils/utils";

/**
 * The main object that describes and configures the lambda application.
 */
export default class App implements IApp {

  private _settings: object;
  private _router: IRouter;
  private _templateEngine: ITemplateEngine;

  constructor() {
    this._settings = {};
    this._router = new Router();
  }

  get templateEngine(): ITemplateEngine {
    return this._templateEngine;
  }

  get templateLoader(): ITemplateLoader {
    return this._templateEngine ? this._templateEngine.loader : null;
  }

  public init(settings?: object): void {
    this.initDefaultConfiguration(settings);
  }

  public enable(key: string): void {
    this._settings[key] = true;
  }

  public disable(key: string): void {
    this._settings[key] = false;
  }

  public set(key: string, value: any): void {
    this._settings[key] = value;
  }

  public get(key: string): any {
    return this._settings[key];
  }

  public handle(event: any, context: Context, callback?: Callback): void {
    const eventType = getEventType(event);
    if (eventType === "APIGatewayEvent") {
      const req: IHttpRequest = new HttpRequest(event);
      const res: IHttpResponse = new HttpResponse(this, req, callback);
      const done = httpFinalHandler(req, res, {
        env: this.get(configuration.ENVIRONMENT),
        onerror: this.logError.bind(this, req)
      });
      this._router.httpHandle(req, res, done);
    } else {
      const req: IEventRequest = new EventRequest(event);
      const done = eventFinalHandler(req, {
        env: this.get(configuration.ENVIRONMENT),
        onerror: this.logError.bind(this, req)
      });
      this._router.eventHandle(req, done);
    }
  }

  public use(handler: IHttpHandler|IHttpHandler[], path?: string): IApp {
    this._router.use(handler, path);

    return this;
  }

  public mount(router: IRouter, path?: string): IApp {
    this._router.mount(router, path);

    return this;
  }

  public param(name: string, handler: IHttpPlaceholderHandler): IApp {
    this._router.param(name, handler);

    return this;
  }

  public route(path: string): IHttpRoute {
    return this._router.route(path);
  }

  public event(event: string|IEventRoutePredicate, handler: IEventHandler): IApp {
    this._router.event(event, handler);

    return this;
  }

  public addTemplateEngine(bucket: string, renderer: ITemplateRenderer, ttl?: number): IApp {
    const templateLoader: ITemplateLoader = new DefaultTemplateLoader(bucket, ttl);
    this._templateEngine = new TemplateEngine(bucket, renderer, templateLoader);

    return this;
  }

  private initDefaultConfiguration(settings: object): void {
    this._settings = settings ? settings : defaultConfiguration;
  }

  private logError(req: IHttpRequest|IEventRequest, err: Error): void {
    /* istanbul ignore next */
    if (this.get(configuration.ENVIRONMENT) !== "test") {
      if (err) {
        console.error(err instanceof HttpError ? err.cause.message : err.message);
      } else {
        if (req instanceof EventRequest) {
          console.log("No handlers for " + JSON.parse(req.event));
        } else if (req instanceof HttpRequest) {
          console.log("No handlers for " + req.method + " " + req.path);
        } else {
          console.log("No handlers found.");
        }
      }
    }
  }

}
