export default interface IHttpResponse {

  /**
   * Set the status `code` of the response.
   *
   * @param  {number}        code The new status code.
   * @return {IHttpResponse}
   */
  status(code: number): IHttpResponse

  /**
   * Send a response.
   *
   * @param {string|number|boolean|object|Buffer} body The response
   */
  send(body: string|number|boolean|object|Buffer): void

  /**
   * Send a JSON response.
   *
   * @param {string|number|boolean|object} obj The JSON response.
   */
  json(obj: string|number|boolean|object): void

  /**
   * Send JSON response with JSONP callback support.
   *
   * @param {string|number|boolean|object} obj The JSON response.
   */
  jsonp(obj: string|number|boolean|object): void

  /**
   * Send given HTTP status code.
   *
   * Sets the response status to `statusCode` and the body of the
   * response to the standard description from node's http.STATUS_CODES
   * or the statusCode number if no description.
   *
   * @param {number} code The status code.
   */
  sendStatus(code: number): void

  /**
   * Set _Content-Type_ response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the _Content-Type_ to `type` otherwise.
   *
   * @param  {string}        type The response type.
   * @return {IHttpResponse}
   */
  contentType(type: string): IHttpResponse

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
  format(obj: Map<string, Function>): IHttpResponse

  /**
   * If `field` is a string and `value` exists or `field` is an object:
   * Set header `field` to `val`, or pass an object of header fields.
   *
   * If `field` is a string and `value` does not exists:
   * Return the value of the header `field`.
   *
   * @param  {string|object} field
   * @param  {string|Array<string>}
   * @return {IHttpResponse|string}
   */
  header(field: string|object, value?: string | Array<string>): IHttpResponse | string

  /**
   * Clear cookie `name`.
   *
   * @param  {string}        name
   * @param  {object}        options
   * @return {IHttpResponse}
   */
  clearCookie(name: string, options?: object): IHttpResponse

  /**
   * If `name` and `value` exist:
   * Set cookie `name` to `value`, with the given `options`.
   *
   * If `name` exists and `value` does not exist:
   * Get the value of the cookie `name`.
   *
   * @param  {string|object} name
   * @param  {string|object} value
   * @param  {object}        options
   * @return {IHttpResponse|string}
   */
  cookie(name: string|object, value?: string|object, options?: object): IHttpResponse | string

  /**
   * Set the location header to `url`.
   *
   * The given `url` can also be "back", which redirects
   * to the _Referrer_ or _Referer_ headers or "/".
   *
   * @param  {string}        url
   * @return {IHttpResponse}
   */
  location(url: string): IHttpResponse

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
  redirect(url: string, statusCode?: number): void

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
  render(view: string, options?: object, callback?: Function): void

}
