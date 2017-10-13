/**
 * Test for Router.
 */
describe('Router', () => {

  describe('#fullSubpath', () => {
    it('should return each parent subpath concadenated with the current subrouter subpath.', () => {

    });

    it('should return the current subpath if the router hasn\'t a parent.', () => {

    });

    it('should return undefined if the subpath is undefined and the router hasn\'t a parent.', () => {

    });
  });

  describe('#httpHandle', () => {
    it('should create and start a #HttpRouterExecutor if the request method is NOT OPTIONS', () => {

    });

    it('should response with the available HTTP methods for the request path in the Allow header if the request method is OPTIONS.', () => {

    });

    it('should call #out if the request method is OPTIONS and there is no available HTTP methods for the request path.', () => {

    });
  });

  describe('#httpProcessParams', () => {
    it('should call each handlers for each param in #layerParams.', () => {

    });

    it('should NOT call the handlers for the params in #executedParams.', () => {

    });

    it('should add the processed params into #executedParams.', () => {

    });

    it('should execute #done if there is no params in #layerParams.', () => {

    });

    it('should finalize calling #done when there is params without related handlers.', () => {

    });

    it('should finalize calling #done when there is params with related handlers.', () => {

    });
  });

  describe('#getAvailableMethodsForPath', () => {
    it('should return each HTTP method of each route that match with the request path', () => {

    });

    it('should NOT return HTTP method of the routes that doesn\'t match with the request path', () => {

    });

    it('should return each HTTP method of each route that match with the request path which are in a subrouter that match with request path.', () => {

    });

    it('should NOT return HTTP method of the routes that match with the request path which are in a subrouter that doesn\'t match with request path.', () => {

    });
  });

  describe('#eventHandle', () => {
    it('should create and start a #EventRouterExecutor.', () => {

    });
  });

});
