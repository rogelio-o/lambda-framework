import * as Chai from "chai";
import HttpUploadedFile from "../../src/lib/http/HttpUploadedFile";
import IHttpUploadedFile from "../../src/lib/types/http/IHttpUploadedFile";

const CONTENT_TYPE: string = "text/plain";
const LENGTH: number = 1;
const FILE_NAME: string = "fileName.txt";
const CONTENT: string = "Amazin content.";
const HEADERS: {[name: string]: string} = {header1: "value 1"};

/**
 * Test for HttpUploadedFile.
 */
describe("HttpUploadedFile", () => {
  const uploadedFile: IHttpUploadedFile = new HttpUploadedFile(CONTENT_TYPE, LENGTH, FILE_NAME, CONTENT, HEADERS);

  describe("#contentType", () => {
    it("should return the initialized value.", () => {
      Chai.expect(uploadedFile.contentType).to.be.equal(CONTENT_TYPE);
    });
  });

  describe("#length", () => {
    it("should return the initialized value.", () => {
      Chai.expect(uploadedFile.length).to.be.equal(LENGTH);
    });
  });

  describe("#fileName", () => {
    it("should return the initialized value.", () => {
      Chai.expect(uploadedFile.fileName).to.be.equal(FILE_NAME);
    });
  });

  describe("#content", () => {
    it("should return the initialized value.", () => {
      Chai.expect(uploadedFile.content).to.be.equal(CONTENT);
    });
  });

  describe("#headers", () => {
    it("should return the initialized value.", () => {
      Chai.expect(uploadedFile.headers).to.be.equal(HEADERS);
    });
  });
});
