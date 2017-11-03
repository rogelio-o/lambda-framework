import * as Chai from "chai";
import { stub, SinonStub } from "sinon";
import DefaultTemplateLoader from "./../../../src/lib/http/renderEngine/DefaultTemplateLoader";
import Template from "./../../../src/lib/http/renderEngine/Template";
import ITemplate from "./../../../src/lib/types/http/renderEngine/ITemplate";
import ITemplateLoader from "./../../../src/lib/types/http/renderEngine/ITemplateLoader";

/**
 * Test for Template.
 */
describe("Template", () => {
  const templateLoader: ITemplateLoader = new DefaultTemplateLoader(null, null);
  const templateLoaderFunc: SinonStub = templateLoader.load = stub();
  let template: ITemplate;

  beforeEach(() => {
    template = new Template("test.pug", templateLoader);
    templateLoaderFunc.callsFake((fileName: string, callback: (Error, string) => void) => callback(null, "Test content."));
  });

  afterEach(() => {
    templateLoaderFunc.reset();
  });

  describe("content", () => {
    it("should throw an exception if the template is not previously loaded.", () => {
      Chai.expect(() => template.content).to.throw("The template test.pug has not been loaded.");
    });

    it("should return the content of the template if has been previously loaded.", (done) => {
      template.load(() => {
        Chai.expect(() => template.content).to.not.throw("The template test.pug has not been loaded.");
        done();
      });
    });
  });

  describe("load", () => {
    it("should load the template calling the template loader if it has NOT been previously loaded.", (done) => {
      template.load(() => {
        Chai.expect(templateLoaderFunc.called).to.be.true;
        done();
      });
    });

    it("should NOT call the template loader if it has been previously loaded.", (done) => {
      template.load(() => {
        template.load(() => {
          Chai.expect(templateLoaderFunc.calledOnce).to.be.true;
          done();
        });
      });
    });

    it("should NOT call callback with an error if there was an error loading the template.", (done) => {
      const expectedError: Error = new Error("Test.");
      templateLoaderFunc.callsFake((fileName: string, callback: (Error, string) => void) => callback(expectedError, null));
      template.load((err: Error) => {
        Chai.expect(err).to.be.equal(expectedError);
        done();
      });
    });
  });

});
