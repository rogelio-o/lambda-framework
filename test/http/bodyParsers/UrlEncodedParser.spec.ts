import * as Chai from "chai";
import { spy, SinonSpy } from "sinon";
import UrlEncodedParser from "./../../../src/lib/http/bodyParsers/UrlEncodedParser";
import HttpRequest from "./../../../src/lib/http/HttpRequest";
import IHttpHandler from "./../../../src/lib/types/http/IHttpHandler";
import IHttpRequest from "./../../../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../../../src/lib/types/http/IHttpResponse";

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
  const res: IHttpResponse = <IHttpResponse> <any> {};
  let next: SinonSpy;
  let event: any;
  const handler: IHttpHandler = (new UrlEncodedParser()).create();

  beforeEach(() => {
    event = Object.assign({}, mainEvent);
    event.headers = Object.assign({}, mainEvent.headers);
    next = spy();
  });

  it("should call 'next' WITHOUT an  error if the body can not be parsed and header contentType is undefined.", () => {
    event.body = "errorBody";
    event.headers["Content-Type"] = undefined;
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(next.args[0][0]).to.be.undefined;
  });

  it("should set the body with the parsed body as an object if header contentType is 'application/x-www-form-urlencoded'.", () => {
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.deep.equal({param1: "Value1", param2: "value2"});
  });

  it("should set the body with the parsed body as an object if header contentType is undefined.", () => {
    event.headers["Content-Type"] = undefined;
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.deep.equal({param1: "Value1", param2: "value2"});
  });

  it("should NOT set the body if header contentType is 'text/html'.", () => {
    event.headers["Content-Type"] = "text/html";
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.equal(event.body);
  });
});
