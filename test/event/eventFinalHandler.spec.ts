/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import { SinonStub, stub } from "sinon";
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

  it("should calls the finalize method of raw callback if it exists.", (done) => {
    const rawCallback: DefaultCallback = new DefaultCallback();
    const handler = eventFinalHandler(req, rawCallback, null);

    rawCallback.setCallback(() => {
      Chai.expect(rawCallback.isFinalized).to.be.true;
      done();
    });

    handler();
  });

  it("should call the endHandlers.", (done) => {
    const rawCallback: DefaultCallback = new DefaultCallback();
    const endHandler: SinonStub = stub();
    endHandler.returns(Promise.resolve());

    rawCallback.setCallback(() => {
      Chai.expect(endHandler.calledOnce).to.be.true;
      done();
    });

    const handler = eventFinalHandler(req, rawCallback, {
      endHandlers: [
        endHandler
      ]
    });
    handler();
  });

});
