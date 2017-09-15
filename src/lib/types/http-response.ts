export default interface IHttpResponse {
  status(code: number): IHttpResponse
  send(body: string|number|boolean|object|Buffer): void
  json(obj: string|number|boolean|object): void
  jsonp(obj: string|number|boolean|object): void
  sendStatus(code: number): void
  contentType(type: string): IHttpResponse
  format(obj: Map<string, Function>): IHttpResponse
  header(field: string|object, value?: string | Array<string>): IHttpResponse
  clearCookie(name: string, options?: object): IHttpResponse
  cookie(name: string|object, value?: string|object, options?: object): IHttpResponse
  location(url: string): IHttpResponse
  redirect(url: string): void
  render(view: string, options?: object, callback?: Function): void
}
