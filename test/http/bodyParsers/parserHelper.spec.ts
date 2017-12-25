/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import { SinonSpy, spy } from "sinon";
import parserHelper from "./../../../src/lib/http/bodyParsers/parserHelper";
import HttpRequest from "./../../../src/lib/http/HttpRequest";
import IHttpHandler from "./../../../src/lib/types/http/IHttpHandler";
import IHttpRequest from "./../../../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../../../src/lib/types/http/IHttpResponse";

const mainEvent: any = {
  body: "body",
  headers: {
    "Content-Type": "application/json"
  },
  httpMethod: "POST",
  isBase64Encoded: true,
  path: "/blog",
  resource: "API"
};

/**
 * Test for parserHelper.
 */
describe("parserHelper", () => {
  const body: { [name: string]: any } = {
    param1: "value1"
  };
  const res: IHttpResponse = {} as IHttpResponse;
  let next: SinonSpy;
  let event: any;

  beforeEach(() => {
    event = Object.assign({}, mainEvent);
    event.headers = Object.assign({}, mainEvent.headers);
    next = spy();
  });

  it("should call 'next' WITHOUT an error if the body has been previously parsed.", () => {
    const parser: SinonSpy = spy(() => {
      return body;
    });

    const req: IHttpRequest = new HttpRequest(event);

    const handler: IHttpHandler = parserHelper(parser);

    handler(req, res, next);
    handler(req, res, next);

    Chai.expect(parser.calledOnce).to.be.true;
    Chai.expect(next.calledTwice).to.be.true;
    Chai.expect(next.args[1][0]).to.be.undefined;
  });

  it("should call 'next' WITHOUT an error if the body does not exist.", () => {
    event.body = undefined;
    const req: IHttpRequest = new HttpRequest(event);

    const parser: SinonSpy = spy();

    const handler: IHttpHandler = parserHelper(parser);
    handler(req, res, next);

    Chai.expect(parser.called).to.be.false;
    Chai.expect(next.called).to.be.true;
    Chai.expect(next.args[0][0]).to.be.undefined;
  });

  it("should call 'next' with a 400 error if the body can not be parsed and header contentType is NOT undefined.", () => {
    const req: IHttpRequest = new HttpRequest(event);

    const handler: IHttpHandler = parserHelper(() => {
      throw new Error();
    });
    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(next.args[0][0]).to.be.not.undefined;
    Chai.expect(next.args[0][0].statusCode).to.be.equal(400);
  });

  it("should call 'next' WITHOUT an error if the body can not be parsed and header contentType is undefined.", () => {
    event.headers["Content-Type"] = undefined;
    const req: IHttpRequest = new HttpRequest(event);

    const handler: IHttpHandler = parserHelper(() => {
      throw new Error();
    });
    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(next.args[0][0]).to.be.undefined;
  });

  it("should execute the parser function and set the request body with the returned value if the header contentType is the given one in params.", () => {
    const req: IHttpRequest = new HttpRequest(event);

    const parser: SinonSpy = spy();

    const handler: IHttpHandler = parserHelper(parser, ["application/json"]);
    handler(req, res, next);

    Chai.expect(parser.called).to.be.true;
  });

  it("should execute the parser function and set the request body with the returned value if no contentType is given in params.", () => {
    const req: IHttpRequest = new HttpRequest(event);

    const parser: SinonSpy = spy();

    const handler: IHttpHandler = parserHelper(parser);
    handler(req, res, next);

    Chai.expect(parser.called).to.be.true;
  });

  it("should execute the parser function and set the request body with the returned value if the header contentType is undefined.", () => {
    event.headers["Content-Type"] = undefined;
    const req: IHttpRequest = new HttpRequest(event);

    const parser: SinonSpy = spy();

    const handler: IHttpHandler = parserHelper(parser, ["application/json"]);
    handler(req, res, next);

    Chai.expect(parser.called).to.be.true;
  });

  it("should call 'next' WITHOUT execute the parser function otherwise.", () => {
    const req: IHttpRequest = new HttpRequest(event);

    const parser: SinonSpy = spy();

    const handler: IHttpHandler = parserHelper(parser, ["text/html"]);
    handler(req, res, next);

    Chai.expect(parser.called).to.be.false;
    Chai.expect(next.called);
  });
});
