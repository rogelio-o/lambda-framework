/**
 * A provider callback mechanism has to implements this interface.
 */
export default interface IRawCallback {

  sendError(error: Error): void;

  send(statusCode: number, headers: {[name: string]: string|string[]}, body: object|Buffer): void;

  finalize(err?: Error): void;

}
