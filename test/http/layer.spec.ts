/**
 * Test for HttpLayer.
 */
describe('HttpLayer', () => {

  describe('#match', () => {
    it('should return true if #path match with the layer path.', () => {

    });

    it('should return false if the given #path does not match with the layer path.', () => {

    });
  });

  describe('#parsePathParameters', () => {
    it('should return the parameters of the layer path with the related values in the given #path.', () => {

    });

    it('should return an empty object if the layer path has no parameters.', () => {

    });
  });

  describe('#handle', () => {
    it('should call the #route dispatcher if #error is undefined and the layer has a #route (and it hasn\'t a #handler).', () => {

    });

    it('should call #next if #error is NOT undefined and the layer has a #route (and it hasn\'t a #handler).', () => {

    });

    it('should call #next if the layer hasn\'t #handler neither #route.', () => {

    });

    it('should call #handler if the layer has a error #handler and there is an #error.', () => {

    });

    it('should call #handler if the layer has #handler and there isn\'t an error.', () => {

    });

    it('should call #next with error if the #handler raise an exception.', () => {

    });

    it('should call #next with the incoming #error if the layer has a #handler without error handling and there is an #error.', () => {

    });
  });

  describe('#isErrorHandler', () => {
    it('should return false if the layer has a #route.', () => {

    });

    it('should return false if the layer hasn\'t a #route but the #handler has 3 arguments as input.', () => {

    });

    it('should return false if the layer hasn\'t a #route and hasn\'t a #handler.', () => {

    });

    it('should return true if the layer hasn\'t a #route and the #handler has 4 arguments as input.', () => {

    });
  });
});
