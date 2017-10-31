import * as Chai from "chai";

/**
 * Test for Template.
 */
describe("Template", () => {

  describe("content", () => {
    it("should throw an exception if the template is not previously loaded.", () => {

    });

    it("should return the content of the template if has been previously loaded.", () => {

    });
  });

  describe("load", () => {
    it("should load from cache the template if has been previously loaded, set the content with the template and mark as loaded.", () => {

    });

    it("should call the `callback` with an error if an error happens getting the template from the cache.", () => {

    });

    it("should load from S3 if the cache is not defined, set the content with the template and mark as loaded.", () => {

    });

    it("should load from S3 if the template has not been previously loaded.", () => {

    });

    it("should call the `callback` with an error if an error happens getting the template from S3.", () => {

    });
  });

});
