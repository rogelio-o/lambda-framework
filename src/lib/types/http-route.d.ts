import IHttpHandler from './http-handler'
import IHttpRequest from './http-request'
import IHttpResponse from './http-response'
import INext from './next'
import { Key } from 'path-to-regexp'
import IHttpLayer from './http-layer'

export default interface IHttpRoute {

  readonly layer: IHttpLayer

  hasMethod(method: string): boolean

  dispatch(req: IHttpRequest, res: IHttpResponse, next: INext): void

  get(handler: IHttpHandler): IHttpRoute

  put(handler: IHttpHandler): IHttpRoute

  delete(handler: IHttpHandler): IHttpRoute

  post(handler: IHttpHandler): IHttpRoute

  all(handler: IHttpHandler): IHttpRoute

}
