import * as S3 from "aws-sdk/clients/s3";
import * as Chai from "chai";
import * as NodeCache from "node-cache";
import { stub, SinonStub } from "sinon";
import DefaultTemplateLoader from "./../../../src/lib/http/renderEngine/DefaultTemplateLoader";
import Template from "./../../../src/lib/http/renderEngine/Template";
import ITemplate from "./../../../src/lib/types/http/renderEngine/ITemplate";
import ITemplateLoader from "./../../../src/lib/types/http/renderEngine/ITemplateLoader";

/**
 * Test for DefaultTemplateLoader.
 */
describe("DefaultTemplateLoader", () => {
  const getCacheStub = stub(NodeCache.prototype, "get");
  const getObjectStub = stub(S3.prototype, "makeRequest").withArgs("getObject");
  const loader: ITemplateLoader = new DefaultTemplateLoader("bucket", 30000);

  afterEach(() => {
    getObjectStub.reset();
    getCacheStub.reset();
  });

  describe("load", () => {
    it("should load from cache the template if has been previously loaded and run the callback with the cached content.", (done) => {
      getCacheStub.callsFake((key: string, callback) => {
        callback(null, new Template("prueba.pug", "Cached content."));
      });
      loader.load("prueba.pug", (err: Error, template: ITemplate) => {
        Chai.expect(getCacheStub.calledOnce).to.be.true;
        Chai.expect(getObjectStub.calledOnce).to.be.false;
        Chai.expect(template.fileName).to.be.equal("prueba.pug");
        Chai.expect(template.content).to.be.equal("Cached content.");
        done();
      });
    });

    it("should call the `callback` with an error if an error happens getting the template from the cache.", (done) => {
      const returnedError: Error = new Error("Test error.");
      getCacheStub.callsFake((key: string, callback) => {
        callback(returnedError, null);
      });
      loader.load("prueba.pug", (err: Error, template: ITemplate) => {
        Chai.expect(err).to.be.equal(returnedError);
        done();
      });
    });

    it("should load from S3 if the cache is not defined and run the callback with the content.", (done) => {
      const loader: ITemplateLoader = new DefaultTemplateLoader("bucket", null);
      getObjectStub.callsFake((operation: string, params?: {[key: string]: any}, callback?: (err: Error, data: any) => void) => {
        callback(null, {
          Body: "Test content."
        });
      });
      loader.load("prueba.pug", (err: Error, template: ITemplate) => {
        Chai.expect(getObjectStub.called).to.be.true;
        Chai.expect(template.fileName).to.be.equal("prueba.pug");
        Chai.expect(template.content).to.be.equal("Test content.");
        done();
      });
    });

    it("should load from S3 if the template has not been previously loaded.", (done) => {
      getObjectStub.callsFake((operation: string, params?: {[key: string]: any}, callback?: (err: Error, data: any) => void) => {
        callback(null, {
          Body: "Test content."
        });
      });
      getCacheStub.callsFake((key: string, callback) => {
        callback(null, undefined);
      });
      loader.load("prueba.pug", (err: Error, template: ITemplate) => {
        Chai.expect(getCacheStub.called).to.be.true;
        Chai.expect(getObjectStub.called).to.be.true;
        Chai.expect(template.fileName).to.be.equal("prueba.pug");
        Chai.expect(template.content).to.be.equal("Test content.");
        done();
      });
    });

    it("should call the `callback` with an error if an error happens getting the template from S3.", (done) => {
      const returnedError: Error = new Error("Test error.");
      getObjectStub.callsFake((operation: string, params?: {[key: string]: any}, callback?: (err: Error, data: any) => void) => {
        callback(returnedError, null);
      });
      getCacheStub.callsFake((key: string, callback) => {
        callback(null, undefined);
      });
      loader.load("prueba.pug", (err: Error, template: ITemplate) => {
        Chai.expect(err).to.be.equal(returnedError);
        done();
      });
    });
  });

});
