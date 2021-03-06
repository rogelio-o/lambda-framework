/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import * as qs from "qs";
import * as querystring from "querystring";
import { SinonSpy, SinonStub, spy, stub } from "sinon";
import App from "./../../../src/lib/App";
import UrlEncodedParser from "./../../../src/lib/http/bodyParsers/UrlEncodedParser";
import HttpRequest from "./../../../src/lib/http/HttpRequest";
import IHttpHandler from "./../../../src/lib/types/http/IHttpHandler";
import IHttpRequest from "./../../../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../../../src/lib/types/http/IHttpResponse";
import IApp from "./../../../src/lib/types/IApp";

const mainEvent: any = {
  body: "param1=Value1&param2=value2",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  httpMethod: "POST",
  isBase64Encoded: true,
  path: "/blog",
  resource: "API"
};

/**
 * Test for UrlEncodedParser.
 */
describe("UrlEncodedParser", () => {
  const app: IApp = new App();
  const res: IHttpResponse = {} as IHttpResponse;
  let next: SinonSpy;
  let event: any;
  const handler: IHttpHandler = (new UrlEncodedParser()).create({parameterLimit: 2});

  beforeEach(() => {
    event = Object.assign({}, mainEvent);
    event.headers = Object.assign({}, mainEvent.headers);
    next = spy();
  });

  it("should call 'next' WITHOUT an  error if the body can not be parsed and header contentType is undefined.", () => {
    event.body = "errorBody";
    event.headers["Content-Type"] = undefined;
    const req: IHttpRequest = new HttpRequest(app, event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(next.args[0][0]).to.be.undefined;
  });

  it("should set the body with the parsed body as an object if header contentType is 'application/x-www-form-urlencoded'.", () => {
    const req: IHttpRequest = new HttpRequest(app, event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.deep.equal({param1: "Value1", param2: "value2"});
  });

  it("should set the body with the parsed body as an object if header contentType is undefined.", () => {
    event.headers["Content-Type"] = undefined;
    const req: IHttpRequest = new HttpRequest(app, event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.deep.equal({param1: "Value1", param2: "value2"});
  });

  it("should NOT set the body if header contentType is 'text/html'.", () => {
    event.headers["Content-Type"] = "text/html";
    const req: IHttpRequest = new HttpRequest(app, event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.equal(event.body);
  });

  it("should throw an exception if there are more parameters than the indicated by the limit.", () => {
    event.body = mainEvent.body + "&param3=value3";

    const req: IHttpRequest = new HttpRequest(app, event);
    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(next.args[0][0].message).to.be.equal("Too many parameters.");
  });

  it("should throw an exception if the configured parameter limit is not a number.", () => {
    Chai.expect(() => (new UrlEncodedParser()).create({parameterLimit: "aa"})).throw("Option parameterLimit must be a positive number.");
  });

  it("should throw an exception if the configured parameter limit is a number lower than 1.", () => {
    Chai.expect(() => (new UrlEncodedParser()).create({parameterLimit: 0})).throw("Option parameterLimit must be a positive number.");
  });

  it("should use `qs` library if the options extended is true or by default.", () => {
    const stubQS = stub(qs, "parse");

    const req: IHttpRequest = new HttpRequest(app, event);
    handler(req, res, next);

    Chai.expect(stubQS.called).to.be.true;
  });

  it("should use `querystring` library if it is NOT extended.", () => {
    const newHandler: IHttpHandler = (new UrlEncodedParser()).create({extended: false});
    const stubQS = stub(querystring, "parse");

    const req: IHttpRequest = new HttpRequest(app, event);
    newHandler(req, res, next);

    Chai.expect(stubQS.called).to.be.true;
  });
});
