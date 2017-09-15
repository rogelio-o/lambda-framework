import IHttpResponse from './../types/http-response'

function stringify(value, replacer, spaces) {
  // v8 checks arguments.length for optimizing simple call
  // https://bugs.chromium.org/p/v8/issues/detail?id=4730
  return replacer || spaces
    ? JSON.stringify(value, replacer, spaces)
    : JSON.stringify(value);
}

export default class HttpResponse implements IHttpResponse {

  status(code: number): IHttpResponse {
    return this;
  }

  send(body: string|number|boolean|object|Buffer): void {

  }

  json(obj: string|number|boolean|object): void {

  }

  jsonp(obj: string|number|boolean|object): void {

  }

  sendStatus(code: number): void {

  }

  contentType(type: string): IHttpResponse {
    return this;
  }

  format(obj: Map<string, Function>): IHttpResponse {
    return this;
  }

  header(field: string|object, value?: string | Array<string>): IHttpResponse {
    return this;
  }

  clearCookie(name: string, options?: object): IHttpResponse {
    return this;
  }

  cookie(name: string|object, value?: string|object, options?: object): IHttpResponse {
    return this;
  }

  location(url: string): IHttpResponse {
    return this;
  }

  redirect(url: string): void {

  }

  render(view: string, options?: object, callback?: Function): void {

  }

}
