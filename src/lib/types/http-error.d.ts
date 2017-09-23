export default interface IHttpError {
    statusCode: number;
    headers: {[name: string]: string|Array<string>}
    cause: Error;
}
