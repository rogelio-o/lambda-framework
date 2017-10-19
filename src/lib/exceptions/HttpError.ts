import IHttpError from "./../types/exceptions/IHttpError";

/**
 * An error that happens processing a http request.
 */
export default class HttpError extends Error implements IHttpError {

  public headers: {[name: string]: string|string[]};

  private _statusCode: number;
  private _parent: Error;

  constructor(m: string, statusCode: number, parent?: Error) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpError.prototype);
    this._statusCode = statusCode;
    this._parent = parent;
  }

  get statusCode(): number {
    return this._statusCode;
  }

  get cause(): Error {
    return this._parent;
  }

}
