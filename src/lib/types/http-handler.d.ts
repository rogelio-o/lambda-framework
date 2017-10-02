import IHttpRequest from './http-request'
import IHttpResponse from './http-response'
import INext from './next'

export default interface IHttpHandler {
    (req: IHttpRequest, res: IHttpResponse, next?: INext, error?: Error): void;
}
