import * as Chai from 'chai'
import App from './../../src/lib/App'
import IApp from './../../src/lib/types/IApp'
import HttpRequest from './../../src/lib/http/HttpRequest'
import IHttpRequest from './../../src/lib/types/http/IHttpRequest'
import HttpResponse from './../../src/lib/http/HttpResponse'
import IHttpResponse from './../../src/lib/types/http/IHttpResponse'
import httpFinalHandler from './../../src/lib/http/httpFinalHandler'
import HttpError from './../../src/lib/exceptions/HttpError'
import DefaultCallback from "./../utils/DefaultCallback";
import httpEvent from "./../utils/httpEvent";
import IRawEvent from "./../../src/lib/types/IRawEvent";

/**
 * Test for httpFinalHandler.
 */
describe('httpFinalHandler', () => {
  const app: IApp = new App
  let req: IHttpRequest
  let res: IHttpResponse
  let callback: DefaultCallback;
  let event: IRawEvent;

  beforeEach(() => {
    callback = new DefaultCallback();
    event = Object.assign({}, httpEvent);
    event.headers['Accept'] ='application/json';
    req = new HttpRequest(Object.assign({}, event));
    res = new HttpResponse(app, req, callback);
  });

  it('should send a response with the headers: Content-Security-Policy, X-Content-Type-Options, Content-Type and Content-Length.', () => {
    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(callback.successResult.headers['Content-Security-Policy']).to.be.not.empty
    Chai.expect(callback.successResult.headers['X-Content-Type-Options']).to.be.not.empty
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.not.empty
    Chai.expect(callback.successResult.headers['Content-Length']).to.be.not.empty
  });

  it('should not send a response if a response is prevously sent.', () => {
    res.send('')
    Chai.expect(callback.successResult).to.be.not.undefined
    callback.successResult.body = null

    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(callback.successResult.body).to.be.null
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
    Chai.expect(callback.successResult.statusCode).to.be.equals(404)
    console.log(callback.successResult.body)
    Chai.expect(JSON.parse(callback.successResult.body).message).to.be.equals('Cannot GET /blog/1')
    Chai.expect(JSON.parse(callback.successResult.body).error).to.be.equals(404)
  });

  it('should set the response status code, headers and body from #err if it is not undefined.', () => {
    const handler = httpFinalHandler(req, res, {})
    const error = new HttpError('Test msg', 403)
    error.headers = {errorHeader: 'test'}
    handler(error)
    Chai.expect(callback.successResult.statusCode).to.be.equals(403)
    Chai.expect(JSON.parse(callback.successResult.body).message).to.be.equals('Test msg')
    Chai.expect(JSON.parse(callback.successResult.body).error).to.be.equals(403)
    Chai.expect(callback.successResult.headers.errorHeader).to.be.equals('test')
  });

  it('should send a HTML response and HTML as content type if the request accepts HTML.', () => {
    event.headers = Object.assign({}, event.headers)
    event.headers['Accept'] ='application/json,text/html'
    const req = new HttpRequest(event)

    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(callback.successResult.body).to.contain('<!DOCTYPE html>')
  });

  it('should send a JSON response and JSON as content type if the request accepts JSON and it does not accept HTML.', () => {
    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(JSON.parse(callback.successResult.body)).to.be.a('object')
  });

  it('should send a PLAIN response and PLAIN as content type if the request does not accept JSON neither HTML.', () => {
    event.headers = Object.assign({}, event.headers)
    event.headers['Accept'] = 'application/pdf'
    const req = new HttpRequest(event)

    const handler = httpFinalHandler(req, res, {})
    handler()
    Chai.expect(callback.successResult.body).to.be.equals('Cannot GET /blog/1')
  });

});
