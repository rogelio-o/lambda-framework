import * as fs from "fs";
import configuration from "./configuration/configuration";
import defaultConfiguration from "./configuration/defaultConfiguration";
import eventFinalHandler from "./event/eventFinalHandler";
import EventRequest from "./event/EventRequest";
import HttpError from "./exceptions/HttpError";
import httpFinalHandler from "./http/httpFinalHandler";
import HttpRequest from "./http/HttpRequest";
import HttpResponse from "./http/HttpResponse";
import Router from "./Router";
import IEventHandler from "./types/event/IEventHandler";
import IEventRequest from "./types/event/IEventRequest";
import IEventRoutePredicate from "./types/event/IEventRoutePredicate";
import IHttpHandler from "./types/http/IHttpHandler";
import IHttpPlaceholderHandler from "./types/http/IHttpPlaceholderHandler";
import IHttpRequest from "./types/http/IHttpRequest";
import IHttpResponse from "./types/http/IHttpResponse";
import IHttpRoute from "./types/http/IHttpRoute";
import ITemplateRenderer from "./types/http/renderEngine/ITemplateRenderer";
import IApp from "./types/IApp";
import IRawCallback from "./types/IRawCallback";
import IRawEvent from "./types/IRawEvent";
import IRouter from "./types/IRouter";

/**
 * The main object that describes and configures the lambda application.
 */
export default class App implements IApp {

  private _settings: object;
  private _router: IRouter;

  constructor(settings?: object) {
    this._settings = {};
    this.initEnvConfiguration();
    this.initParamsConfiguration(settings);
    this.initEnvFileConfiguration();
    this.initDefaultFileConfiguration();
    this.initDefaultConfiguration();

    this._router = new Router({
      subpath: this.get(configuration.PATH_CONTEXT)
    });
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

  public handle(event: IRawEvent, callback: IRawCallback): void {
    if (event.isHttp) {
      const req: IHttpRequest = new HttpRequest(this, event);
      const res: IHttpResponse = new HttpResponse(this, req, callback);
      const done = httpFinalHandler(req, res, {
        env: this.get(configuration.ENVIRONMENT),
        onerror: this.logError.bind(this, req)
      });
      this._router.httpHandle(req, res, done);
    } else {
      const req: IEventRequest = new EventRequest(event);
      const done = eventFinalHandler(req, callback, {
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

  public addTemplateEngine(renderer: ITemplateRenderer, engineConfiguration?: {[name: string]: any}): IApp {
    this._router.addTemplateEngine(renderer, engineConfiguration);

    return this;
  }

  private initEnvConfiguration(): void {
    const settings = {};

    for (const key of Object.keys(process.env)) {
      settings[key] = process.env[key];
    }

    this.initConfiguration(settings);
  }

  private initParamsConfiguration(settings: {[name: string]: any}): void {
    this.initConfiguration(settings);
  }

  private initEnvFileConfiguration(): void {
    const env = this.get(configuration.ENVIRONMENT);

    if (env) {
      this.initFileConfiguration(env);
    }
  }

  private initDefaultFileConfiguration(): void {
    this.initFileConfiguration("application");
  }

  private initFileConfiguration(fileName: string): void {
    const path = process.env.PWD + "/conf/" + fileName + ".json";

    if (fs.existsSync(path)) {
      const rawSetting = fs.readFileSync(path, "utf8");
      this.initConfiguration(JSON.parse(rawSetting));
    }
  }

  private initDefaultConfiguration(): void {
    this.initConfiguration(defaultConfiguration);
  }

  private initConfiguration(settings: {[name: string]: any}): void {
    if (settings) {
      for (const key of Object.keys(settings)) {
        if (!this._settings[key]) {
          this._settings[key] = settings[key];
        }
      }
    }
  }

  private logError(req: IHttpRequest|IEventRequest, err: Error): void {
    /* istanbul ignore next */
    if (this.get(configuration.ENVIRONMENT) !== "test") {
      if (err) {
        console.error(err instanceof HttpError ? err.cause.message : err.message);
      } else {
        if (req instanceof EventRequest) {
          if (!req.processed) {
            console.log("No handlers for " + JSON.stringify(req.event.original));
          }
        } else if (req instanceof HttpRequest) {
          console.log("No handlers for " + req.method + " " + req.path);
        } else {
          console.log("No handlers found.");
        }
      }
    }
  }

}
