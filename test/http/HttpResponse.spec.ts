import * as Chai from 'chai'
import { stub, SinonStub } from "sinon";
import Router from './../../src/lib/Router'
import IRouter from './../../src/lib/types/IRouter'
import configuration from './../../src/lib/configuration/configuration'
import HttpRequest from './../../src/lib/http/HttpRequest'
import IHttpRequest from './../../src/lib/types/http/IHttpRequest'
import HttpResponse from './../../src/lib/http/HttpResponse'
import IHttpResponse from './../../src/lib/types/http/IHttpResponse'
import HttpRoute from './../../src/lib/http/HttpRoute'
import TemplateEngine from './../../src/lib/http/renderEngine/TemplateEngine'
import App from './../../src/lib/App'
import IApp from './../../src/lib/types/IApp'
import { stringify } from './../../src/lib/utils/utils'
import IRawEvent from "./../../src/lib/types/IRawEvent";
import DefaultCallback from "./../utils/DefaultCallback";
import httpEvent from "./../utils/httpEvent";

/**
 * Test for HttpResponse.
 */
describe('HttpResponse', () => {
  let request: IHttpRequest
  let response: IHttpResponse
  let event: IRawEvent;
  let app: IApp;
  let callback: DefaultCallback;

  beforeEach(function(done) {
    app = new App()
    event = Object.assign({}, httpEvent);
    request = new HttpRequest(event)
    callback = new DefaultCallback();
    response = new HttpResponse(app, request, callback);

    done()
  });

  it('#status should set the outcoming response status code', () => {
    response.status(302)
    response.send('')
    Chai.expect(callback.successResult.statusCode).to.be.equal(302)
  });

  it('#statusCode should returns the outcoming response status code previously set', () => {
    response.status(302)
    Chai.expect(response.statusCode).to.be.equal(302)
  });

  it('#send should set the outcoming response body to the given string with "html" content type header and the right content length header', () => {
    response.send('ABC')
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('text/html; charset=utf-8')
    Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal('3')
    Chai.expect(response.isSent).to.be.true
  });

  it('#send should set the outcoming response body to the given number with no content type header and the right content length header', () => {
    response.send(false)
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.undefined
    Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal('5')
    Chai.expect(callback.successResult.body).to.be.equal('false')
    Chai.expect(response.isSent).to.be.true
  });

  it('#send should set the outcoming response body to the given boolean with no content type header and the right content length header', () => {
    response.send(1)
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.undefined
    Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal('1')
    Chai.expect(callback.successResult.body).to.be.equal('1')
    Chai.expect(response.isSent).to.be.true
  });

  it('#send should set the outcoming response body to the given Buffer with "bin" content type header and the right content length header', () => {
    response.send(new Buffer('test'))
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('bin')
    Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal('4')
    Chai.expect(callback.successResult.body).to.be.equal('test')
    Chai.expect(response.isSent).to.be.true
  });

  it('#send should set the outcoming response header ETag to the generated with the function in #app.get(Configuration.ETAG_FN)', () => {
    app.set(configuration.ETAG_FN, (buff, encoding) => 'ETAG' + buff.toString(encoding))
    response.send('test')
    Chai.expect(callback.successResult.headers['ETag']).to.be.equal('ETAGtest')
  });

  it('#send should set the outcoming response status code to 304 if the response is not fresh', () => {
    app.set(configuration.ETAG_FN, (buff, encoding) => 'etagValue')
    response.putHeader('Last-Modified', '2017-10-10T10:10:09')
    response.send('test')
    Chai.expect(callback.successResult.statusCode).to.be.equal(304)
  });

  it('#send should not set the outcoming response irrelevant headers (Content-Type, Content-Length and Transfer-Encoding) and the body if the response status code is 204', () => {
    response.status(204)
    response.send('')
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.undefined
    Chai.expect(callback.successResult.headers['Content-Length']).to.be.undefined
    Chai.expect(callback.successResult.headers['Transfer-Encoding']).to.be.undefined
  });

  it('#send should not set the outcoming response irrelevant headers (Content-Type, Content-Length and Transfer-Encoding) and the body if the response status code is 304', () => {
    response.status(304)
    response.send('')
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.undefined
    Chai.expect(callback.successResult.headers['Content-Length']).to.be.undefined
    Chai.expect(callback.successResult.headers['Transfer-Encoding']).to.be.undefined
  });

  it('#send should set the outcoming response body to null if the request method is HEAD', () => {
    event.httpMethod = 'HEAD'
    response.send('test')
    Chai.expect(callback.successResult.body).to.be.undefined
  });

  it('#json should set the outcoming response header Content-Type to "application/json"', () => {
    response.json({})
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('application/json; charset=utf-8')
  });

  it('#json should set the outcoming response header Content-Length to the right length', () => {
    const body = {test: 'test1'}
    const parsedBody = stringify(body, undefined, undefined, undefined)
    response.json(body)
    Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal(parsedBody.length.toString())
    Chai.expect(callback.successResult.body).to.be.equal(parsedBody)
  });

  it('#sendStatus should set the outcoming response header Content-Length to "txt", the body to the status code body and the satus code to the given status code', () => {
    response.sendStatus(404)
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('text/plain; charset=utf-8')
    Chai.expect(callback.successResult.body).to.be.equal('Not Found')
  });

  it('#contentType should set content type to the given one', () => {
    const contentType = 'application/xml'
    response.contentType(contentType)
    response.send('test')
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('application/xml; charset=utf-8')
  });

  it('#contentType should set content type to the given one and transform it to a full mime type if it does not have /', () => {
    const contentType = 'xml'
    response.contentType(contentType)
    response.send('test')
    Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('application/xml; charset=utf-8')
  });

  it('#format should execute the first function which key (mime type) is accepted by the incoming request', () => {
    let result;
    response.format({
      'application/xml': (req, res) => {
        result = 'NO';
      },
      'application/json': (req, res) => {
        result = 'YES';
      }
    })
    Chai.expect(result).to.be.equal('YES')
  });

  it('#format should execute the default function if it exists and no key is accepted by the incoming request', () => {
    let result;
    response.format({
      'application/xml': (req, res) => {
        result = 'NO';
      },
      default: (req, res) => {
        result = 'YES';
      }
    })
    Chai.expect(result).to.be.equal('YES')
  });

  it('#format can execute #next if the function is given as argument', () => {
    let result;
    response.format({
      'application/json': (req, res, next) => {
        next();
      }
    }, (err) => { result = 'YES' })
    Chai.expect(result).to.be.equal('YES')
  });

  it('#format should execute #next with the "Not Acceptable" error if no key is accepted by the incoming request and #next is given as argument', () => {
    let err;
    response.format({
      'application/xml': (req, res, next) => {
        next();
      }
    }, (e) => { err = e })
    Chai.expect(err).to.not.be.undefined
    Chai.expect(err.statusCode).to.be.equal(406)
  });

  it('#format should throw "Not Acceptable" error if no key is accepted by the incoming request and #next is not given as argument', () => {
    let err;
    try {
      response.format({
        'application/xml': (req, res, next) => {
          next();
        }
      })
    } catch(e) {
      err = e;
    }
    Chai.expect(err).to.not.be.undefined
    Chai.expect(err.statusCode).to.be.equal(406)
  });

  it('#putHeader should set the header `field` to `value`', () => {
    response.putHeader('field', 'value');
    response.send('test');
    Chai.expect(callback.successResult.headers['field']).to.be.equal('value')
  });

  it('#putHeaders should set each header of `obj`', () => {
    response.putHeaders({
      'field1': 'value1',
      'field2': 'value2'
    });
    response.send('test');
    Chai.expect(callback.successResult.headers['field1']).to.be.equal('value1')
    Chai.expect(callback.successResult.headers['field2']).to.be.equal('value2')
  });

  it('#header should return a previously set header', () => {
    response.putHeader('field', 'value');
    Chai.expect(response.header('field')).to.be.equal('value')
  });

  it('#appendHeader should append a header to a previously set header', () => {
    response.putHeader('field', 'value1');
    response.appendHeader('field', 'value2');
    Chai.expect(response.header('field')).to.be.contain('value1')
    Chai.expect(response.header('field')).to.be.contain('value2')
  });

  it('#removeHeader should remove a previously set header', () => {
    response.putHeader('field', 'value1');
    response.removeHeader('field');
    Chai.expect(response.header('field')).to.be.undefined
  });

  it('#addCookie should add the `name` cookie with the `value` and the `options`', () => {
    response.addCookie('cookie', 'cookieValue', {path: '/test'})
    Chai.expect(response.header('Set-Cookie')).to.be.equal('cookie=cookieValue; Path=/test')
  });

  it('#addCookies should add all the cookies of `obj` with the `options`', () => {
    response.addCookies({
      cookie1: 'cookieValue1',
      cookie2: 'cookieValue2'
    }, {path: '/test'})
    Chai.expect(response.header('Set-Cookie')).to.contain('cookie1=cookieValue1; Path=/test')
    Chai.expect(response.header('Set-Cookie')).to.contain('cookie2=cookieValue2; Path=/test')
  });

  it('#clearCookie should add the cookie `field` with the `options` and the expires to 1 and the path to /', () => {
    response.clearCookie('cookie')
    Chai.expect(response.header('Set-Cookie')).to.be.equal('cookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
  });

  it('#cookie should return the cookie `name`', () => {
    response.addCookies({
      cookie1: 'cookieValue1',
      cookie2: 'cookieValue2'
    }, {path: '/test'})
    Chai.expect(response.cookie('cookie1')).to.be.equal('cookieValue1')
  });

  it('#location should set the header Location to the given URL', () => {
    response.location('/test');
    Chai.expect(response.header('Location')).to.be.equal('/test')
  });

  it('#redirect should set the header Location to the given URL and the status code to 302', () => {
    response.redirect('/test');
    Chai.expect(callback.successResult.headers['Location']).to.be.equal('/test')
    Chai.expect(callback.successResult.statusCode).to.be.equal(302)
  });

  it('#redirect should set the header Location to the given URL and the status code to the given one', () => {
    response.redirect('/test', 301);
    Chai.expect(callback.successResult.headers['Location']).to.be.equal('/test')
    Chai.expect(callback.successResult.statusCode).to.be.equal(301)
  });

  describe("render", () => {
    let renderStub: SinonStub;
    const router: IRouter = new Router();

    beforeEach(() => {
       renderStub = stub(TemplateEngine.prototype, "render");
       response.router = router;
       router.addTemplateEngine(null);
    });

    afterEach(() => {
      renderStub.restore();
      response.router = undefined;
    });

    it("should throw an exception if the `templateEngine` hasn't been set in the `App`.", () => {
      response.router = undefined;
      Chai.expect(() => response.render("fileName")).to.throw("The template engine must to be added in `app.addTemplateEngine` if you want to use render.");
    });

    it("should call the method `render` of `templateEngine` if it has been set in the `App`.", () => {
      response.render("fileName");
      Chai.expect(renderStub.calledOnce).to.be.true;
    });

    it("should call the `callback` with the result of `templateEngine.render`.", (done) => {
      const expectedResult: string = "Result of render.";
      renderStub.callsFake((view, params, callback) => callback(null, expectedResult));
      response.render("fileName", {}, (err, result) => {
        Chai.expect(result).to.be.equal(expectedResult);
        Chai.expect(err).to.be.null;
        done();
      });
    });

    it("should call the `callback` with the error if the `templateEngine.render` method returns an error and a `callback` is given.", (done) => {
      const expectedError: Error = new Error("Render error.");
      renderStub.callsFake((view, params, callback) => callback(expectedError, null));
      response.render("fileName", {}, (err, result) => {
        Chai.expect(err).to.be.equal(expectedError);
        Chai.expect(result).to.be.null;
        done();
      });
    });

    it("should call the `next` handler with the error if the `templateEngine.render` method returns an error and no `callback` is given.", (done) => {
      const expectedError: Error = new Error("Render error.");
      renderStub.callsFake((view, params, callback) => callback(expectedError, null));
      request.next = (err) => {
        Chai.expect(err).to.be.equal(expectedError);
        request.next = undefined;
        done();
      };
      response.render("fileName");
    });

    it("should response with the html code and the 'text/html' content-type header if the `templateEngine.render` method returns no error and no `callback` is given.", () => {
      const expectedResult: string = "Result of render.";
      renderStub.callsFake((view, params, callback) => callback(null, expectedResult));
      response.render("fileName");
      Chai.expect(callback.successResult.headers["Content-Type"]).to.contain("text/html");
      Chai.expect(callback.successResult.body).to.be.equal(expectedResult);
    });
  });

});
