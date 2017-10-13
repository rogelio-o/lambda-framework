/**
 * Test for EventRouterExecutor.
 */
describe('EventRouterExecutor', () => {

  describe('#next', () => {
    it('should call #handle on the first layer which match with the request (if it exists).', () => {

    });

    it('should call #handle on the next layer (after a previous next call) which match with the request (if it exists).', () => {

    });

    it('should call #next if there is no layer matching with the request.', () => {

    });

    it('should call #next if the found layer hasn\'t an error handler and the given #error is not undefined.', () => {

    });

    it('should call #eventHandle on the first subrouter whose event stack is not empty (if it exists) and when there is no more layer in the stack.', () => {

    });

    it('should call #eventHandle on the first subrouter whose event stack is not empty (if it exists) and when the layer stack is empty.', () => {

    });

    it('should call #eventHandle on the next subrouter (after a previous next call) whose event stack is not empty (if it exists).', () => {

    });

    it('should call #next if there is no subrouter whose event stack is not empty.', () => {

    });

    it('should call #done if the subrouters and the layers stacks are empty.', () => {

    });

    it('should call #done in the following call to next when the layers and the subrouters stacks have been processed.', () => {

    });

    it('should reset the request params as the initial ones when #done is called.', () => {

    });
  });

});
