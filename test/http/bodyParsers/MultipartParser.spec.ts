import * as Chai from "chai";
import { spy, SinonSpy } from "sinon";
import MultipartParser from "./../../../src/lib/http/bodyParsers/MultipartParser";
import HttpUploadedFile from "./../../../src/lib/http/HttpUploadedFile";
import HttpRequest from "./../../../src/lib/http/HttpRequest";
import IHttpHandler from "./../../../src/lib/types/http/IHttpHandler";
import IHttpRequest from "./../../../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../../../src/lib/types/http/IHttpResponse";
import IHttpUploadedFile from "./../../../src/lib/types/http/IHttpUploadedFile";

const mainEvent: any = {
  body: "------WebKitFormBoundaryvef1fLxmoUdYZWXp\n"
      + "Content-Disposition: form-data; name=\"text\"\n"
      + "\n"
      + "text default\n"
      + "------WebKitFormBoundaryvef1fLxmoUdYZWXp\n"
      + "Content-Disposition: form-data; name=\"file\"; filename=\"A.txt\"\n"
      + "Content-Type: text/plain\n"
      + "Content-Length: 17\n"
      + "Other-Header: Other\n"
      + "\n"
      + "file text default\n"
      + "------WebKitFormBoundaryvef1fLxmoUdYZWXp--",
  headers: {
    "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryvef1fLxmoUdYZWXp"
  },
  httpMethod: "POST",
  isBase64Encoded: true,
  path: "/blog",
  resource: "API"
};

/**
 * Test for MultipartParser.
 */
describe("MultipartParser", () => {
  const res: IHttpResponse = <IHttpResponse> <any> {};
  let next: SinonSpy;
  let event: any;
  const handler: IHttpHandler = (new MultipartParser()).create();

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

  it("should set the body with the parsed body as an object if header contentType is 'multipart/form-data'.", () => {
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    const expectedFiles: IHttpUploadedFile[] = [];
    expectedFiles.push(new HttpUploadedFile("text/plain", 17, "A.txt", "file text default", {
      "content-disposition": "form-data",
      "content-type": "text/plain",
      "content-length": "17",
      "other-header": "Other"
    }));

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.deep.equal({text: "text default"});
    Chai.expect(req.files).to.be.deep.equal(expectedFiles);
  });

  it("should NOT set the body if header contentType is 'text/html'.", () => {
    event.headers["Content-Type"] = "text/html";
    const req: IHttpRequest = new HttpRequest(event);

    handler(req, res, next);

    Chai.expect(next.called).to.be.true;
    Chai.expect(req.body).to.be.equal(event.body);
  });
});
