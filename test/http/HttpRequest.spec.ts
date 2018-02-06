/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import App from "./../../src/lib/App";
import HttpRequest from "./../../src/lib/http/HttpRequest";
import HttpResponse from "./../../src/lib/http/HttpResponse";
import ICookie from "./../../src/lib/types/http/ICookie";
import IHttpRequest from "./../../src/lib/types/http/IHttpRequest";
import IRawEvent from "./../../src/lib/types/IRawEvent";
import DefaultCallback from "./../utils/DefaultCallback";
import httpEvent from "./../utils/httpEvent";

/**
 * Test for HttpRequest.
 */
describe("HttpRequest", () => {
  let request: IHttpRequest;
  let event: IRawEvent;
  const app = new App();

  beforeEach((done) => {
    event = Object.assign({}, httpEvent);
    request = new HttpRequest(app, event);

    done();
  });

  it("should have empty header if the headers of the event is undefined.", () => {
    delete event.headers;

    request = new HttpRequest(app, event);

    Chai.expect(request.headers).to.be.empty;
  });

  it("#headers should return the incoming request headers", () => {
    const headers = {};
    for (const key of Object.keys(event.headers)) {
      headers[key.toLowerCase()] = event.headers[key];
    }
    Chai.expect(request.headers).includes(headers);
  });

  it("#protocol should return the incoming request protocol", () => {
    Chai.expect(request.protocol).to.be.equal(event.headers["X-Forwarded-Proto"]);
  });

  it("#secure should return true if the incoming request is secure", () => {
    Chai.expect(request.secure).to.be.true;
  });

  it("#secure should return false if the incoming request is not secure", () => {
    request.headers["x-forwarded-proto"] = "http";
    Chai.expect(request.secure).to.be.false;
  });

  it("#ip should return the incoming request user ip", () => {
    Chai.expect(request.ip).to.be.equal("197.0.0.0");
  });

  it("#ip should return the incoming request user ip although the app is through a proxy", () => {
    request.headers["x-forwarded-for"] = "197.0.0.0, 197.0.0.1, 197.0.0.2";
    Chai.expect(request.ip).to.be.equal("197.0.0.2");
  });

  it("#path should return the incoming request path", () => {
    Chai.expect(request.path).to.be.equals(event.path);
  });

  it("#method should return the incoming request method", () => {
    Chai.expect(request.method).to.be.equal(event.httpMethod);
  });

  it("#hostname should return the incoming request hostname", () => {
    Chai.expect(request.hostname).to.be.equal(event.headers.Host);
  });

  it("#xhr should return true if the incoming request is an AJAX request", () => {
    request.headers["x-requested-with"] = "xmlhttprequest";
    Chai.expect(request.xhr).to.be.true;
  });

  it("#xhr should return false if the incoming request is not an AJAX request", () => {
    Chai.expect(request.xhr).to.be.false;
  });

  it("#params should return the intersection between the query, body and stage params (the path params will be included in router)", () => {
    Chai.expect(request.params).to.include({
      query1: "Query 1",
      stage1: "Stage 1"
    });
  });

  it("#header should return the value of the header given as argument", () => {
    Chai.expect(request.header("header1")).to.be.equal("HEADER VALUE 1");
  });

  it("#accepts should return the same type given as argument if it is accepted as response mime type", () => {
    Chai.expect(request.accepts("text/html")).to.be.equal("text/html");
  });

  it("#accepts should return false if the type given as argument is not accepted as response mime type", () => {
    Chai.expect(request.accepts("application/xml")).to.be.false;
  });

  it("#accepts should return the preferred type to be used as response mime type between the ones given in the parameter", () => {
    Chai.expect(request.accepts(["application/json", "text/html"])).to.be.equal("application/json");
  });

  it("#acceptsEncodings should return the same encoding given as argument if it is accepted as response encoding", () => {
    Chai.expect(request.acceptsEncodings("deflate")).to.be.equal("deflate");
  });

  it("#acceptsEncodings should return false if the encoding given as argument is not accepted as response encoding", () => {
    Chai.expect(request.acceptsEncodings("enc")).to.be.false;
  });

  it("#acceptsEncodings should return the preferred encoding to be used as response encoding between the ones given in the parameter", () => {
    Chai.expect(request.acceptsEncodings(["gzip", "deflate"])).to.be.equal("gzip");
  });

  it("#acceptsCharsets should return the same charset given as argument if it is accepted as response charset", () => {
    Chai.expect(request.acceptsCharsets("ISO-8859-1")).to.be.equal("ISO-8859-1");
  });

  it("#acceptsCharsets should return false if the charset given as argument is not accepted as response charset", () => {
    Chai.expect(request.acceptsCharsets("UTF-6")).to.be.false;
  });

  it("#acceptsCharsets should return the preferred charset to be used as response charset between the ones given in the parameter", () => {
    Chai.expect(request.acceptsCharsets(["UTF-8", "ISO-8859-1"])).to.be.equal("UTF-8");
  });

  it("#acceptsLanguages should return the same language given as argument if it is accepted as response language", () => {
    Chai.expect(request.acceptsLanguages("en")).to.be.equal("en");
  });

  it("#acceptsLanguages should return false if the language given as argument is not accepted as response language", () => {
    Chai.expect(request.acceptsLanguages("de")).to.be.false;
  });

  it("#acceptsLanguages should return the preferred language to be used as response language between the ones given in the parameter", () => {
    Chai.expect(request.acceptsLanguages(["es", "en"])).to.be.equal("es");
  });

  it("#param should return the value of the param given as argument if it is into the query params", () => {
    Chai.expect(request.param("query1")).to.be.equal("Query 1");
  });

  it("#param should return the value of the param given as argument if it is into the stage variables", () => {
    Chai.expect(request.param("stage1")).to.be.equal("Stage 1");
  });

  it("#param should return the default value if the value of the param given as argument does not exist", () => {
    Chai.expect(request.param("noParam", "0")).to.be.equal("0");
  });

  it("#param should return null if the value of the param given as argument does not exist and no default value is given", () => {
    Chai.expect(request.param("noParam")).to.be.undefined;
  });

  it("#is should return true if the types given as parameter are accepted as response mime types", () => {
    Chai.expect(request.is("application/json"));
    Chai.expect(request.is(["application/json", "text/html"]));
  });

  it("#is should return false if the types given as parameter are not accepted as response mime types", () => {
    Chai.expect(request.is("application/xml"));
    Chai.expect(request.is(["application/xml", "text/html"]));
  });

  it("#fresh should return true if the request is 'fresh'", () => {
    const callback: DefaultCallback = new DefaultCallback();
    const response = new HttpResponse(app, request, callback);
    response.status(200);
    response.putHeader("ETag", "etagValue");
    response.putHeader("Last-Modified", "2017-10-10T10:10:09");
    Chai.expect(request.fresh(response)).to.be.true;
  });

  it("#fresh should return false if the request is not 'fresh'", () => {
    const callback: DefaultCallback = new DefaultCallback();
    const response = new HttpResponse(app, request, callback);
    response.status(200);
    Chai.expect(request.fresh(response)).to.be.false;
  });

  it("#stale should return true if the request is 'stale'", () => {
    const callback: DefaultCallback = new DefaultCallback();
    const response = new HttpResponse(app, request, callback);
    response.status(200);
    response.putHeader("ETag", "etagValue");
    response.putHeader("Last-Modified", "2017-10-10T10:10:09");
    Chai.expect(request.stale(response)).to.be.false;
  });

  it("#stale should return false if the request is not 'stale'", () => {
    const callback: DefaultCallback = new DefaultCallback();
    const response = new HttpResponse(app, request, callback);
    response.status(200);
    Chai.expect(request.stale(response)).to.be.true;
  });

  describe("#cookies", () => {
    it("returns an object with all the cookies of the `Cookie` header.", () => {
      const cookies: { [name: string]: ICookie } = request.cookies;

      Chai.expect(cookies.cookie1.name).to.be.equal("cookie1");
      Chai.expect(cookies.cookie1.value).to.be.equal("value1");
      Chai.expect(cookies.cookie2.name).to.be.equal("cookie2");
      Chai.expect(cookies.cookie2.value).to.be.equal("value2");
    });
  });

  describe("#cookie", () => {
    it("returns the cookie of the `Cookie` header with the given name.", () => {
      Chai.expect(request.cookie("cookie1").name).to.be.equal("cookie1");
      Chai.expect(request.cookie("cookie1").value).to.be.equal("value1");
    });
  });

});
