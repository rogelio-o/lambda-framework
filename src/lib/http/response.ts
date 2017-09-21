import IHttpResponse from './../types/http-response'
import IHttpRequest from './../types/http-request'
import IApp from './../types/app'
import IHttpError from './../types/http-error'
import Configuration from './../configuration/configuration'
import { Callback } from 'aws-lambda'
import { setCharset } from './../utils/utils'
import { lookup } from 'mime-types'
var statuses = require('statuses')
var encodeUrl = require('encodeurl')
var escapeHtml = require('escape-html')
import HttpError from './../exceptions/http-error'
import { merge } from './../utils/utils'
import { sign } from 'cookie-signature'
import { parse, serialize } from 'cookie'

const normalizeType = (type: string): string => {
  return type.indexOf('/') === -1
    ? lookup(type)
    : type
}

export default class HttpResponse implements IHttpResponse {

  private _statusCode: number;
  private _app: IApp;
  private _request: IHttpRequest;
  private _callback: Callback;
  private _headers: { [name: string]: string|Array<string> };
  private _error: IHttpError;

  constructor(app: IApp, request: IHttpRequest, callback: Callback) {
    this._app = app;
    this._request = request;
    this._callback = callback;
    this._headers = {};
  }

  get statusCode(): number {
    return this._statusCode;
  }

  status(code: number): IHttpResponse {
    this._statusCode = code;

    return this;
  }

  private _end(body?: object|Buffer, encoding?: string) {
    const statusCode = this._statusCode || 200;
    const headers = this._headers;
    let resultBody;
    if(null != body) {
      if(Buffer.isBuffer(body)) {
        resultBody = body.toString(encoding);
      } else {
        resultBody = body;
      }
    }

    const error = this._error ? this._error.cause : null;
    this._callback(error, {statusCode, headers, body: resultBody});
  }

  send(body: string|number|boolean|object|Buffer): void {
    let chunk = body;
    let buff: Buffer;
    var encoding;
    var len;
    var type;

    switch (typeof chunk) {
      // string defaulting to html
      case 'string':
        if (!this.header('Content-Type')) {
          this.contentType('html');
        }
        break;
      case 'boolean':
      case 'number':
      case 'object':
        if (chunk === null) {
          chunk = '';
        } else if (Buffer.isBuffer(chunk)) {
          if (!this.header('Content-Type')) {
            this.putHeader('Content-Type', 'bin');
          }
        } else if(typeof chunk === 'object') {
          return this.json(chunk);
        }
      break;
    }

    // write strings in utf-8
    if (typeof chunk === 'string') {
      encoding = 'utf8';
      type = this.header('Content-Type');

      // reflect this in content-type
      if (typeof type === 'string') {
        this.putHeader('Content-Type', setCharset(type, 'utf-8'));
      }
    }

    // populate Content-Length
    if (chunk !== undefined) {
      if (!Buffer.isBuffer(chunk)) {
        // convert chunk to Buffer; saves later double conversions
        buff = new Buffer(chunk.toString(), encoding);
        chunk = buff;
        encoding = undefined;
      } else {
        buff = chunk;
      }

      len = buff.length;
      this.putHeader('Content-Length', len.toString());
    }

    // populate ETag
    let etag;
    var generateETag = len !== undefined && this._app.get(Configuration.ETAG_FN);
    if (typeof generateETag === 'function' && !this.header('ETag')) {
      if ((etag = generateETag(buff, encoding))) {
        this.putHeader('ETag', etag);
      }
    }

    // freshness
    if (this._request.fresh(this)) this._statusCode = 304;

    // strip irrelevant headers
    if (204 === this.statusCode || 304 === this.statusCode) {
      this.removeHeader('Content-Type');
      this.removeHeader('Content-Length');
      this.removeHeader('Transfer-Encoding');
      buff = new Buffer('', encoding);
    }

    if (this._request.method === 'HEAD') {
      // skip body for HEAD
      this._end();
    } else {
      // respond
      this._end(buff, encoding);
    }
  }

  json(obj: object): void {
    if (!this.header('Content-Type')) {
      this.putHeader('Content-Type', setCharset('application/json', 'utf-8'));
    }

    // content-length
    if (!this.header('Content-Length')) {
      this.putHeader('Content-Length', new Buffer(JSON.stringify(obj), 'utf-8').length.toString());
    }

    this._end(obj);
  }

  sendStatus(code: number): void {
    var body = statuses[code] || String(code);

    this._statusCode = code;
    this.contentType('txt');

    this.send(body);
  }

