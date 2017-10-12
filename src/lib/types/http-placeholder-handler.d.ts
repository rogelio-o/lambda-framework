import IHttpRequest from './http-request'
import IHttpResponse from './http-response'

export default interface IHttpHandler {
    (req: IHttpRequest, res: IHttpResponse, next: Function, placeholderValue: any): void;
}
