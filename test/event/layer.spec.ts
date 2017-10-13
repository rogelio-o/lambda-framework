/**
 * Test for EventLayer.
 */
describe('EventLayer', () => {

  describe('#match', () => {
    it('should return true if the looking event is an event type (string) and the event type of the given #request is the same.', () => {

    });

    it('should return false if the looking event is an event type (string) and the event type of the given #request is NOT the same.', () => {

    });

    it('should return true if the looking event is a predicate (function) and the result of calling that function with the given #request is true.', () => {

    });

    it('should return false if the looking event is a predicate (function) and the result of calling that function with the given #request is false.', () => {

    });
  });

  describe('#handle', () => {
    it('should call the handler if it exists.', () => {

    });

    it('should call #next if the handler does not exist.', () => {

    });
  });

  describe('#isErrorHandler', () => {
    it('should return true if the handler has 3 arguments as input.', () => {

    });

    it('should return false if the handler doesn\'t exist.', () => {

    });

    it('should return false if the handler has NOT 3 arguments as input.', () => {

    });
  });

});
