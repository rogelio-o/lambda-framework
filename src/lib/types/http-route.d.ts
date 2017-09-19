import IHttpHandler from './http-handler'
import { Key } from 'path-to-regexp'

export default interface IHttpRoute {
  method: string
  regexp: RegExp
  keys: Key[]
  handler: IHttpHandler

  parsePathParameters(path: string): { [name: string]: string }
}
