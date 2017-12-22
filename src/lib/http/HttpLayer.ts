import { Key, RegExpOptions } from "path-to-regexp";
import * as pathToRegexp from "path-to-regexp";
import HttpError from "./../exceptions/HttpError";
import IHttpHandler from "./../types/http/IHttpHandler";
import IHttpLayer from "./../types/http/IHttpLayer";
import IHttpRequest from "./../types/http/IHttpRequest";
import IHttpResponse from "./../types/http/IHttpResponse";
import IHttpRoute from "./../types/http/IHttpRoute";
import INext from "./../types/INext";
import IRouter from "./../types/IRouter";

function decode_param(val: string): any {
  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      const newErr = new HttpError("Failed to decode param \"" + val + "\"", 400, err);
      throw newErr;
    } else {
      throw err;
    }
  }
}

/**
 * A layer to be processed over a request.
 */
export default class HttpLayer implements IHttpLayer {

  public route: IHttpRoute;

  private _router: IRouter;
  private _path: string;
  private _handler: IHttpHandler;

  private _regexp: RegExp;
  private _keys: Key[];

  private _regexpFastStar: boolean;
  private _regexpFastSlash: boolean;

  constructor(router: IRouter, path: string, options: {[name: string]: any}, handler?: IHttpHandler, regexOptions?: RegExpOptions) {
    this._router = router;
    this._path = path;
    this._handler = handler;

    const regexOpts = regexOptions || {};
    const opts = options || {};
    if (path) {
      this._keys = [];
      this._regexp = pathToRegexp(path, this._keys, regexOpts);
      this._regexpFastStar = path === "*";
      this._regexpFastSlash = path === "/" && opts.end === false;
    }
  }

  public match(path: string): boolean {
    let result: boolean = false;

    if (this._regexp == null) {
      result = true;
    } else {
      const pathWithoutSubpath = this.getPathWithoutSubpath(path);
      if (pathWithoutSubpath) {
        result = this._regexp.test(pathWithoutSubpath);
      }
    }

    return result;
  }

  public parsePathParameters(path: string): { [name: string]: string } {
    if (path != null && this._path != null) {
      // fast path non-ending match for / (any path matches)
      if (this._regexpFastSlash) {
        return {};
      }

      // fast path for * (everything matched in a param)
      if (this._regexpFastStar) {
        return {0: decode_param(path)};
      }

      const pathWithoutSubpath = this.getPathWithoutSubpath(path);
      if (!pathWithoutSubpath) {
        return {};
      }

      // match the path
      const match = this._regexp.exec(pathWithoutSubpath);

      // store values
      const params = {};

      const keys = this._keys;

      for (let i = 1; i < match.length; i += 1) {
        const key = keys[i - 1];
        const prop = key.name;
        const val = decode_param(match[i]);

        if (val !== undefined) {
          params[prop] = val;
        }
      }

      return params;
    } else {
      return {};
    }
  }

  public handle(req: IHttpRequest, res: IHttpResponse, next: INext, error?: Error): void {
    if (!this._handler) {
      if (!error && this.route) {
        this.route.dispatch(req, res, next);
      } else {
        next(error);
      }
    } else {
      const isErrorHandler = this.isErrorHandler();
      if ((isErrorHandler && error) || !error) {
        try {
          this._handler(req, res, next, error);
        } catch (err) {
          next(err);
        }
      } else {
        next(error);
      }
    }
  }

  public isErrorHandler(): boolean {
    return !this.route && this._handler != null && this._handler.length === 4;
  }

  private getPathWithoutSubpath(path: string): string {
    let result = path;
    const subpath = this._router.fullSubpath;
    if (subpath) {
      if (!path.startsWith(subpath)) {
        result = null;
      } else {
        result = path.slice(subpath.length);
      }
    }

    return result;
  }

}
