import IRawCallback from "./../../src/lib/types/IRawCallback";

export default class DefaultCallback implements IRawCallback {

  private _errorResult: Error;

  private _successResult: {[name: string]: any};

  private _callback: () => void;

  get errorResult(): Error {
    return this._errorResult;
  }

  get successResult(): {[name: string]: any} {
    return this._successResult;
  }

  sendError(error: Error): void {
    this._errorResult = error;
  }

  send(statusCode: number, headers: {[name: string]: string|string[]}, body: object|Buffer): void {
    this._successResult = {statusCode, headers, body};
    if(this._callback) {
      this._callback()
    }
  }

  setCallback(callback: () => void) {
    this._callback = callback;
  }

}
