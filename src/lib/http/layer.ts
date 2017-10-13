import IHttpHandler from './../types/http-handler'
import IHttpLayer from './../types/http-layer'
import IHttpRoute from './../types/http-route'
import IHttpRequest from './../types/http-request'
import IHttpResponse from './../types/http-response'
import INext from './../types/next'
import { Key, RegExpOptions } from 'path-to-regexp'
const pathToRegexp = require('path-to-regexp')
import HttpError from './../exceptions/http-error'

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

  private _path: string
  private _options: {}
  private _handler: IHttpHandler

  route: IHttpRoute

  private _regexp: RegExp;
  private _keys: Key[];

  private _regexpFastStar: boolean;
  private _regexpFastSlash: boolean;

  constructor(path: string, options: {}, handler?: IHttpHandler, regexOptions?: RegExpOptions) {
    this._path = path
    this._options = options
    this._handler = handler

    const opts = regexOptions || {};
    this._keys = [];
    this._regexp = pathToRegexp(path, this._keys, opts);

    this._regexpFastStar = path === '*';
    this._regexpFastSlash = path === '/' && opts.end === false;
  }

  match(path: string): boolean {
    return this._regexp.test(path);
  }

  parsePathParameters(path: string): { [name: string]: string } {
    if (path != null) {
      // fast path non-ending match for / (any path matches)
      if (this._regexpFastSlash) {
        return {};
      }

      // fast path for * (everything matched in a param)
      if (this._regexpFastStar) {
        return {'0': decode_param(path)}
      }

      // match the path
      const match = this._regexp.exec(path)

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
    return !this.route && this._handler && this._handler.length == 4;
  }

}
