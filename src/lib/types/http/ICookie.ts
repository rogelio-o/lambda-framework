/**
 * This object represents a browser cookie.
 */
export default interface ICookie {

  readonly name: string;

  readonly value: string|{[name: string]: any};

  readonly expires: Date;

  readonly path: string;

  readonly signed: boolean;

}
