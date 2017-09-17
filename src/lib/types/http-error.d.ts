export default interface IHttpError {
    statusCode: number;
    cause: Error;
}
