/**
 * Test for HttpRoute.
 */
describe('HttpRoute', () => {

  describe('#hasMethod', () => {
    it('should return true if the has a handler for the given #method.', () => {

    });

    it('should return false if the has NOT a handler for the given #method.', () => {

    });

    it('should return true if the has a handler for all.', () => {

    });

    it('should return false if the has NOT a handler for all.', () => {

    });
  });

  describe('#dispatch', () => {
    it('should call the handler for the request method (if it exists).', () => {

    });

    it('should call the handler for ALL the methods if it exists and there is no handler for the request method.', () => {

    });

    it('should call next if there is no handler for the request method neither for ALL.', () => {

    });
  });

});
