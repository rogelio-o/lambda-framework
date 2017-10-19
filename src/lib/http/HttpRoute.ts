import IHttpHandler from "../types/http/IHttpHandler";
import IHttpLayer from "../types/http/IHttpLayer";
import IHttpRequest from "../types/http/IHttpRequest";
import IHttpResponse from "../types/http/IHttpResponse";
import IHttpRoute from "../types/http/IHttpRoute";
import INext from "../types/INext";

/**
 * This class represents a route to be handled.
 */
export default class HttpRoute implements IHttpRoute {

  private _layer: IHttpLayer;

  private _handlers: {[name: string]: IHttpHandler};

  constructor(layer: IHttpLayer) {
    this._handlers = {};
    this._layer = layer;
  }

  get layer(): IHttpLayer {
    return this._layer;
  }

  public hasMethod(method: string): boolean {
    method = method ? method.toLowerCase() : "";
    return this._handlers._all !== undefined || this._handlers[method] !== undefined;
  }

  public dispatch(req: IHttpRequest, res: IHttpResponse, next: INext): void {
    const method = req.method ? req.method.toLowerCase() : "";
    if (this._handlers[method]) {
      this._handlers[method](req, res, next);
    } else if (this._handlers._all) {
      this._handlers._all(req, res, next);
    } else {
      next();
    }
  }

  public get(handler: IHttpHandler): IHttpRoute {
    this._handlers.get = handler;

    return this;
  }

  public put(handler: IHttpHandler): IHttpRoute {
    this._handlers.put = handler;

    return this;
  }

  public delete(handler: IHttpHandler): IHttpRoute {
    this._handlers.delete = handler;

    return this;
  }

  public post(handler: IHttpHandler): IHttpRoute {
    this._handlers.post = handler;

    return this;
  }

  public all(handler: IHttpHandler): IHttpRoute {
    this._handlers._all = handler;

    return this;
  }

}
