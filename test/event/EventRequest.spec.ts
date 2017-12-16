import * as Chai from "chai"
import otherEvent from "./../utils/otherEvent";
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
  });

});
