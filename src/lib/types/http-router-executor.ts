import IRouter from './router'
import IHttpRequest from './http-request'
import IHttpResponse from './http-response'
import INext from './next'

export default interface IHttpRouterExecutor {

  next(error?: Error): void

}
