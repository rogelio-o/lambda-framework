import { serialize } from "cookie";
import { sign } from "cookie-signature";
import * as encodeUrl from "encodeurl";
import * as escapeHtml from "escape-html";
import * as statuses from "statuses";
import configuration from "./../configuration/configuration";
import HttpError from "./../exceptions/HttpError";
import IHttpError from "./../types/exceptions/IHttpError";
import ICookie from "./../types/http/ICookie";
import IHttpHandler from "./../types/http/IHttpHandler";
import IHttpRequest from "./../types/http/IHttpRequest";
import IHttpResponse from "./../types/http/IHttpResponse";
import ITemplateEngine from "./../types/http/renderEngine/ITemplateEngine";
import IApp from "./../types/IApp";
import INext from "./../types/INext";
import IRawCallback from "./../types/IRawCallback";
import IRouter from "./../types/IRouter";
import { merge, normalizeType, setCharset, stringify } from "./../utils/utils";
import Cookie from "./Cookie";

/**
 * This class represents an HTTP response, with the helpers to be sent.
 */
export default class HttpResponse implements IHttpResponse {

  public router: IRouter;

  private _statusCode: number;
  private _app: IApp;
  private _request: IHttpRequest;
  private _callback: IRawCallback;
  private _headers: { [name: string]: string|string[] };
  private _error: IHttpError;
  private _isSent: boolean;
  private _cookies: { [name: string]: ICookie };

  constructor(app: IApp, request: IHttpRequest, callback: IRawCallback) {
    this._app = app;
    this._request = request;
    this._callback = callback;
    this._headers = {};
    this._isSent = false;
    this._cookies = {};
  }

  get statusCode(): number {
    return this._statusCode;
  }

  get isSent(): boolean {
    return this._isSent;
  }

  public status(code: number): IHttpResponse {
    this._statusCode = code;

    return this;
  }

  public send(body: string|number|boolean|object|Buffer): void {
    let chunk = body;
    let buff: Buffer;
    let encoding;
    let len;
    let type;

    switch (typeof chunk) {
      // string defaulting to html
      case "string":
        if (!this.header("Content-Type")) {
          this.contentType("html");
        }
        break;
      case "boolean":
      case "number":
      case "object":
        if (Buffer.isBuffer(chunk)) {
          if (!this.header("Content-Type")) {
            this.putHeader("Content-Type", "bin");
          }
        } else if (typeof chunk === "object") {
          return this.json(chunk);
        }
        break;
      default:
    }

    // write strings in utf-8
    if (typeof chunk === "string") {
      encoding = "utf8";
      type = this.header("Content-Type");

      // reflect this in content-type
      this.putHeader("Content-Type", setCharset(type, "utf-8"));
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
      this.putHeader("Content-Length", len.toString());
    }

    // populate ETag
    let etag;
    const generateETag = len !== undefined && this._app.get(configuration.ETAG_FN);
    if (typeof generateETag === "function" && !this.header("ETag")) {
      etag = generateETag(buff, encoding);
      if (etag) {
        this.putHeader("ETag", etag);
      }
    }

    // freshness
    if (this._request.fresh(this)) {
      this._statusCode = 304;
    }

    // strip irrelevant headers
    if (204 === this.statusCode || 304 === this.statusCode) {
      this.removeHeader("Content-Type");
      this.removeHeader("Content-Length");
      this.removeHeader("Transfer-Encoding");
      buff = new Buffer("", encoding);
    }

    if (this._request.method === "HEAD") {
      // skip body for HEAD
      this.end();
    } else {
      // respond
      this.end(buff, encoding);
    }
  }

  public json(obj: object): void {
    if (!this.header("Content-Type")) {
      this.putHeader("Content-Type", setCharset("application/json", "utf-8"));
    }

    const replacer = this._app.get(configuration.JSON_REPLACER);
    const spaces = this._app.get(configuration.JSON_SPACES);
    const escape = this._app.get(configuration.JSON_ESCAPE);
    this.send(stringify(obj, replacer, spaces, escape));
  }

  public sendStatus(code: number): void {
    const body = statuses[code] || String(code);

    this._statusCode = code;
    this.contentType("txt");

    this.send(body);
  }

  public contentType(type: string): IHttpResponse {
    const ct = normalizeType(type);

    this.putHeader("Content-Type", ct);

    return this;
  }

  public format(obj: {[name: string]: IHttpHandler}, next?: INext): IHttpResponse {
    const fn = obj.default;
    if (fn) {
      delete obj.default;
    }
    const keys = Object.keys(obj);

    const key = keys.length > 0
      ? this._request.accepts(keys)
      : false;

    if (key) {
      this.putHeader("Content-Type", normalizeType(key));
      obj[key](this._request, this, next);
    } else if (fn) {
      fn(this._request, this, next);
    } else {
      const err = new HttpError("Not Acceptable: " + keys.map((o) => normalizeType(o)).join(", "), 406);
      if (next) {
        next(err);
      } else {
        throw err;
      }
    }

    return this;
  }

