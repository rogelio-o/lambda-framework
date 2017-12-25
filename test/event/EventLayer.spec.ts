/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import EventLayer from "./../../src/lib/event/EventLayer";
import EventRequest from "./../../src/lib/event/EventRequest";
import otherEvent from "./../utils/otherEvent";

/**
 * Test for EventLayer.
 */
describe("EventLayer", () => {
  let req;

  beforeEach(() => {
    req =  new EventRequest(Object.assign({}, otherEvent));
  });

  describe("#match", () => {
    it("should return true if the looking event is an event type (string) and the event type of the given #request is the same.", () => {
      const layer = new EventLayer("S3CreateEvent", () => console.log("OK"));
      Chai.expect(layer.match(req)).to.be.true;
    });

    it("should return false if the looking event is an event type (string) and the event type of the given #request is NOT the same.", () => {
      const layer = new EventLayer("SNSEvent", () => console.log("OK"));
      Chai.expect(layer.match(req)).to.be.false;
    });

    it("should return true if the looking event is a predicate (function) and the result of calling that function with the given #request is true.", () => {
      const predicate = (request) => req.event.original.Records[0].s3.bucket.arn === "arn:aws:s3:::example-bucket";
      const layer = new EventLayer(predicate, () => console.log("OK"));
      Chai.expect(layer.match(req)).to.be.true;
    });

    it("should return false if the looking event is a predicate (function) and the result of calling that function with the given #request is false.", () => {
      const predicate = (request) => req.event.original.Records[0].s3.bucket.arn === "other-bucket";
      const layer = new EventLayer(predicate, () => console.log("OK"));
      Chai.expect(layer.match(req)).to.be.false;
    });
  });

  describe("#handle", () => {
    it("should call the handler if it exists.", (done) => {
      const layer = new EventLayer("S3CreateEvent", () => {
        done();
      });

      layer.handle(req, () => console.log("OK"), null);
    });

    it("should call #next if the handler does not exist.", (done) => {
      const layer = new EventLayer("S3CreateEvent", null);

      layer.handle(
        req,
        () => {
          done();
        },
        null
      );
    });
  });

  describe("#isErrorHandler", () => {
    it("should return true if the handler has 3 arguments as input.", () => {
      const layer = new EventLayer("S3CreateEvent", (arg1, arg2, arg3) => console.log("OK"));
      Chai.expect(layer.isErrorHandler()).to.be.true;
    });

    it("should return false if the handler doesn't exist.", () => {
      const layer = new EventLayer("S3CreateEvent", null);
      Chai.expect(layer.isErrorHandler()).to.be.false;
    });

    it("should return false if the handler has NOT 3 arguments as input.", () => {
      const layer = new EventLayer("S3CreateEvent", (arg1, arg2) => console.log("OK"));
      Chai.expect(layer.isErrorHandler()).to.be.false;
    });
  });

});
