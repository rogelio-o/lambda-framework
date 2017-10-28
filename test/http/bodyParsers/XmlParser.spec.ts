import * as Chai from "chai";
import { spy, SinonSpy } from "sinon";
import XmlParser from "./../../../src/lib/http/bodyParsers/XmlParser";
import HttpRequest from "./../../../src/lib/http/HttpRequest";
import IHttpHandler from "./../../../src/lib/types/http/IHttpHandler";
import IHttpRequest from "./../../../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../../../src/lib/types/http/IHttpResponse";

const mainEvent: any = {
  body: "<root><tag1 attribute1=\"valueAttribute1\">value1</tag1></root>",
  headers: {
    "Content-Type": "text/xml"
  },
  httpMethod: "POST",
  isBase64Encoded: true,
  path: "/blog",
  resource: "API"
};

/**
 * Test for XmlParser.
 */
describe("XmlParser", () => {
  const expectedBody = {
    root: {
      tag1: {
          "$t": "value1",
          "attribute1": "valueAttribute1"
      }
    }
  };
  const res: IHttpResponse = <IHttpResponse> <any> {};
  let next: SinonSpy;
  let event: any;
  const handler: IHttpHandler = (new XmlParser()).create();

  beforeEach(() => {
    event = Object.assign({}, mainEvent);
    event.headers = Object.assign({}, mainEvent.headers);
    next = spy();
  });

  it("should call 'next' with a 400 error if the body can not be parsed and header contentType is 'text/xml'.", () => {
    event.body = "errorBody";
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(next.args[0][0]).to.be.not.undefined;
    Chai.expect(next.args[0][0].statusCode).to.be.equal(400);
  });

  it("should call 'next' WITHOUT an  error if the body can not be parsed and header contentType is undefined.", () => {
    event.body = "errorBody";
    event.headers["Content-Type"] = undefined;
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(next.args[0][0]).to.be.undefined;
  });

  it("should set the body with the parsed body as an object if header contentType is 'text/xml'.", () => {
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.deep.equal(expectedBody);
  });

  it("should set the body with the parsed body as an object if header contentType is undefined.", () => {
    event.headers["Content-Type"] = undefined;
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.deep.equal(expectedBody);
  });

  it("should NOT set the body if header contentType is 'text/html'.", () => {
    event.headers["Content-Type"] = "text/html";
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.equal(event.body);
  });
});
