/* tslint:disable:no-unused-expression */
import eventFinalHandler from "./../../src/lib/event/eventFinalHandler";
import EventRequest from "./../../src/lib/event/EventRequest";
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
    const handler = eventFinalHandler(req, options);
    handler(new Error());
  });

  it("should call #onerror handler if it is set in the #options when #error is NOT undefined.", (done) => {
    const options = {
      onerror: (err, request) => {
        done();
      }
    };
    const handler = eventFinalHandler(req, options);
    handler();
  });

  it("should do nothing without errors if no #onerror handler is given.", () => {
    const handler = eventFinalHandler(req, null);
    handler();
  });

});