  public putHeader(field: string, value: string | string[]): IHttpResponse {
    this._headers[field] = value;

    return this;
  }

  public putHeaders(field: object): IHttpResponse {
    if (field) {
      for (const key of Object.keys(field)) {
        this.putHeader(key, field[key]);
      }
    }

    return this;
  }

  public header(field: string): string | string[] {
    return this._headers[field];
  }

  public appendHeader(field: string, value: string | string[]): IHttpResponse {
    const prev = this.header(field);

    if (prev) {
      // concat the new and prev vals
      if (Array.isArray(prev)) {
        if (Array.isArray(value)) {
          this.putHeader(field, prev.concat(value));
        } else {
          this.putHeader(field, prev.concat([value]));
        }
      } else {
        if (Array.isArray(value)) {
          this.putHeader(field, [prev].concat(value));
        } else {
          this.putHeader(field, [prev].concat([value]));
        }
      }

    } else {
      this.putHeader(field, value);
    }

    return this;
  }

  public removeHeader(field: string): IHttpResponse {
    delete this._headers[field];

    return this;
  }

  public addCookie(cookie: ICookie): IHttpResponse {
    const opts: {[name: string]: any} = {};
    const secret = this._app.get(configuration.COOKIE_SECRET);
    const signed = cookie.signed;

    if (signed && !secret) {
      throw new Error("app.set(\"cookie_secret\", \"SECRET\") required for signed cookies.");
    }

    let val = typeof cookie.value === "object"
      ? "j:" + JSON.stringify(cookie.value)
      : String(cookie.value);

    if (signed) {
      val = "s:" + sign(val, secret);
      opts.signed = true;
    }

    if ("maxAge" in opts) {
      opts.expires = new Date(Date.now() + opts.maxAge);
      opts.maxAge /= 1000;
    }

    if (opts.path == null) {
      opts.path = "/";
    }

    this._cookies[cookie.name] = cookie;
    this.appendHeader("Set-Cookie", serialize(cookie.name, String(val), opts));

    return this;
  }

  public addCookies(cookies: ICookie[]): IHttpResponse {
    for (const cookie of cookies) {
      this.addCookie(cookie);
    }

    return this;
  }

  public clearCookie(name: string, options?: object): IHttpResponse {
    const opts = merge({ expires: new Date(1), path: "/" }, options);

    const cookie: ICookie = new Cookie(name, "", opts.expires, opts.path);
    this.addCookie(cookie);

    return this;
  }

  public cookie(name: string): ICookie {
    return this._cookies[name];
  }

  public location(url: string): IHttpResponse {
    let loc = url;

    // "back" is an alias for the referrer
    if (url === "back") {
      loc = this._request.header("Referrer") || "/";
    }

    // set location
    this.putHeader("Location", encodeUrl(loc));

    return this;
  }

  public redirect(url: string, statusCode?: number): void {
    let address = url;
    const status = statusCode || 302;
    let body;

    address = this.location(address).header("Location").toString();

    this.format({
      text: () => {
        body = statuses[status] + ". Redirecting to " + address + ".";
      },

      html: () => {
        const u = escapeHtml(address);
        body = "<p>" + statuses[status] + ". Redirecting to <a href=\"" + u + "\">" + u + "</a></p>";
      },

      default: () => {
        body = "";
      }
    });

    // Respond
    this._statusCode = status;
    this.putHeader("Content-Length", Buffer.byteLength(body).toString());

    if (this._request.method === "HEAD") {
      this.end();
    } else {
      this.end(body);
    }
  }

  public render(view: string, params?: {[name: string]: any}, callback?: (err: Error, html: string) => void): void {
    const templateEngine: ITemplateEngine = this.router ? this.router.templateEngine : null;
    if (templateEngine == null) {
      throw new Error("The template engine must to be added in `app.addTemplateEngine` if you want to use render.");
    } else {
      templateEngine.render(view, params, (err: Error, html: string) => {
        if (callback) {
          callback(err, html);
        } else {
          if (err) {
            this._request.next(err);
          } else {
            this.putHeader("Content-Type", "text/html");
            this.send(html);
          }
        }
      });
    }
  }

  public setError(error: IHttpError): IHttpResponse {
    this._error = error;

    return this;
  }

  private end(body?: object|Buffer, encoding?: string): void {
    const statusCode = this._statusCode || 200;
    const headers = this._headers;
    let resultBody;
    if (null != body) {
      if (Buffer.isBuffer(body)) {
        resultBody = body.toString(encoding);
      } else {
        resultBody = body;
      }
    }

    const error: Error = this._error && this._error.cause ? this._error.cause : this._error;
    this._isSent = true;
    if (error) {
      this._callback.sendError(error);
    } else {
      this._callback.send(statusCode, headers, resultBody);
    }
  }

}
