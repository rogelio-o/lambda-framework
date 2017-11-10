import * as Chai from "chai";
import Template from "./../../../src/lib/http/renderEngine/Template";
import ITemplate from "./../../../src/lib/types/http/renderEngine/ITemplate";

/**
 * Test for Template.
 */
describe("Template", () => {
  const template: ITemplate = new Template("file.pug", "The content.");

  it("should return the data with which it is constructed.", () => {
    Chai.expect(template.fileName).to.be.be.equal("file.pug");
    Chai.expect(template.content).to.be.be.equal("The content.");
  });

});
