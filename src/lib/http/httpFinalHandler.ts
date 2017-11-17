import * as escapeHtml from "escape-html";
import * as  statuses from "statuses";
import HttpError from "./../exceptions/HttpError";
import IHttpRequest from "./../types/http/IHttpRequest";
import IHttpResponse from "./../types/http/IHttpResponse";
import INext from "./../types/INext";

const DOUBLE_SPACE_REGEXP = /\x20{2}/g;
const NEWLINE_REGEXP = /\n/g;

function getErrorStatusCode(err: Error): number {
  if (err instanceof HttpError) {
    if (typeof err.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600) {
      return err.statusCode;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function getErrorHeaders(err: HttpError): {[name: string]: string|string[]} {
  if (err instanceof HttpError) {
    return err.headers;
  }
}

function getResponseStatusCode(res: IHttpResponse): number {
  let status = res.statusCode;

  // default status code to 500 if outside valid range
  if (typeof status !== "number" || status < 400 || status > 599) {
    status = 500;
  }

  return status;
}

function getErrorMessage(err: Error, status: number, env: string): string {
  let msg;

  if (env !== "production") {
    if (err instanceof HttpError) {
      msg = err.cause ? err.cause.message : err.message;
    } else {
      msg = err.message;
    }
  }

  return msg || statuses[status];
}

function createHtmlDocument(message: string): string {
  const body = escapeHtml(message)
    .replace(NEWLINE_REGEXP, "<br>")
    .replace(DOUBLE_SPACE_REGEXP, " &nbsp;");

  return "<!DOCTYPE html>\n" +
    "<html lang=\"en\">\n" +
    "<head>\n" +
    "<meta charset=\"utf-8\">\n" +
    "<title>Error</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "<pre>" + body + "</pre>\n" +
    "</body>\n" +
    "</html>\n";
}

function send(req: IHttpRequest, res: IHttpResponse, status: number, headers: {[name: string]: string}, message: string): void {
  // response body
  let body;
  if (req.accepts("text/html")) {
    body = createHtmlDocument(message);
  } else if (req.accepts("application/json")) {
    body = {message, error: status};
  } else {
    body = message;
  }

  // response status
  res.status(status);

  // response headers
  res.putHeaders(headers);

  // security headers
  res.putHeader("Content-Security-Policy", "default-src \"self\"");
  res.putHeader("X-Content-Type-Options", "nosniff");

  // standard headers
  res.send(body);
}

/**
 * The final handler to be executed if no previous handler has stopped
 * the router execution.
 * @param  {IHttpRequest}           req     the incoming request which start
 *                                          the exec.
 * @param  {IHttpResponse}          res     the outcoming request of the exec.
 * @param  {[name: string]: any}    options the options of the final handler.
 * @return {[INext]}
 */
export default function httpFinalHandler(req: IHttpRequest, res: IHttpResponse, options: {[name: string]: any}): INext {
  const opts = options || {};

  // get environment
  const env = opts.env || process.env.NODE_ENV || "development";

  // get error callback
  const onerror = opts.onerror;

  return (err?: Error) => {
    let headers;
    let msg;
    let status;

    // unhandled error
    if (err) {
      // respect status code from error
      status = getErrorStatusCode(err);

      // respect headers from error
      if (status !== null) {
        headers = getErrorHeaders(<HttpError> <any> err);
      }

      // fallback to status code on response
      if (status === null) {
        status = getResponseStatusCode(res);
      }

      // get error message
      msg = getErrorMessage(err, status, env);
    } else {
      // not found
      status = 404;
      msg = "Cannot " + req.method + " " + req.path;
    }

    // schedule onerror callback
    if (onerror) {
      setImmediate(() => onerror(err, req, res));
    }

    if (!res.isSent) {
      // send response
      send(req, res, status, headers, msg);
    }
  };
}
