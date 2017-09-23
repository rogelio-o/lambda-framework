import IHttpHandler from './../types/http-handler'
import IHttpLayer from './../types/http-layer'
import IHttpRoute from './../types/http-route'
import IHttpRequest from './../types/http-request'
import IHttpResponse from './../types/http-response'
import INext from './../types/next'

export default class HttpLayer implements IHttpLayer {

  private _path: string
  private _options: {}
  private _handler: IHttpHandler

  route: IHttpRoute

  constructor(path: string, options: {}, handler: IHttpHandler) {
    this._path = path
    this._options = options
    this._handler = handler
  }

  match(path: string): boolean {
    // TODO
    return false;
  }

  handle(req: IHttpRequest, res: IHttpResponse, next: INext, error?: Error): void {
    if(!this._handler) {
      next(error)
    } else {
      const isErrorHandler = this._handler.length == 4;
      if((isErrorHandler && error) || (!isErrorHandler && !error)) {
        try {
          this._handler(req, res, next, error)
        } catch (err) {
          next(err)
        }
      } else {
        next(error)
      }
    }
  }

}
