import * as Chai from "chai";
import { SinonStub, stub } from "sinon";
import Template from "./../../../src/lib/http/renderEngine/Template";
import TemplateEngine from "./../../../src/lib/http/renderEngine/TemplateEngine";
import ITemplate from "./../../../src/lib/types/http/renderEngine/ITemplate";
import ITemplateEngine from "./../../../src/lib/types/http/renderEngine/ITemplateEngine";
import ITemplateRenderer from "./../../../src/lib/types/http/renderEngine/ITemplateRenderer";

/**
 * Test for TemplateEngine.
 */
describe("TemplateEngine", () => {
  const templateRenderer: ITemplateRenderer =  <ITemplateRenderer> <any> stub();
  const templateRendererFunc = templateRenderer.render = stub();
  const expectedEngineConfig: {[name: string]: any} = {conf1: "value 1"};
  const templateEngine: ITemplateEngine = new TemplateEngine(templateRenderer, expectedEngineConfig);

  afterEach(() => {
    templateRendererFunc.reset();
  });

  describe("render", () => {
    it("should call the `callback` function with an error if there is an error rendering the template.", (done) => {
      const returnedError: Error = new Error("Forced error");

      templateRendererFunc.callsFake((template: ITemplate, params: {[name: string]: any}, engineConfig: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void) => {
        callback(returnedError, null);
      });

      templateEngine.render("fileName.pug", {}, (err: Error, parsedHtml: string) => {
        Chai.expect(err).to.be.equal(returnedError);
        Chai.expect(parsedHtml).to.be.null;
        done();
      });
    });

    it("should call the `templateRenderer` function with the `fileName`, the `params`, the `engineConfig`, and the `callback` if the template has been successfully loaded.", (done) => {
      const expectedContent = "PRUEBA";
      const expectedParams = {param1: "value1"};

      templateRendererFunc.callsFake((fileName: string, params: {[name: string]: any}, engineConfig: {[name: string]: any}, callback: (err: Error, template: ITemplate) => void) => {
        Chai.expect(fileName).to.be.equal("fileName.pug");
        Chai.expect(params).to.be.equal(expectedParams);
        Chai.expect(engineConfig).to.be.equal(expectedEngineConfig);
        callback(null, new Template(fileName, "Test content."));
      });

      templateEngine.render("fileName.pug", expectedParams, (err: Error, parsedHtml: string) => {
        done();
      });
    });
  });

});
