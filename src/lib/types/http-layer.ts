import IHttpHandler from './http-handler'
import IHttpRequest from './http-request'
import IHttpResponse from './http-response'
import INext from './next'
import IHttpRoute from './http-route'

export default interface IHttpLayer {

  route: IHttpRoute

  match(path: string): boolean

  handle(req: IHttpRequest, res: IHttpResponse, next: INext, error?: Error): void

  isErrorHandler(): boolean

}
