import IHttpError from "./../exceptions/IHttpError";
import INext from "./../INext";
import IHttpHandler from "./IHttpHandler";

/**
 * This class represents an HTTP response, with the helpers to be sent.
 */
export default interface IHttpResponse {

  /**
   * The response HTTP status code.
   */
  readonly statusCode: number;

  readonly isSent: boolean;

  /**
   * Set the status `code` of the response.
   *
   * @param  {number}        code The new status code.
   * @return {IHttpResponse}
   */
  status(code: number): IHttpResponse;

  /**
   * Send a response.
   *
   * @param {string|number|boolean|object|Buffer} body The response
   */
  send(body: string|number|boolean|object|Buffer): void;

  /**
   * Send a JSON response.
   *
   * @param {object} obj The JSON response.
   */
  json(obj: object): void;

  /**
   * Send given HTTP status code.
   *
   * Sets the response status to `statusCode` and the body of the
   * response to the standard description from node's http.STATUS_CODES
   * or the statusCode number if no description.
   *
   * @param {number} code The status code.
   */
  sendStatus(code: number): void;

  /**
   * Set _Content-Type_ response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the _Content-Type_ to `contentType`
   * otherwise.
   *
   * @param  {string}        contentType The response type.
   * @return {IHttpResponse}
   */
  contentType(contentType: string): IHttpResponse;

  /**
   * Respond to the Acceptable formats using an `obj`
   * of mime-type callbacks.
   *
   * This method uses `req.accepted`, an array of
   * acceptable types ordered by their quality values.
   * When "Accept" is not present the _first_ callback
   * is invoked, otherwise the first match is used. When
   * no match is performed the server responds with
   * 406 "Not Acceptable".
   *
   * Content-Type is set for you, however if you choose
   * you may alter this within the callback using
   * `res.header('Content-Type', ...)`.
   *
   * In addition to canonicalized MIME types you may
   * also use extnames mapped to these types.
   *
   * By default, it is passed an `Error`
   * with a `.status` of 406 to `next(err)`
   * if a match is not made. If you provide
   * a `.default` callback it will be invoked
   * instead.
   *
   * @param  {Map<string, Function>} obj           The callbacks object.
   * @return {IHttpResponse}
   */
  format(obj: {[name: string]: IHttpHandler}, next?: INext): IHttpResponse;

  /**
   * Set header `field` to `val`.
   *
   * @param  {string} field
   * @param  {string|string[]}
   * @return {IHttpResponse}
   */
  putHeader(field: string, value: string | string[]): IHttpResponse;

  /**
   * Set each header indicated by the key of `object` to the value indicated
   * by the value of the key.
   *
   * @param  {object}        field
   * @return {IHttpResponse}
   */
  putHeaders(field: object): IHttpResponse;

  /**
   * Return the value of the header `field`.
   *
   * @param  {string} field
   * @return {string | string[]}
   */
  header(field: string): string | string[];

  /**
   * Append to a existing header a new value.
   *
   * @param  {string}        field
   * @param  {string|string[]} value
   * @return {IHttpResponse}
   */
  appendHeader(field: string, value: string | string[]): IHttpResponse;

  /**
   * Remove the `field` header from the headers that
   * will be send as response.
   *
   * @param  {string}        field
   * @return {IHttpResponse}
   */
  removeHeader(field: string): IHttpResponse;

  /**
   * Clear cookie `name`.
   *
   * @param  {string}        name
   * @param  {object}        options
   * @return {IHttpResponse}
   */
  clearCookie(name: string, options?: object): IHttpResponse;

  /**
   * Set cookie `name` to `value`, with the given `options`.
   *
   * @param  {string}        name
   * @param  {string|object} value
   * @param  {object}        options
   * @return {IHttpResponse}
   */
  addCookie(name: string, value: string|object, options?: object): IHttpResponse;

  /**
   * Set each cookie indicated by the key of `object` to the value indicated
   * by the value of the key.
   *
   * @param  {object}        name
   * @param  {object}        options
   * @return {IHttpResponse}
   */
  addCookies(name: object, options?: object): IHttpResponse;

  /**
   * Get the value of the cookie `name`.
   *
   * @param  {string} name
   * @return {string}
   */
  cookie(name: string): string;

  /**
   * Set the location header to `url`.
   *
   * The given `url` can also be "back", which redirects
   * to the _Referrer_ or _Referer_ headers or "/".
   *
   * @param  {string}        url
   * @return {IHttpResponse}
   */
  location(url: string): IHttpResponse;

  /**
   * Redirect to the given `url` with optional response `statusCode`
   * defaulting to 302.
   *
   * The resulting `url` is determined by `res.location()`, so
   * it will play nicely with relative paths and "back".
   *
   * @param {string} url
   * @param {number} statusCode 302 (Found) or 301 (Moved Permanently)
   */
  redirect(url: string, statusCode?: number): void;

  /**
   * Render `view` with the given `options` and optional callback `callback`.
   * When a callback function is given a response will _not_ be made
   * automatically, otherwise a response of _200_ and _text/html_ is given.
   *
   * Options:
   *  - `cache`     boolean hinting to the engine it should cache
   *  - `filename`  filename of the view being rendered
   *
   * @param {string}   view     The view that you want to render.
   * @param {object}   options  The options for the rendering.
   * @param {Function} callback A function that will be called when the
   *                            rendering is finished.
   */
  render(view: string, options?: object, callback?: (err: Error, html: string) => void): void;

  /**
   * When a exception happens, the error is set with the exception
   * to be returned in the response.
   *
   * @param  {IHttpError}    error
   * @return {IHttpResponse}
   */
  setError(error: IHttpError): IHttpResponse;

}
