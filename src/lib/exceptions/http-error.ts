export default class HttpError extends Error {

  private _statusCode: number;
  private _parent: Error;

  constructor(m: string, statusCode: number, parent?: Error) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  get statusCode(): number {
    return this._statusCode;
  }

  get cause(): Error {
    return this._parent;
  }

}
