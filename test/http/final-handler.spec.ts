import * as Chai from 'chai'
import App from './../../src/lib/app'
import IApp from './../../src/lib/types/app'
import HttpRequest from './../../src/lib/http/request'
import IHttpRequest from './../../src/lib/types/http-request'
import HttpResponse from './../../src/lib/http/response'
import IHttpResponse from './../../src/lib/types/http-response'
import finalHandler from './../../src/lib/http/final-handler'
import HttpError from './../../src/lib/exceptions/http-error'

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
 * Test for finalHandler.
 */
describe('finalHandler', () => {
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
    const handler = finalHandler(req, res, {})
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

    const handler = finalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult).to.be.null
  });

  it('should call #onerror handler if it is set in the #options.', (done) => {
    const handler = finalHandler(req, res, {
      onerror: () => {
        done()
      }
    })
    handler()
  });

  it('should set the response status code as 404 and acording message if #err is undefined.', () => {
    const handler = finalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult.statusCode).to.be.equals(404)
    Chai.expect(callBackSuccessResult.body.message).to.be.equals('Cannot GET /blog/1')
    Chai.expect(callBackSuccessResult.body.error).to.be.equals(404)
  });

  it('should set the response status code, headers and body from #err if it is not undefined.', () => {
    const handler = finalHandler(req, res, {})
    const error = new HttpError('Test msg', 403)
    error.headers = {errorHeader: 'test'}
    handler(error)
    Chai.expect(callBackSuccessResult.statusCode).to.be.equals(403)
    Chai.expect(callBackSuccessResult.body.message).to.be.equals('Test msg')
    Chai.expect(callBackSuccessResult.body.error).to.be.equals(403)
    Chai.expect(callBackSuccessResult.headers.errorHeader).to.be.equals('test')
  });

  it('should send a HTML response and HTML as content type if the request accepts HTML.', () => {
    const newEvent = Object.assign({}, event)
    newEvent.headers = Object.assign({}, event.headers)
    newEvent.headers['Accept'] = 'application/json,text/html'
    const req = new HttpRequest(newEvent)

    const handler = finalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult.body).to.contain('<!DOCTYPE html>')
  });

  it('should send a JSON response and JSON as content type if the request accepts JSON and it does not accept HTML.', () => {
    const handler = finalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult.body).to.be.a('object')
  });

  it('should send a PLAIN response and PLAIN as content type if the request does not accept JSON neither HTML.', () => {
    const newEvent = Object.assign({}, event)
    newEvent.headers = Object.assign({}, event.headers)
    newEvent.headers['Accept'] = 'application/pdf'
    const req = new HttpRequest(newEvent)

    const handler = finalHandler(req, res, {})
    handler()
    Chai.expect(callBackSuccessResult.body).to.be.equals('Cannot GET /blog/1')
  });

});
