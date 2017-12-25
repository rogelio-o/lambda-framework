import ICookie from "./../types/http/ICookie";

/**
 * This object represents a browser cookie.
 */
export default class Cookie implements ICookie {

  private _name: string;

  private _value: string|{[name: string]: any};

  private _expires: Date;

  private _path: string;

  private _signed: boolean;

  constructor(name: string, value: string|{[name: string]: any}, expires?: Date, path?: string, signed?: boolean) {
    this._name = name;
    this._value = value;
    this._expires = expires;
    this._path = path;
    this._signed = signed;
  }

  get name(): string {
    return this._name;
  }

  get value(): string|{[name: string]: any} {
    return this._value;
  }

  get expires(): Date {
    return this._expires;
  }

  get path(): string {
    return this._path;
  }

  get signed(): boolean {
    return this._signed;
  }

}
