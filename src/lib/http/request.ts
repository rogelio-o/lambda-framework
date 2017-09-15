import IHttpRequest from './../types/http-request'

export default class HttpRequest implements IHttpRequest {

  get protocol(): string {
    return 'TODO'; // TODO
  }

  get secure(): boolean {
    return this.protocol === 'https';
  }

  get ip(): string {
    return 'TODO'; // TODO
  }

  get body(): object|string {
    return 'TODO'; // TODO
  }

  get path(): string {
    return 'TODO'; // TODO
  }

  get hostname(): string {
    return 'TODO'; // TODO
  }

  get fresh(): boolean {
    return false; // TODO
  }

  get stale(): boolean {
    return !this.fresh;
  }

  get xhr(): boolean {
    return false; // TODO
  }

  constructor() {

  }

  header(key: string): string {
    return this._headers[key];
  }

  accepts(type: string | Array<string>): string {

  }

  acceptsEncodings(encoding: string | Array<string>): string {

  }

  acceptsCharsets(charset: string | Array<string>): string {

  }

  acceptsLanguages(language: string | Array<string>): string {

  }

  param(name: string, defaultValue?: any): string {

  }

  is(type: string): boolean {

  }

}
