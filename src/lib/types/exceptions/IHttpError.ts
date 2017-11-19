/**
 * An error that happens processing a http request.
 */
export default interface IHttpError extends Error {
    statusCode: number;
    headers: {[name: string]: string|string[]};
    cause: Error;
}
