import IHttpRequest from './../types/http-request'
import IHttpResponse from './../types/http-response'
import IHttpError from './../types/http-error'
import HttpError from './../exceptions/http-error'
var escapeHtml = require('escape-html')
var statuses = require('statuses')

const DOUBLE_SPACE_REGEXP = /\x20{2}/g
const NEWLINE_REGEXP = /\n/g

const defer = typeof setImmediate === 'function'
  ? setImmediate
  : function (fn, err, req, res) { process.nextTick(fn.bind.apply(fn, arguments)) }

function getErrorStatusCode (err: IHttpError): number {
  if (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600) {
    return err.statusCode
  } else {
    return null
  }
}

function getErrorHeaders(err: IHttpError): {[name: string]: string|Array<string>} {
  return err.headers
}

function getResponseStatusCode(res: IHttpResponse): number {
  let status = res.statusCode

  // default status code to 500 if outside valid range
  if (typeof status !== 'number' || status < 400 || status > 599) {
    status = 500
  }

  return status
}

function getErrorMessage (err: Error, status: number, env: string): string {
  let msg

  if (env !== 'production') {
    if(err instanceof HttpError) {
      msg = err.cause.message
    } else {
      msg = err.message
    }
  }

  return msg || statuses[status]
}

function createHtmlDocument(message: string): string {
  var body = escapeHtml(message)
    .replace(NEWLINE_REGEXP, '<br>')
    .replace(DOUBLE_SPACE_REGEXP, ' &nbsp;')

  return '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<title>Error</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '<pre>' + body + '</pre>\n' +
    '</body>\n' +
    '</html>\n'
}


function send(req: IHttpRequest, res: IHttpResponse, status: number, headers: {[name: string]: string}, message: string) {
  // response body
  var body = createHtmlDocument(message)

  // response status
  res.statusCode = status

  // response headers
  res.putHeaders(headers)

  // security headers
  res.putHeader('Content-Security-Policy', "default-src 'self'")
  res.putHeader('X-Content-Type-Options', 'nosniff')

  // standard headers
  res.putHeader('Content-Type', 'text/html; charset=utf-8')
  res.putHeader('Content-Length', Buffer.byteLength(body, 'utf8').toString())
  res.send(body)
}

export default function finalHandler(req: IHttpRequest, res: IHttpResponse, options: {[name: string]: any}) {
  const opts = options || {}

  // get environment
  const env = opts.env || process.env.NODE_ENV || 'development'

  // get error callback
  const onerror = opts.onerror

  return function (err) {
    let headers
    let msg
    let status

    // unhandled error
    if (err) {
      // respect status code from error
      status = getErrorStatusCode(err)

      // respect headers from error
      if (status !== undefined) {
        headers = getErrorHeaders(err)
      }

      // fallback to status code on response
      if (status === undefined) {
        status = getResponseStatusCode(res)
      }

      // get error message
      msg = getErrorMessage(err, status, env)
    } else {
      // not found
      status = 404
      msg = 'Cannot ' + req.method + ' ' + req.path
    }

    // schedule onerror callback
    if (onerror) {
      defer(onerror, err, req, res)
    }

    if (!res.isSent) {
      // send response
      send(req, res, status, headers, msg)
    }
  }
}