  contentType(type: string): IHttpResponse {
    const ct = normalizeType(type);

    this.putHeader('Content-Type', ct);

    return this;
  }

  format(obj: {[name: string]: Function}, next?: Function): IHttpResponse {
    const fn = obj.default;
    if (fn) delete obj.default;
    const keys = Object.keys(obj);

    const key = keys.length > 0
      ? this._request.accepts(keys)
      : false;

    if (key) {
      this.putHeader('Content-Type', normalizeType(key));
      obj[key](this._request, this, next);
    } else if (fn) {
      fn();
    } else {
      var err = new HttpError('Not Acceptable: ' + keys.map(o => normalizeType(o)).join(', '), 406);
      if(next) {
        next(err);
      } else {
        throw err;
      }
    }

    return this;
  }

  putHeader(field: string, value: string | Array<string>): IHttpResponse {
    this._headers[field] = value;

    return this;
  }

  putHeaders(field: object): IHttpResponse {
    for (var key in field) {
      this.putHeader(key, field[key]);
    }

    return this;
  }

  header(field: string): string | Array<string> {
    return this._headers[field];
  }

  appendHeader(field: string, value: string | Array<string>): IHttpResponse {
    const prev = this.header(field);

    if (prev) {
      // concat the new and prev vals
      if(Array.isArray(prev)) {
        if(Array.isArray(value)) {
          this.putHeader(field, prev.concat(value));
        } else {
          this.putHeader(field, prev.concat([value]));
        }
      } else {
        if(Array.isArray(value)) {
          this.putHeader(field, [prev].concat(value));
        } else {
          this.putHeader(field, [prev].concat([value]));
        }
      }

    } else {
      this.putHeader(field, value)
    }

    return this;
  }

  removeHeader(field: string): IHttpResponse {
    delete this._headers[field];

    return this;
  }

  addCookie(name: string, value: string|object, options?: object): IHttpResponse {
    const opts = merge({}, options);
    const secret = this._app.get(Configuration.COOKIE_SECRET);
    const signed = opts.signed;

    if (signed && !secret) {
      throw new Error('cookieParser("secret") required for signed cookies');
    }

    let val = typeof value === 'object'
      ? 'j:' + JSON.stringify(value)
      : String(value);

    if (signed) {
      val = 's:' + sign(val, secret);
    }

    if ('maxAge' in opts) {
      opts.expires = new Date(Date.now() + opts.maxAge);
      opts.maxAge /= 1000;
    }

    if (opts.path == null) {
      opts.path = '/';
    }

    this.appendHeader('Set-Cookie', serialize(name, String(val), opts));

    return this;
  }

  addCookies(obj: object, options?: object): IHttpResponse {
    for (var key in obj) {
      this.addCookie(key, obj[key], options);
    }

    return this;
  }

  clearCookie(name: string, options?: object): IHttpResponse {
    var opts = merge({ expires: new Date(1), path: '/' }, options);

    this.addCookie(name, '', opts);

    return this;
  }

  cookie(name: string): string {
    const cookiesHeader = this.header('Set-Cookie');

    const cookies = parse(Array.isArray(cookiesHeader) ?
      cookiesHeader.join('; ') : cookiesHeader
    );

    return cookies[name];
  }

  location(url: string): IHttpResponse {
    let loc = url;

    // "back" is an alias for the referrer
    if (url === 'back') {
      loc = this._request.header('Referrer') || '/';
    }

    // set location
    this.putHeader('Location', encodeUrl(loc));

    return this;
  }

  redirect(url: string, statusCode?: number): void {
    let address = url;
    const status = statusCode || 302;
    let body;

    address = this.location(address).header('Location').toString();

    this.format({
      text: () => {
        body = statuses[status] + '. Redirecting to ' + address
      },

      html: () => {
        const u = escapeHtml(address);
        body = '<p>' + statuses[status] + '. Redirecting to <a href="' + u + '">' + u + '</a></p>'
      },

      default: () => {
        body = '';
      }
    });

    // Respond
    this._statusCode = status;
    this.putHeader('Content-Length', Buffer.byteLength(body).toString());

    if (this._request.method === 'HEAD') {
      this._end();
    } else {
      this._end(body);
    }
  }

  render(view: string, options?: object, callback?: Function): void {
    // TODO
  }

  setError(error: IHttpError): IHttpResponse {
    this._error = error;

    return this;
  }

}
