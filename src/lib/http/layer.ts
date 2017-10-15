import IHttpHandler from './../types/http-handler'
import IHttpLayer from './../types/http-layer'
import IHttpRoute from './../types/http-route'
import IHttpRequest from './../types/http-request'
import IHttpResponse from './../types/http-response'
import INext from './../types/next'
import { Key, RegExpOptions } from 'path-to-regexp'
const pathToRegexp = require('path-to-regexp')
import HttpError from './../exceptions/http-error'
import IRouter from './../types/router'

function decode_param(val) {
  if (typeof val !== 'string' || val.length === 0) {
    return val;
  }

  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      const newErr = new HttpError('Failed to decode param \'' + val + '\'', 400, err);
      throw newErr;
    } else {
      throw err;
    }
  }
}

export default class HttpLayer implements IHttpLayer {

  private _router: IRouter
  private _path: string
  private _options: {}
  private _handler: IHttpHandler

  route: IHttpRoute

  private _regexp: RegExp;
  private _keys: Key[];

  private _regexpFastStar: boolean;
  private _regexpFastSlash: boolean;

  constructor(router: IRouter, path: string, options: {}, handler?: IHttpHandler, regexOptions?: RegExpOptions) {
    this._router = router
    this._path = path
    this._options = options
    this._handler = handler

    const opts = regexOptions || {};
    if(path) {
      this._keys = [];
      this._regexp = pathToRegexp(path, this._keys, opts);

      this._regexpFastStar = path === '*';
      this._regexpFastSlash = path === '/' && opts.end === false;
    }
  }

  match(path: string): boolean {
    let result: boolean = false

    if(this._regexp == null) {
      result = true;
    } else {
      const pathWithoutSubpath = this._getPathWithoutSubpath(path)
      if(pathWithoutSubpath) {
        result = this._regexp.test(pathWithoutSubpath);
      }
    }

    return result
  }

  private _getPathWithoutSubpath(path: string): string {
    let result = path
    const subpath = this._router.fullSubpath
    if(subpath) {
      if(!path.startsWith(subpath)) {
        result = null
      } else {
        result = path.slice(subpath.length)
      }
    }

    return result
  }

  parsePathParameters(path: string): { [name: string]: string } {
    if (path != null && this._path != null) {
      // fast path non-ending match for / (any path matches)
      if (this._regexpFastSlash) {
        return {};
      }

      // fast path for * (everything matched in a param)
      if (this._regexpFastStar) {
        return {'0': decode_param(path)}
      }

      const pathWithoutSubpath = this._getPathWithoutSubpath(path)
      if(!pathWithoutSubpath) {
        return {};
      }

      // match the path
      const match = this._regexp.exec(pathWithoutSubpath)

      // store values
      const params = {};

      var keys = this._keys;

      for (var i = 1; i < match.length; i++) {
        var key = keys[i - 1];
        var prop = key.name;
        var val = decode_param(match[i])

        if (val !== undefined) {
          params[prop] = val;
        }
      }

      return params;
    } else {
      return {};
    }
  }

  handle(req: IHttpRequest, res: IHttpResponse, next: INext, error?: Error): void {
    if(!this._handler) {
      if(!error && this.route) {
        this.route.dispatch(req, res, next)
      } else {
        next(error)
      }
    } else {
      const isErrorHandler = this.isErrorHandler();
      if((isErrorHandler && error) || !error) {
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

  isErrorHandler() {
    return !this.route && this._handler != null && this._handler.length == 4;
  }

}
