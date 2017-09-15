export interface IRequest {
  protocol: string
  secure: boolean
  ip: string
  body: object|string
  path: string
  hostname: string
  fresh: boolean
  stale: boolean
  xhr: boolean

  header(key: string): string
  accepts(type: string | Array<string>): string
  acceptsEncodings(encoding: string | Array<string>): string
  acceptsCharsets(charset: string | Array<string>): string
  acceptsLanguages(language: string | Array<string>): string
  param(name: string, defaultValue?: any): string
  is(type: string): boolean
}

export class Request implements IRequest {

  protocol: string
  secure: boolean
  ip: string
  body: object|string
  path: string
  hostname: string
  fresh: boolean
  stale: boolean
  xhr: boolean

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
