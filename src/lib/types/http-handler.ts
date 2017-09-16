import IHttpRequest from './http-request'
import IHttpResponse from './http-response'
import { Context } from 'aws-lambda'

export default interface IHttpHandler {
    (req: IHttpRequest, res: IHttpResponse): void;
}
