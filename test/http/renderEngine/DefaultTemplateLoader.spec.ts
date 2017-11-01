import * as Chai from "chai";

/**
 * Test for DefaultTemplateLoader.
 */
describe("DefaultTemplateLoader", () => {

  describe("load", () => {
    it("should load from cache the template if has been previously loaded and run the callback with the cached content.", () => {

    });

    it("should call the `callback` with an error if an error happens getting the template from the cache.", () => {

    });

    it("should load from S3 if the cache is not defined and run the callback with the content.", () => {

    });

    it("should load from S3 if the template has not been previously loaded.", () => {
      // Take a peek: https://github.com/dwyl/aws-sdk-mock/issues/74
      // Take a peek: https://gist.github.com/joerx/9ef0cb5b2c4252f3d5ff
    });

    it("should call the `callback` with an error if an error happens getting the template from S3.", () => {

    });
  });

});
