import * as Chai from 'chai'
import { sign } from "cookie-signature";
import { stub, SinonStub } from "sinon";
import HttpError from "./../../src/lib/exceptions/HttpError";
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

  describe("#send", () => {
    it('should set the outcoming response body to the given string with "html" content type header and the right content length header', () => {
      response.send('ABC')
      Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('text/html; charset=utf-8')
      Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal('3')
      Chai.expect(response.isSent).to.be.true
    });

    it('should set the outcoming response body to the given number with no content type header and the right content length header', () => {
      response.send(false)
      Chai.expect(callback.successResult.headers['Content-Type']).to.be.undefined
      Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal('5')
      Chai.expect(callback.successResult.body).to.be.equal('false')
      Chai.expect(response.isSent).to.be.true
    });

    it('should set the outcoming response body to the given boolean with no content type header and the right content length header', () => {
      response.send(1)
      Chai.expect(callback.successResult.headers['Content-Type']).to.be.undefined
      Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal('1')
      Chai.expect(callback.successResult.body).to.be.equal('1')
      Chai.expect(response.isSent).to.be.true
    });

    it('should set the outcoming response body to the given Buffer with "bin" content type header and the right content length header', () => {
      response.send(new Buffer('test'))
      Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('bin')
      Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal('4')
      Chai.expect(callback.successResult.body).to.be.equal('test')
      Chai.expect(response.isSent).to.be.true
    });

    it('should set the outcoming response header ETag to the generated with the function in #app.get(Configuration.ETAG_FN)', () => {
      app.set(configuration.ETAG_FN, (buff, encoding) => 'ETAG' + buff.toString(encoding))
      response.send('test')
      Chai.expect(callback.successResult.headers['ETag']).to.be.equal('ETAGtest')
    });

    it('should set the outcoming response status code to 304 if the response is not fresh', () => {
      app.set(configuration.ETAG_FN, (buff, encoding) => 'etagValue')
      response.putHeader('Last-Modified', '2017-10-10T10:10:09')
      response.send('test')
      Chai.expect(callback.successResult.statusCode).to.be.equal(304)
    });

    it('should not set the outcoming response irrelevant headers (Content-Type, Content-Length and Transfer-Encoding) and the body if the response status code is 204', () => {
      response.status(204)
      response.send('')
      Chai.expect(callback.successResult.headers['Content-Type']).to.be.undefined
      Chai.expect(callback.successResult.headers['Content-Length']).to.be.undefined
      Chai.expect(callback.successResult.headers['Transfer-Encoding']).to.be.undefined
    });

    it('should not set the outcoming response irrelevant headers (Content-Type, Content-Length and Transfer-Encoding) and the body if the response status code is 304', () => {
      response.status(304)
      response.send('')
      Chai.expect(callback.successResult.headers['Content-Type']).to.be.undefined
      Chai.expect(callback.successResult.headers['Content-Length']).to.be.undefined
      Chai.expect(callback.successResult.headers['Transfer-Encoding']).to.be.undefined
    });

    it('should set the outcoming response body to null if the request method is HEAD', () => {
      event.httpMethod = 'HEAD'
      response.send('test')
      Chai.expect(callback.successResult.body).to.be.undefined
    });

    it("should set content type to bin if the sent body is a buffer and there is no previous set content type into the response.", () => {
      response.send(new Buffer(1));
      Chai.expect(callback.successResult.headers["Content-Type"]).to.be.equal("bin");
    });

    it("should no set the conent-length header.", () => {
      response.send(undefined);
      Chai.expect(callback.successResult.headers["Content-Length"]).to.be.undefined;
    });

    it("should generate a etag and put it into the response header if there is a generator function configurated in the app.", () => {
      app.set(configuration.ETAG_FN, (buff, encoding) => {
        return buff.toString() + "-" + encoding;
      });

      response.send("test");
      Chai.expect(callback.successResult.headers["ETag"]).to.be.equal("test-undefined");
    });

    it("should pass the error param to the callback function if an error is set.", () => {
      const err = new HttpError("Test error.", 500);
      response.setError(err);
      response.send("");
      Chai.expect(callback.errorResult).to.be.equal(err);
    });

    it("should pass the error param with the cause to the callback function if an error is set and it has a cause.", () => {
      const cause = new Error("Cause error.");
      const err = new HttpError("Test error.", 500, cause);
      response.setError(err);
      response.send("");
      Chai.expect(callback.errorResult).to.be.equal(cause);
    });
  });

  describe("#json", () => {
    it('should set the outcoming response header Content-Type to "application/json"', () => {
      response.json({})
      Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('application/json; charset=utf-8')
    });

    it("should keep the previous set content type if exists.", () => {
      response.contentType("text/plain");
      response.json({})
      Chai.expect(callback.successResult.headers["Content-Type"]).to.be.equal("text/plain; charset=utf-8")
    });

    it('should set the outcoming response header Content-Length to the right length', () => {
      const body = {test: 'test1'}
      const parsedBody = stringify(body, undefined, undefined, undefined)
      response.json(body)
      Chai.expect(callback.successResult.headers['Content-Length']).to.be.equal(parsedBody.length.toString())
      Chai.expect(callback.successResult.body).to.be.equal(parsedBody)
    });
  });

  describe("#sendStatus", () => {
    it('should set the outcoming response header Content-Length to "txt", the body to the status code body and the satus code to the given status code', () => {
      response.sendStatus(404)
      Chai.expect(callback.successResult.headers['Content-Type']).to.be.equal('text/plain; charset=utf-8')
      Chai.expect(callback.successResult.body).to.be.equal('Not Found')
    });

    it("should set the status code as response body if there is no message for it.", () => {
      response.sendStatus(1)
      Chai.expect(callback.successResult.body).to.be.equal("1");
    });
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

  describe("#appendHeader", () => {
    it('should append a header to a previously set header', () => {
      response.putHeader('field', 'value1');
      response.appendHeader('field', 'value2');
      Chai.expect(response.header('field')).to.be.contain('value1')
      Chai.expect(response.header('field')).to.be.contain('value2')
    });

    it("should add append a header to a list of headers previously set.", () => {
      response.putHeader("field", ["value1", "value2"]);
      response.appendHeader("field", "value3");
      Chai.expect(response.header("field")).to.be.deep.equal(["value1", "value2", "value3"]);
    });

    it("should add append a list of headers to a list of headers previously set.", () => {
      response.putHeader("field", ["value1", "value2"]);
      response.appendHeader("field", ["value3", "value4"]);
      Chai.expect(response.header("field")).to.be.deep.equal(["value1", "value2", "value3", "value4"]);
    });

    it("should add append a list of headers to a header previously set.", () => {
      response.putHeader("field", "value1");
      response.appendHeader("field", ["value2", "value3"]);
      Chai.expect(response.header("field")).to.be.deep.equal(["value1", "value2", "value3"]);
    });
  });

  it('#removeHeader should remove a previously set header', () => {
    response.putHeader('field', 'value1');
    response.removeHeader('field');
    Chai.expect(response.header('field')).to.be.undefined
  });

  describe("#addCookie", () => {
    it('should add the `name` cookie with the `value` and the `options`', () => {
      response.addCookie('cookie', 'cookieValue', {path: '/test'})
      Chai.expect(response.header('Set-Cookie')).to.be.equal('cookie=cookieValue; Path=/test')
    });

    it("should throw an error if the option `signed` is true and the app has no `secret`.", () => {
      app.set(configuration.COOKIE_SECRET, null);
      Chai.expect(() => response.addCookie("cookie", "cookieValue", {signed: true})).to.throw("app.set(\"cookie_secret\", \"SECRET\") required for signed cookies.");
    });

    it("should stringify the value of the cookie if is an object.", () => {
      response.addCookie("cookie", {key: "value"});
      Chai.expect(response.header("Set-Cookie")).to.be.equal("cookie=" + encodeURIComponent("j:{\"key\":\"value\"}") + "; Path=/");
    });

    it("should sign the value with the secret if the option `signed` is true.", () => {
      app.set(configuration.COOKIE_SECRET, "SUPER_SECRET");
      response.addCookie("cookie", "cookieValue", {signed: true});
      Chai.expect(response.header("Set-Cookie")).to.be.equal("cookie=" + encodeURIComponent("s:" + sign("cookieValue", app.get(configuration.COOKIE_SECRET))) + "; Path=/");
    });

    it("should add `expires` and `maxAge` into the cookie if `maxAge` is given in options.", () => {
      var oldDate = Date;
      global.Date = new Proxy(Date, {
        construct: function(target, args) {
          return new oldDate(2017, 11, 19, 0, 0, 0, 0);
        }
      });

      var x = new Date();
      response.addCookie("cookie", "cookieValue", {maxAge: 5000}); // 5 seconds
      const expires = new Date(Date.now() + 5000);
      Chai.expect(response.header("Set-Cookie")).to.be.equal("cookie=cookieValue; Max-Age=5; Path=/; Expires=" + expires.toUTCString());

      global.Date = oldDate;
    });
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

  describe("location", () => {
    it('should set the header Location to the given URL', () => {
      response.location('/test');
      Chai.expect(response.header('Location')).to.be.equal('/test')
    });

    it("should set the header Location to the Referrer URL if it exists and the given URL is \"back\".", () => {
      request.headers["referrer"] = "/previous-url";
      response.redirect("back");
      Chai.expect(callback.successResult.headers["Location"]).to.be.equal("/previous-url");
    });

    it("should set the header Location to / if the Referrer URL does not exist and the given URL is \"back\".", () => {
      response.redirect("back");
      Chai.expect(callback.successResult.headers["Location"]).to.be.equal("/");
    });
  });

  describe("#redirect", () => {
    it('should set the header Location to the given URL and the status code to 302', () => {
      response.redirect('/test');
      Chai.expect(callback.successResult.headers['Location']).to.be.equal('/test')
      Chai.expect(callback.successResult.statusCode).to.be.equal(302)
    });

    it('should set the header Location to the given URL and the status code to the given one', () => {
      response.redirect('/test', 301);
      Chai.expect(callback.successResult.headers['Location']).to.be.equal('/test')
      Chai.expect(callback.successResult.statusCode).to.be.equal(301)
    });

    it("should set the body to HTML text if the request accepts text/html.", () => {
      request.headers["accept"] = "text/html";
      response.redirect("/test");
      Chai.expect(callback.successResult.body).to.be.equal("<p>Found. Redirecting to <a href=\"/test\">/test</a></p>");
    });

    it("should set the body to plain text if the request accepts text/plain.", () => {
      request.headers["accept"] = "text/plain";
      response.redirect("/test");
      Chai.expect(callback.successResult.body).to.be.equal("Found. Redirecting to /test.");
    });

    it("should set the body to empty string if the request doesn't accepts neither text/html nor text/plain.", () => {
      request.headers["accept"] = "application/json";
      response.redirect("/test");
      Chai.expect(callback.successResult.body).to.be.equal("");
    });

    it("should set the body to empty string, 200 status code, and no Location header if the request HTTP method is HEAD.", () => {
      event.httpMethod = "HEAD";
      response.redirect("/test");
      Chai.expect(callback.successResult.body).to.be.undefined;
      Chai.expect(callback.successResult.headers["Location"]).to.be.equal("/test");
      Chai.expect(callback.successResult.statusCode).to.be.equal(302);
    });
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
