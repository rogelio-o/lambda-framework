export interface IHttpResponse {
  status(code: number): IHttpResponse
  send(body: string|number|boolean|object|Buffer): void
  json(obj: string|number|boolean|object): void
  jsonp(obj: string|number|boolean|object): void
  sendStatus(code: number): void
  contentType(type: string): IHttpResponse
  format(obj: Map<string, Function>): IHttpResponse
  header(field: string, value: string | Array<string>): IHttpResponse
  header(obj: object): IHttpResponse
  header(field: string): string
  clearCookie(name: string, options?: object): IHttpResponse
  cookie(name: string, value: string|object, options?: object): IHttpResponse
  location(url: string): IHttpResponse
  redirect(url: string): void
  render(view: string, options?: object, callback?: Function): void
}

function stringify(value, replacer, spaces) {
  // v8 checks arguments.length for optimizing simple call
  // https://bugs.chromium.org/p/v8/issues/detail?id=4730
  return replacer || spaces
    ? JSON.stringify(value, replacer, spaces)
    : JSON.stringify(value);
}

export class HttpResponse implements IHttpResponse {

}
