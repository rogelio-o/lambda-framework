import * as Chai from "chai";
import { spy, SinonSpy } from "sinon";
import httpEvent from "./../../utils/httpEvent";
import JsonParser from "./../../../src/lib/http/bodyParsers/JsonParser";
import HttpRequest from "./../../../src/lib/http/HttpRequest";
import IHttpHandler from "./../../../src/lib/types/http/IHttpHandler";
import IHttpRequest from "./../../../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../../../src/lib/types/http/IHttpResponse";

/**
 * Test for JsonParser.
 */
describe("JsonParser", () => {
  const res: IHttpResponse = <IHttpResponse> <any> {};
  let next: SinonSpy;
  let event: any;
  const handler: IHttpHandler = (new JsonParser()).create();

  beforeEach(() => {
    event = Object.assign({}, httpEvent);
    event.httpMethod = "POST";
    event.headers = Object.assign({}, httpEvent.headers);
    event.headers["Content-Type"] = "application/json";
    event.body = "{\"param1\": \"value1\"}";
    next = spy();
  });

  it("should call 'next' with a 400 error if the body can not be parsed and header contentType is 'application/json'.", () => {
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

  it("should set the body with the parsed body as an object if header contentType is 'application/json'.", () => {
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.deep.equal({param1: "value1"});
  });

  it("should set the body with the parsed body as an object if header contentType is undefined.", () => {
    event.headers["Content-Type"] = undefined;
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.deep.equal({param1: "value1"});
  });

  it("should NOT set the body if header contentType is 'text/html'.", () => {
    event.headers["Content-Type"] = "text/html";
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.equal(event.body);
  });
});
