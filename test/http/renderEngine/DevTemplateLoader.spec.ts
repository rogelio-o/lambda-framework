/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import * as mock from "mock-fs";
import DevTemplateLoader from "./../../../src/lib/http/renderEngine/DevTemplateLoader";
import ITemplate from "./../../../src/lib/types/http/renderEngine/ITemplate";
import ITemplateLoader from "./../../../src/lib/types/http/renderEngine/ITemplateLoader";

/**
 * Test for DevTemplateLoader.
 */
describe("DevTemplateLoader", () => {
  const loader: ITemplateLoader = new DevTemplateLoader("/base/path");

  beforeEach(() => {
    mock({
      "/base/path": {
        "prueba.pug": new Buffer("Test content.", "utf8")
      }
    });
  });

  afterEach(mock.restore);

  describe("load", () => {
    it("should return the template with the `fileName` and the file `content` if the file exists.", (done) => {
      loader.load("prueba.pug", (err: Error, template: ITemplate) => {
        Chai.expect(err).to.be.null;
        Chai.expect(template.fileName).to.be.equal("prueba.pug");
        Chai.expect(template.content).to.be.equal("Test content.");
        done();
      });
    });

    it("should return an error if the file doesn't exist.", (done) => {
      loader.load("not-existing-file.pug", (err: Error, template: ITemplate) => {
        Chai.expect(err).to.be.not.null;
        Chai.expect(template).to.be.null;
        done();
      });
    });
  });

});
