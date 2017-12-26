/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import eventFinalHandler from "./../../src/lib/event/eventFinalHandler";
import EventRequest from "./../../src/lib/event/EventRequest";
import DefaultCallback from "./../utils/DefaultCallback";
import otherEvent from "./../utils/otherEvent";

/**
 * Test for eventFinalHandler.
 */
describe("eventFinalHandler", () => {
  let req;

  beforeEach(() => {
    req = new EventRequest(otherEvent);
  });

  it("should call #onerror handler if it is set in the #options when #error is undefined.", (done) => {
    const options = {
      onerror: (err, request) => {
        done();
      }
    };
    const handler = eventFinalHandler(req, null, options);
    handler(new Error());
  });

  it("should call #onerror handler if it is set in the #options when #error is NOT undefined.", (done) => {
    const options = {
      onerror: (err, request) => {
        done();
      }
    };
    const handler = eventFinalHandler(req, null, options);
    handler();
  });

  it("should do nothing without errors if no #onerror handler is given.", () => {
    const handler = eventFinalHandler(req, null, null);
    handler();
  });

  it("should calls the finalize method of raw callback if it exists.", () => {
    const rawCallback: DefaultCallback = new DefaultCallback();
    const handler = eventFinalHandler(req, rawCallback, null);
    handler();

    Chai.expect(rawCallback.isFinalized).to.be.true;
  });

});
