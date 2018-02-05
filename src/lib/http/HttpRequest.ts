import * as accepts from "accepts";
import * as fresh from "fresh";
import configuration from "./../configuration/configuration";
import ICookie from "./../types/http/ICookie";
import IHttpRequest from "./../types/http/IHttpRequest";
import IHttpResponse from "./../types/http/IHttpResponse";
import IHttpRoute from "./../types/http/IHttpRoute";
import IHttpUploadedFile from "./../types/http/IHttpUploadedFile";
import IApp from "./../types/IApp";
import INext from "./../types/INext";
import IRawEvent from "./../types/IRawEvent";
import { getCookiesFromHeader, mergeParams, normalizeType } from "./../utils/utils";

/**
 * A incoming request created when the event is APIGatewayEvent.
 */
export default class HttpRequest implements IHttpRequest {

  public body: { [name: string]: any }|string;
  public files: IHttpUploadedFile[];
  public basePath: string;
  public originalBasePath: string;
  public next: INext;
  public params: { [name: string]: string };
  public route: IHttpRoute;

  private _event: IRawEvent;
  private _headers: { [name: string]: string };
  private _context: { [name: string]: any };
  private _cookies: { [name: string]: ICookie };

  constructor(app: IApp, event: IRawEvent) {
    this.body = event.body; // Default body
    this._event = event;
    this._context = {};
    this.params = mergeParams(event);

    this._headers = {};
    if (this._event.headers) {
      for (const key of Object.keys(this._event.headers)) {
        this._headers[key.toLowerCase()] = this._event.headers[key];
      }
    }

    this._cookies = getCookiesFromHeader(this._headers.cookie, app.get(configuration.COOKIE_SECRET));
  }

  get headers(): { [name: string]: string } {
    return this._headers;
  }

  get protocol(): string {
    return this.header("X-Forwarded-Proto") || "http";
  }

  get secure(): boolean {
    return this.protocol === "https";
  }

  get ip(): string {
    const forwardedFor = this.header("X-Forwarded-For") || "";
    if (forwardedFor !== "") {
      const ips = forwardedFor.replace(/\s/g, "").split(",");

      return ips[ips.length - 1];
    } else {
      return this._event.ip;
    }
  }

  get path(): string {
    return this._event.path;
  }

  get method(): string {
    return this._event.httpMethod;
  }

  get hostname(): string {
    return this.header("Host");
  }

  get xhr(): boolean {
    const val = this.header("X-Requested-With") || "";
    return val.toLowerCase() === "xmlhttprequest";
  }

  get event(): any {
    return this._event.original;
  }

  get context(): { [name: string]: any } {
    return this._context;
  }

  get cookies(): { [name: string]: ICookie } {
    return this._cookies;
  }

  public header(key: string): string {
    return this.headers[key.toLowerCase()];
  }

  public accepts(type: string | string[]): string {
    const accept = accepts(this);
    return accept.types(type);
  }

  public acceptsEncodings(encoding: string | string[]): string {
    const accept = accepts(this);
    return accept.encodings(encoding);
  }

  public acceptsCharsets(charset: string | string[]): string {
    const accept = accepts(this);
    return accept.charsets(charset);
  }

  public acceptsLanguages(language: string | string[]): string {
    const accept = accepts(this);
    return accept.languages(language);
  }

  public param(name: string, defaultValue?: any): string {
    const value = this.params[name];
    if (null != value) {
      return value;
    } else {
      return defaultValue;
    }
  }

  public is(contentTypes: string|string[]): boolean {
    let result = false;
    const contentTypesArr: string[] = typeof contentTypes === "string" ? [contentTypes] : contentTypes;
    const contentType = this.header("content-type");

    if (!contentType) {
      result = true;
    } else {
      for (const allowContentType of contentTypesArr) {
        const normalizedType = normalizeType(allowContentType);
        if (contentType.includes(normalizedType)) {
          result = true;
          break;
        }
      }
    }

    return result;
  }

  public fresh(response: IHttpResponse): boolean {
    const method = this.method;
    const status = response.statusCode || 200;

    // GET or HEAD for weak freshness validation only
    if ("GET" !== method && "HEAD" !== method) {
      return false;
    }

    // 2xx or 304 as per rfc2616 14.26
    if ((status >= 200 && status < 300) || 304 === status) {
      return fresh(this.headers, {
        "etag": response.header("ETag"),
        "last-modified": response.header("Last-Modified")
      });
    }

    return false;
  }

  public stale(response: IHttpResponse): boolean {
    return !this.fresh(response);
  }

  public cookie(name: string): ICookie {
    return this._cookies[name];
  }

}
