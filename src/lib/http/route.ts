import IHttpRoute from '../types/http-route'
import IHttpHandler from '../types/http-handler'
import IHttpRequest from '../types/http-request'
import IHttpResponse from '../types/http-response'
import INext from '../types/next'
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

export default class HttpRoute implements IHttpRoute {

  private _methods: Array<string>;
  private _regexp: RegExp;
  private _keys: Key[];

  private _regexpFastStar: boolean;
  private _regexpFastSlash: boolean;


  constructor(regexp: string, regexOptions?: RegExpOptions) {
    const opts = regexOptions || {};

    this._methods = [];
    this._keys = [];
    this._regexp = pathToRegexp(regexp, this._keys, opts);

    this._regexpFastStar = regexp === '*';
    this._regexpFastSlash = regexp === '/' && opts.end === false;
  }

  get regexp(): RegExp {
    return this._regexp;
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

  dispatch(req: IHttpRequest, res: IHttpResponse, next: INext): void {
    // TODO
  }

  get(IHttpHandler): IHttpRoute {
    // TODO

    return this;
  }

  put(IHttpHandler): IHttpRoute {
    // TODO

    return this;
  }

  delete(IHttpHandler): IHttpRoute {
    // TODO

    return this;
  }

  post(IHttpHandler): IHttpRoute {
    // TODO

    return this;
  }

  all(IHttpHandler): IHttpRoute {
    // TODO

    return this;
  }

}
