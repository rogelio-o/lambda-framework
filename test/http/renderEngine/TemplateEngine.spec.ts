import * as Chai from "chai";
import { SinonStub, stub } from "sinon";
import DefaultTemplateLoader from "./../../../src/lib/http/renderEngine/DefaultTemplateLoader";
import TemplateEngine from "./../../../src/lib/http/renderEngine/TemplateEngine";
import ITemplate from "./../../../src/lib/types/http/renderEngine/ITemplate";
import ITemplateEngine from "./../../../src/lib/types/http/renderEngine/ITemplateEngine";
import ITemplateLoader from "./../../../src/lib/types/http/renderEngine/ITemplateLoader";
import ITemplateRenderer from "./../../../src/lib/types/http/renderEngine/ITemplateRenderer";

/**
 * Test for TemplateEngine.
 */
describe("TemplateEngine", () => {
  const templateRenderer: SinonStub = stub();
  const templateLoader: ITemplateLoader = new DefaultTemplateLoader(null, null);
  const templateLoaderFunc: SinonStub = templateLoader.load = stub();
  const templateEngine: ITemplateEngine = new TemplateEngine("bucketName", <ITemplateRenderer> <any> templateRenderer, <ITemplateLoader> <any> templateLoader);

  afterEach(() => {
    templateLoaderFunc.reset();
    templateRenderer.reset();
  });

  describe("render", () => {
    it("should call the `callback` function with an error if there is an error loading the template.", (done) => {
      const returnedError: Error = new Error("Forced error");

      templateLoaderFunc.callsFake((fileName: string, callback: (err: Error, content: string) => void) => {
        callback(returnedError, null);
      });

      templateEngine.render("fileName", {}, (err: Error, parsedHtml: string) => {
        Chai.expect(err).to.be.equal(returnedError);
        Chai.expect(parsedHtml).to.be.null;
        done();
      });
    });

    it("should call the `callback` function with an error if there is an error rendering the template.", (done) => {
      const returnedError: Error = new Error("Forced error");

      templateRenderer.callsFake((template: ITemplate, params: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void) => {
        callback(returnedError, null);
      });

      templateLoaderFunc.callsFake((fileName: string, callback: (err: Error, content: string) => void) => {
        callback(null, "PRUEBA");
      });

      templateEngine.render("fileName", {}, (err: Error, parsedHtml: string) => {
        Chai.expect(err).to.be.equal(returnedError);
        Chai.expect(parsedHtml).to.be.null;
        done();
      });
    });

    it("should call the `templateRenderer` function with the `template`, the `params` and the `callback` if the template has been successfully loaded.", (done) => {
      const expectedContent = "PRUEBA";
      const expectedParams = {param1: "value1"};

      templateRenderer.callsFake((template: ITemplate, params: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void) => {
        Chai.expect(template.content).to.be.equal(expectedContent);
        Chai.expect(params).to.be.equal(expectedParams);
        callback(null, template.content);
      });

      templateLoaderFunc.callsFake((fileName: string, callback: (err: Error, content: string) => void) => {
        callback(null, expectedContent);
      });

      templateEngine.render("fileName", expectedParams, (err: Error, parsedHtml: string) => {
        done();
      });
    });
  });

});
