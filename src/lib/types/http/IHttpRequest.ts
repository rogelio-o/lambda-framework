import IApp from "./../IApp";
import INext from "./../INext";
import ICookie from "./ICookie";
import IHttpResponse from "./IHttpResponse";
import IHttpRoute from "./IHttpRoute";
import IHttpUploadedFile from "./IHttpUploadedFile";

/**
 * A incoming request created when the event is APIGatewayEvent.
 */
export default interface IHttpRequest {

  readonly app: IApp;

  /**
   * Base path of the handling router.
   */
  basePath: string;

  /**
   * The original base path of the handling router.
   */
  originalBasePath: string;

  /**
   * The protocol of the incomig request. Can be http or https.
   */
  readonly protocol: string;

  /**
   * If the protocol of the incoming request is secure (https).
   */
  readonly secure: boolean;

  /**
   * The remote address from the trusted proxy.
   */
  readonly ip: string;

  /**
   * The request body.
   */
  body: object|string;

  /**
   * The files uplodad in the request.
   */
  files: IHttpUploadedFile[];

  /**
   * The parsed path of the request.
   */
  readonly path: string;

  /**
   * The incoming request HTTP method (GET, POST, PUT, DELETE,...)
   */
  readonly method: string;

  /**
   * The "Host" header field.
   */
  readonly hostname: string;

  /**
   * Check if the request was an _XMLHttpRequest_.
   */
  readonly xhr: boolean;

  /**
   * The incoming request headers.
   */
  readonly headers: { [name: string]: string };

  /**
   * All the params of the incoming request (query, path variables and body).
   */
  params: { [name: string]: any };

  /**
   * Next function to be called.
   */
  next: INext;

  /**
   * Actual route that is being processing
   */
  route: IHttpRoute;

  /**
   * Original event.
   */
  readonly event: any;

  /**
   * Context to save thins and use it
   * in other handlers.
   */
  readonly context: { [name: string]: any };

  /**
   * Returns the all the cookies retrieving their values and
   * options from the HTTP request header. The key will be the name of
   * the cookie and the value the object representing the cookie.
   */
  readonly cookies: {[name: string]: ICookie};

  /**
   * Return request header.
   *
   * @param  {string} key Header key.
   * @return {string}     Header value.
   */
  header(key: string): string;

  /**
   * Return the mime type of the given ones with the best fit
   * according to the incoming request.
   *
   * @param  {string|string[]} contentType A Content-Type or
   *                                       a collection of them.
   * @return {string}      The Content-Type with the best fit.
   *                       If there is no one, the method will return null.
   */
  accepts(contentType: string | string[]): string;

  /**
   * Return the encoding of the given ones with the best fit
   * according to the incoming request.
   *
   * @param  {string|string[]} encoding A encoding or
   *                                           a collection of them.
   * @return {string}      The encoding with the best fit.
   *                       If there is no one, the method will return null.
   */
  acceptsEncodings(encoding: string | string[]): string;

  /**
   * Return the charset of the given ones with the best fit
   * according to the incoming request.
   *
   * @param  {string|string[]} charset A charset or
   *                                          a collection of them.
   * @return {string}      The charset with the best fit.
   *                       If there is no one, the method will return null.
   */
  acceptsCharsets(charset: string | string[]): string;

  /**
   * Return the languages of the given ones with the best fit
   * according to the incoming request.
   *
   * @param  {string|string[]} language A language or
   *                                           a collection of them.
   * @return {string}      The language with the best fit.
   *                       If there is no one, the method will return null.
   */
  acceptsLanguages(language: string | string[]): string;

  /**
   * Return a param from the path, the query or the body.
   *
   * @param  {string} name         The name of the parameter.
   * @param  {any}    defaultValue A default value. It will be return in
   *                               case that the parameter does not exist.
   * @return {string}              The value, the default value or null. In
   *                               that order of existence.
   */
  param(name: string, defaultValue?: any): string;

  /**
   * Check if the incoming request has the "Content-Type" header and
   * if the header value is the given mime type.
   * @param  {string|string[]}  contentType The mime type we want to check.
   * @return {boolean}      The result of the checking.
   */
  is(contentType: string|string[]): boolean;

  /**
   * Check if the request is fresh looking the response data. This is if
   * the Last-Modified and/or the ETag headers for the resource still match.
   *
   * @param  {IHttpResponse} response [description]
   * @return {boolean}                [description]
   */
  fresh(response: IHttpResponse): boolean;

  /**
   * Check if the request is stale looking the response data. This is if
   * the Last-Modified and/or the ETag headers for the resource has changed.
   */
  stale(response: IHttpResponse): boolean;

  /**
   * Returns the cookie with the given `name` retrieving the value and
   * options from the HTTP request header.
   *
   * @param  {string}  name
   * @return {ICookie}
   */
  cookie(name: string): ICookie;

}
