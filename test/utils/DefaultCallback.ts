import IRawCallback from "./../../src/lib/types/IRawCallback";

/**
 * A callback for testing purposes.
 */
export default class DefaultCallback implements IRawCallback {

  private _errorResult: Error;

  private _successResult: {[name: string]: any};

  private _callback: () => void;

  private _isFinalized: boolean;

  get errorResult(): Error {
    return this._errorResult;
  }

  get successResult(): {[name: string]: any} {
    return this._successResult;
  }

  get isFinalized(): boolean {
    return this._isFinalized;
  }

  public sendError(error: Error): void {
    this._errorResult = error;
  }

  public send(statusCode: number, headers: {[name: string]: string|string[]}, body: object|Buffer): void {
    this._successResult = {statusCode, headers, body};
    if (this._callback) {
      this._callback();
    }
  }

  public setCallback(callback: () => void): void {
    this._callback = callback;
  }

  public finalize(): void {
    this._isFinalized = true;
    if (this._callback) {
      this._callback();
    }
  }

}
