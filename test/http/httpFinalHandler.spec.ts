import * as Chai from 'chai'
import App from './../../src/lib/App'
import IApp from './../../src/lib/types/IApp'
import HttpRequest from './../../src/lib/http/HttpRequest'
import IHttpRequest from './../../src/lib/types/http/IHttpRequest'
import HttpResponse from './../../src/lib/http/HttpResponse'
import IHttpResponse from './../../src/lib/types/http/IHttpResponse'
import httpFinalHandler from './../../src/lib/http/httpFinalHandler'
import HttpError from './../../src/lib/exceptions/HttpError'

const event = {
  body: 'BODY',
  headers: {
    header1: 'HEADER VALUE 1',
    header2: 'HEADER VALU 2',
    'X-Forwarded-Proto': 'https',
    'Host': 'localhost',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Charset': 'UTF-8, ISO-8859-1',
    'Accept-Language': 'es,en',
    'If-None-Match': 'etagValue',
    'If-Modified-Since': '2017-10-10T10:10:10'
  },
  httpMethod: 'GET',
  isBase64Encoded: true,
  path: '/blog/1',
  pathParameters: {
    param1: 'Param 1'
  },
  queryStringParameters: {
    query1: 'Query 1'
  },
  stageVariables: {
    stage1: 'Stage 1'
  },
  requestContext: {
    accountId: 'A1',
    apiId: 'API1',
    httpMethod: 'GET',
    identity: {
      accessKey: 'ABCD',
      accountId: 'AAA',
      apiKey: 'BBB',
      caller: 'caller',
      cognitoAuthenticationProvider: 'facebook',
      cognitoAuthenticationType: 'authtype',
      cognitoIdentityId: 'IID',
      cognitoIdentityPoolId: 'PID',
      sourceIp: '197.0.0.0',
      user: 'user',
      userAgent: 'Chrome',
      userArn: 'ARN'
    },
    stage: 'test',
    requestId: 'RQID',
    resourceId: 'RSID',
    resourcePath: '/blog/1'
  },
  resource: 'API'
}

/**
 * Test for httpFinalHandler.
 */
describe('httpFinalHandler', () => {
  const app: IApp = new App
  let req: IHttpRequest
  let res: IHttpResponse
  let callbackErrorResult, callBackSuccessResult

  beforeEach(() => {
    req = new HttpRequest(Object.assign({}, event))
    res = new HttpResponse(app, req, (error, success) => {
      callbackErrorResult = error
      callBackSuccessResult = success
    })
  });

  it('should send a response with the headers: Content-Security-Policy, X-Content-Type-Options, Content-Type and Content-Length.', () => {
    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult.headers['Content-Security-Policy']).to.be.not.empty
    Chai.expect(callBackSuccessResult.headers['X-Content-Type-Options']).to.be.not.empty
    Chai.expect(callBackSuccessResult.headers['Content-Type']).to.be.not.empty
    Chai.expect(callBackSuccessResult.headers['Content-Length']).to.be.not.empty
  });

  it('should not send a response if a response is prevously sent.', () => {
    res.send('')
    Chai.expect(callBackSuccessResult).to.be.not.undefined
    callBackSuccessResult = null

    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult).to.be.null
  });

  it('should call #onerror handler if it is set in the #options.', (done) => {
    const handler = httpFinalHandler(req, res, {
      onerror: () => {
        done()
      }
    })
    handler()
  });

  it('should set the response status code as 404 and acording message if #err is undefined.', () => {
    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult.statusCode).to.be.equals(404)
    Chai.expect(JSON.parse(callBackSuccessResult.body).message).to.be.equals('Cannot GET /blog/1')
    Chai.expect(JSON.parse(callBackSuccessResult.body).error).to.be.equals(404)
  });

  it('should set the response status code, headers and body from #err if it is not undefined.', () => {
    const handler = httpFinalHandler(req, res, {})
    const error = new HttpError('Test msg', 403)
    error.headers = {errorHeader: 'test'}
    handler(error)
    Chai.expect(callBackSuccessResult.statusCode).to.be.equals(403)
    Chai.expect(JSON.parse(callBackSuccessResult.body).message).to.be.equals('Test msg')
    Chai.expect(JSON.parse(callBackSuccessResult.body).error).to.be.equals(403)
    Chai.expect(callBackSuccessResult.headers.errorHeader).to.be.equals('test')
  });

  it('should send a HTML response and HTML as content type if the request accepts HTML.', () => {
    const newEvent = Object.assign({}, event)
    newEvent.headers = Object.assign({}, event.headers)
    newEvent.headers['Accept'] = 'application/json,text/html'
    const req = new HttpRequest(newEvent)

    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult.body).to.contain('<!DOCTYPE html>')
  });

  it('should send a JSON response and JSON as content type if the request accepts JSON and it does not accept HTML.', () => {
    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(JSON.parse(callBackSuccessResult.body)).to.be.a('object')
  });

  it('should send a PLAIN response and PLAIN as content type if the request does not accept JSON neither HTML.', () => {
    const newEvent = Object.assign({}, event)
    newEvent.headers = Object.assign({}, event.headers)
    newEvent.headers['Accept'] = 'application/pdf'
    const req = new HttpRequest(newEvent)

    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult.body).to.be.equals('Cannot GET /blog/1')
  });

  it("should set status code from res if it is higher than 400, lower than 600 and the error is not of type HttpError.", () => {
    const handler = httpFinalHandler(req, res, {})
    res.status(404);
    const error = new Error("No HTTP error.");
    handler(error)
    Chai.expect(callBackSuccessResult.statusCode).to.be.equals(404);
  });

  it("should set status code 500 if the res status code is lower than 400 or higher than 600 and the error is not of type HttpError.", () => {
    const handler = httpFinalHandler(req, res, {})
    res.status(300);
    const error = new Error("No HTTP error.");
    handler(error)
    Chai.expect(callBackSuccessResult.statusCode).to.be.equals(500);
  });

  it("should set status code 500 if the status code of HttpError is not set.", () => {
    const handler = httpFinalHandler(req, res, {})
    const error = new HttpError("HTTP error.", null);
    handler(error)
    Chai.expect(callBackSuccessResult.statusCode).to.be.equals(500);
  });

  it("should set empty headers if the error is not a HttpError.", () => {
    const handler = httpFinalHandler(req, res, {})
    const error = new Error("HTTP error.");
    handler(error)
    Chai.expect(callBackSuccessResult.headers).to.be.deep.equal({
      'Content-Security-Policy': 'default-src "self"',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': '37' }
    );
  });

});
