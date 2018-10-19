/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import { SinonStub, stub } from "sinon";
import App from "./../../src/lib/App";
import HttpError from "./../../src/lib/exceptions/HttpError";
import httpFinalHandler from "./../../src/lib/http/httpFinalHandler";
import HttpRequest from "./../../src/lib/http/HttpRequest";
import HttpResponse from "./../../src/lib/http/HttpResponse";
import IHttpRequest from "./../../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../../src/lib/types/http/IHttpResponse";
import IApp from "./../../src/lib/types/IApp";
import IRawEvent from "./../../src/lib/types/IRawEvent";
import DefaultCallback from "./../utils/DefaultCallback";
import httpEvent from "./../utils/httpEvent";

/**
 * Test for httpFinalHandler.
 */
describe("httpFinalHandler", () => {
  const app: IApp = new App();
  let req: IHttpRequest;
  let res: IHttpResponse;
  let callback: DefaultCallback;
  let event: IRawEvent;

  beforeEach(() => {
    callback = new DefaultCallback();
    event = Object.assign({}, httpEvent);
    event.headers.Accept = "application/json";
    req = new HttpRequest(app, Object.assign({}, event));
    res = new HttpResponse(app, req, callback);
  });

  afterEach(() => {
    callback.setCallback(null);
  });

  it("should send a response with the headers: Content-Security-Policy, X-Content-Type-Options, Content-Type and Content-Length.", (done) => {
    callback.setCallback(() => {
      Chai.expect(callback.successResult.headers["Content-Security-Policy"]).to.be.not.empty;
      Chai.expect(callback.successResult.headers["X-Content-Type-Options"]).to.be.not.empty;
      Chai.expect(callback.successResult.headers["Content-Type"]).to.be.not.empty;
      Chai.expect(callback.successResult.headers["Content-Length"]).to.be.not.empty;
      done();
    });

    const handler = httpFinalHandler(req, res, {});
    handler();
  });

  it("should not send a response if a response is prevously sent.", (done) => {
    callback.setCallback(() => {
      Chai.expect(callback.successResult).to.be.not.undefined;
      callback.successResult.body = null;

      const handler = httpFinalHandler(req, res, {});
      handler();

      Chai.expect(callback.successResult.body).to.be.null;
      done();
    });
    res.send("");
  });

  it("should call #onerror handler if it is set in the #options.", (done) => {
    const handler = httpFinalHandler(req, res, {
      onerror: () => {
        done();
      }
    });
    handler();
  });

  it("should set the response status code as 404 and acording message if #err is undefined.", (done) => {
    callback.setCallback(() => {
      Chai.expect(callback.successResult.statusCode).to.be.equals(404);
      Chai.expect(JSON.parse(callback.successResult.body).message).to.be.equals("Cannot GET /blog/1");
      Chai.expect(JSON.parse(callback.successResult.body).error).to.be.equals(404);
      done();
    });

    const handler = httpFinalHandler(req, res, {});
    handler();
  });

  it("should set the response status code, headers and body from #err if it is not undefined.", (done) => {
    callback.setCallback(() => {
      Chai.expect(callback.successResult.statusCode).to.be.equals(403);
      Chai.expect(JSON.parse(callback.successResult.body).message).to.be.equals("Test msg");
      Chai.expect(JSON.parse(callback.successResult.body).error).to.be.equals(403);
      Chai.expect(callback.successResult.headers.errorHeader).to.be.equals("test");
      done();
    });

    const handler = httpFinalHandler(req, res, {});
    const error = new HttpError("Test msg", 403);
    error.headers = {errorHeader: "test"};
    handler(error);
  });

  it("should send a HTML response and HTML as content type if the request accepts HTML.", (done) => {
    callback.setCallback(() => {
      Chai.expect(callback.successResult.body).to.contain("<!DOCTYPE html>");
      done();
    });

    event.headers = Object.assign({}, event.headers);
    event.headers.Accept = "application/json,text/html";
    req = new HttpRequest(app, event);

    const handler = httpFinalHandler(req, res, {});
    handler();
  });

  it("should send a JSON response and JSON as content type if the request accepts JSON and it does not accept HTML.", (done) => {
    callback.setCallback(() => {
      Chai.expect(JSON.parse(callback.successResult.body)).to.be.a("object");
      done();
    });

    const handler = httpFinalHandler(req, res, {});
    handler();
  });

  it("should send a PLAIN response and PLAIN as content type if the request does not accept JSON neither HTML.", (done) => {
    callback.setCallback(() => {
      Chai.expect(callback.successResult.body).to.be.equals("Cannot GET /blog/1");
      done();
    });

    event.headers = Object.assign({}, event.headers);
    event.headers.Accept = "application/pdf";
    req = new HttpRequest(app, event);

    const handler = httpFinalHandler(req, res, {});
    handler();
  });

  it("should set status code from res if it is higher than 400, lower than 600 and the error is not of type HttpError.", (done) => {
    callback.setCallback(() => {
      Chai.expect(callback.successResult.statusCode).to.be.equals(404);
      done();
    });

    const handler = httpFinalHandler(req, res, {});
    res.status(404);
    const error = new Error("No HTTP error.");
    handler(error);
  });

  it("should set status code 500 if the res status code is lower than 400 or higher than 600 and the error is not of type HttpError.", (done) => {
    callback.setCallback(() => {
      Chai.expect(callback.successResult.statusCode).to.be.equals(500);
      done();
    });

    const handler = httpFinalHandler(req, res, {});
    res.status(300);
    const error = new Error("No HTTP error.");
    handler(error);
  });

  it("should set status code 500 if the status code of HttpError is not set.", (done) => {
    callback.setCallback(() => {
      Chai.expect(callback.successResult.statusCode).to.be.equals(500);
      done();
    });

    const handler = httpFinalHandler(req, res, {});
    const error = new HttpError("HTTP error.", null);
    handler(error);
  });

  it("should call the endHandlers.", (done) => {
    const endHandler: SinonStub = stub();
    endHandler.returns(Promise.resolve());

    callback.setCallback(() => {
      Chai.expect(endHandler.calledOnce).to.be.true;
      done();
    });

    const handler = httpFinalHandler(req, res, {
      endHandlers: [
        endHandler
      ]
    });
    handler();
  });

});
