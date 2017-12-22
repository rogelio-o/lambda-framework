import * as Chai from "chai"
import otherEvent from "./../utils/otherEvent";
import RawEvent from "./../../src/lib/RawEvent";
import EventRequest from "./../../src/lib/event/EventRequest"

/**
 * Test for EventRequest.
 */
describe("EventRequest", () => {

  describe("#eventType", () => {
    it("should return the type of the raw event.", () => {
      const req = new EventRequest(otherEvent)
      Chai.expect(req.eventType).to.be.equal("S3CreateEvent")
    });

    describe("#context", () => {
      it("should return an empty initialized object where variables can be shared between layers.", () => {
        const req = new EventRequest(new RawEvent());
        Chai.expect(req.context).to.be.deep.equal({});
      });
    });
  });

});
