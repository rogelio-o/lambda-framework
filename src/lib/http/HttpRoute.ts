import IHttpRoute from '../types/http/IHttpRoute'
import IHttpHandler from '../types/http/IHttpHandler'
import IHttpRequest from '../types/http/IHttpRequest'
import IHttpLayer from '../types/http/IHttpLayer'
import IHttpResponse from '../types/http/IHttpResponse'
import INext from '../types/INext'

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

  hasMethod(method: string): boolean {
    method = method ? method.toLowerCase() : '';
    return this._handlers._all !== undefined || this._handlers[method] !== undefined;
  }

  dispatch(req: IHttpRequest, res: IHttpResponse, next: INext): void {
    const method = req.method ? req.method.toLowerCase() : '';
    if(this._handlers[method]) {
      this._handlers[method](req, res, next);
    } else if(this._handlers._all) {
      this._handlers._all(req, res, next);
    } else {
      next();
    }
  }

  get(handler: IHttpHandler): IHttpRoute {
    this._handlers.get = handler;

    return this;
  }

  put(handler: IHttpHandler): IHttpRoute {
    this._handlers.put = handler;

    return this;
  }

  delete(handler: IHttpHandler): IHttpRoute {
    this._handlers.delete = handler;

    return this;
  }

  post(handler: IHttpHandler): IHttpRoute {
    this._handlers.post = handler;

    return this;
  }

  all(handler: IHttpHandler): IHttpRoute {
    this._handlers._all = handler;

    return this;
  }

}
