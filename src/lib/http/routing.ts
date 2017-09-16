import IHttpRouting from '../types/http-routing'
import IHttpHandler from '../types/http-handler'
import { Key, RegExpOptions } from 'path-to-regexp'
import HttpError from './../exceptions/http-error'
const pathToRegexp = require('path-to-regexp')

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

export default class HttpRouting implements IHttpRouting {

  private _method: string;
  private _regexp: RegExp;
  private _keys: Key[];
  private _handler: IHttpHandler;

  private _regexpFastStar: boolean;
  private _regexpFastSlash: boolean;


  constructor(method: string, regexp: string, handler: IHttpHandler, regexOptions?: RegExpOptions) {
    const opts = regexOptions || {};

    this._method = method;
    this._keys = [];
    this._regexp = pathToRegexp(regexp, this._keys, opts);
    this._handler = handler;

    this._regexpFastStar = regexp === '*';
    this._regexpFastSlash = regexp === '/' && opts.end === false;
  }

  get method(): string {
    return this._method;
  }

  get regexp(): RegExp {
    return this._regexp;
  }

  get keys(): Key[] {
    return this._keys;
  }

  get handler(): IHttpHandler {
    return this._handler;
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
      const match = this.regexp.exec(path)

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

}
