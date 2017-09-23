import IHttpHandler from './http-handler'
import IHttpRequest from './http-request'
import IHttpResponse from './http-response'
import INext from './next'
import { Key } from 'path-to-regexp'

export default interface IHttpRoute {
  regexp: RegExp

  parsePathParameters(path: string): { [name: string]: string }

  dispatch(req: IHttpRequest, res: IHttpResponse, next: INext): void

  get(IHttpHandler): IHttpRoute

  put(IHttpHandler): IHttpRoute

  delete(IHttpHandler): IHttpRoute

  post(IHttpHandler): IHttpRoute

  all(IHttpHandler): IHttpRoute

}
