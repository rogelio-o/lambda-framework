import IHttpRequest from './../types/http-request'
import IHttpResponse from './../types/http-response'
import IApp from './../types/app'
import { APIGatewayEvent } from 'aws-lambda'
import Configuration from './../configuration/configuration'
const fresh = require('fresh')
const accepts = require('accepts')
import { merge } from './../utils/utils'
import HttpRoute from './../types/http-route'
import INext from './../types/next'

export default class HttpRequest implements IHttpRequest {

  private _app: IApp
  private _event: APIGatewayEvent
  private _pathParameters: { [name: string]: string }
  private _headers: { [name: string]: string }

  public body: object|string

  constructor(app: IApp, event: APIGatewayEvent, route: HttpRoute) {
    this._app = app;
    this._event = event;
    this._pathParameters = route.parsePathParameters(event.path);

    this._headers = {}
    for(let key in this._event.headers) {
      this._headers[key.toLowerCase()] = this._event.headers[key]
    }
  }

  get headers(): { [name: string]: string } {
    return this._headers;
  }

  get protocol(): string {
    return this.header('X-Forwarded-Proto') || 'http';
  }

  get secure(): boolean {
    return this.protocol === 'https';
  }

  get ip(): string {
    const forwardedFor = this.header('X-Forwarded-For') || '';
    if(forwardedFor != '') {
      const ips = forwardedFor.replace(/\s/g,'').split(',');

      return ips[ips.length - 1];
    } else {
      return this._event.requestContext.identity.sourceIp.replace('\:d+$', '');
    }
  }

  get path(): string {
    return this._event.path;
  }

  get method(): string {
    return this._event.httpMethod;
  }

  get hostname(): string {
    return this.header('Host');
  }

  get xhr(): boolean {
    const val = this.header('X-Requested-With') || '';
    return val.toLowerCase() === 'xmlhttprequest';
  }

  get params(): { [name: string]: any } {
    const pathParams = this._pathParameters || {};
    const body = typeof this.body === 'object' ? this.body : {};
    const query = this._event.queryStringParameters || {};
    const stageVariables = this._event.stageVariables || {};

    return merge(pathParams, body, query, stageVariables);
  }

  get event(): APIGatewayEvent {
    return this._event;
  }

  header(key: string): string {
    return this.headers[key.toLowerCase()];
  }

  accepts(type: string | Array<string>): string {
    const accept = accepts(this);
    return accept.types(type);
  }

  acceptsEncodings(encoding: string | Array<string>): string {
    const accept = accepts(this);
    return accept.encodings(encoding);
  }

  acceptsCharsets(charset: string | Array<string>): string {
    const accept = accepts(this);
    return accept.charsets(charset);
  }

  acceptsLanguages(language: string | Array<string>): string {
    const accept = accepts(this);
    return accept.languages(language);
  }

  param(name: string, defaultValue?: any): string {
    const value = this.params[name];
    if(null != value) {
      return value;
    } else {
      return defaultValue;
    }
  }

  is(types: string|Array<string>): boolean {
    return typeof this.accepts(types) != 'boolean';
  }

  fresh(response: IHttpResponse): boolean {
    const method = this.method;
    const status = response.statusCode || 200;

    // GET or HEAD for weak freshness validation only
    if ('GET' !== method && 'HEAD' !== method) return false;

    // 2xx or 304 as per rfc2616 14.26
    if ((status >= 200 && status < 300) || 304 === status) {
      return fresh(this.headers, {
        'etag': response.header('ETag'),
        'last-modified': response.header('Last-Modified')
      })
    }

    return false;
  }

  stale(response: IHttpResponse): boolean {
    return !this.fresh(response);
  }

}
