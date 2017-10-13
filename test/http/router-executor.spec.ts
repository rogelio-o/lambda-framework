/**
 * Test for HttpRouterExecutor.
 */
describe('HttpRouterExecutor', () => {

  describe('#next', () => {
    it('should call #handle on the first layer which match with the request path (if it exists).', () => {

    });

    it('should call #handle on the next layer (after a previous next call) which match with the request path (if it exists).', () => {

    });

    it('should call #next if there is no layer matching with the request path.', () => {

    });

    it('should call #next if the found layer hasn\'t an error handler and the given #error is not undefined.', () => {

    });

    it('should set the request route to the route of the layer before call the layer handler.', () => {

    });

    it('should set the request params to the params of the layer merged with the initial request params before call the layer handler.', () => {

    });

    it('should "process the layer params" with the router before call the layer handler.', () => {

    });

    it('should call #next with error if there was an error processing the params before call the layer handler.', () => {

    });

    it('should call #httpHandle on the first subrouter which match with the request path (if it exists) and when there is no more layer in the stack.', () => {

    });

    it('should call #httpHandle on the first subrouter which match with the request path (if it exists) and when the layer stack is empty.', () => {

    });

    it('should call #httpHandle on the next subrouter (after a previous next call) which match with the request path (if it exists).', () => {

    });

    it('should call #next if there is no subrouter matching with the request path.', () => {

    });

    it('should call #done if the subrouters and the layers stacks are empty.', () => {

    });

    it('should call #done in the following call to next when the layers and the subrouters stacks have been processed.', () => {

    });

    it('should reset the request params as the initial ones when #done is called.', () => {

    });
  });

});
