import * as Chai from 'chai'
import EventRouterExecutor from './../../src/lib/event/router-executor'
import EventRequest from './../../src/lib/event/request'
import Router from './../../src/lib/router'

const event = {
  "Records": [
    {
      "eventVersion": "2.0",
      "eventTime": "1970-01-01T00:00:00.000Z",
      "requestParameters": {
        "sourceIPAddress": "127.0.0.1"
      },
      "s3": {
        "configurationId": "testConfigRule",
        "object": {
          "eTag": "0123456789abcdef0123456789abcdef",
          "sequencer": "0A1B2C3D4E5F678901",
          "key": "test/key",
          "size": 1024
        },
        "bucket": {
          "arn": "arn:aws:s3:::example-bucket",
          "name": "example-bucket",
          "ownerIdentity": {
            "principalId": "EXAMPLE"
          }
        },
        "s3SchemaVersion": "1.0"
      },
      "responseElements": {
        "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH",
        "x-amz-request-id": "EXAMPLE123456789"
      },
      "awsRegion": "us-east-1",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "EXAMPLE"
      },
      "eventSource": "aws:s3"
    }
  ]
}

/**
 * Test for EventRouterExecutor.
 */
describe('EventRouterExecutor', () => {
  let req
  let router

  beforeEach(() => {
    req = new EventRequest(event)
    router = new Router
  })

  describe('#next', () => {
    it('should call #handle on the first layer which match with the request (if it exists).', (done) => {
      router.event('S3CreateEvent', () => {
        done()
      })

      const routerExecutor = new EventRouterExecutor(router, req, () => {})
      routerExecutor.next()
    });

    it('should call #handle on the next layer (after a previous next call) which match with the request (if it exists).', (done) => {
      let previouslyCalled = false

      router.event('S3CreateEvent', (req, next) => {
        previouslyCalled = true
        next()
      })

      router.event('S3CreateEvent', () => {
        Chai.expect(previouslyCalled).to.be.true
        done()
      })

      const routerExecutor = new EventRouterExecutor(router, req, () => {})
      routerExecutor.next()
    });

    it('should call #next if there is no layer matching with the request.', (done) => {
      let previouslyCalled = false

      router.event('SNSEvent', (req, next) => {
        previouslyCalled = true
        next()
      })

      const routerExecutor = new EventRouterExecutor(router, req, () => {
        Chai.expect(previouslyCalled).to.be.false
        done()
      })
      routerExecutor.next()
    });

    it('should call #next if the found layer hasn\'t an error handler and the given #error is not undefined.', (done) => {
      let previouslyCalled = false

      router.event('S3CreateEvent', (req, next) => {
        previouslyCalled = true
        next()
      })

      const routerExecutor = new EventRouterExecutor(router, req, () => {
        Chai.expect(previouslyCalled).to.be.false
        done()
      })
      routerExecutor.next(new Error)
    });

    it('should use the layer if the found layer has an error handler and the given #error is not undefined.', (done) => {
      let previouslyCalled = false

      router.event('S3CreateEvent', (req, next, err) => {
        previouslyCalled = true
        next(err)
      })

      const routerExecutor = new EventRouterExecutor(router, req, () => {
        Chai.expect(previouslyCalled).to.be.true
        done()
      })
      routerExecutor.next(new Error)
    });

    it('should call #eventHandle on the first subrouter whose event stack is not empty (if it exists) and when there is no more layer in the stack.', (done) => {
      let previouslyCalled = false

      router.event('S3CreateEvent', (req, next) => {
        previouslyCalled = true
        next()
      })

      const subrouter = new Router
      subrouter.event('S3CreateEvent', (req) => {
        Chai.expect(previouslyCalled).to.be.true
        done()
      })

      router.mount(subrouter)

      const routerExecutor = new EventRouterExecutor(router, req, () => {})
      routerExecutor.next()
    });

    it('should call #eventHandle on the first subrouter whose event stack is not empty (if it exists) and when the layer stack is empty.', (done) => {
      const subrouter = new Router
      subrouter.event('S3CreateEvent', (req) => {
        done()
      })

      router.mount(subrouter)

      const routerExecutor = new EventRouterExecutor(router, req, () => {})
      routerExecutor.next()
    });

    it('should call #eventHandle on the next subrouter (after a previous next call) whose event stack is not empty (if it exists).', (done) => {
      let previouslyCalled = false

      const subrouter1 = new Router

      const subrouter2 = new Router
      subrouter2.event('S3CreateEvent', (req, next) => {
        previouslyCalled = true
        next()
      })

      const subrouter3 = new Router
      subrouter3.event('S3CreateEvent', (req, next) => {
        Chai.expect(previouslyCalled).to.be.true
        done()
      })

      router.mount(subrouter1)
      router.mount(subrouter2)
      router.mount(subrouter3)

      const routerExecutor = new EventRouterExecutor(router, req, () => {})
      routerExecutor.next()
    });

    it('should call #next if there is no subrouter whose event stack is not empty.', (done) => {
      const subrouter = new Router
      router.mount(subrouter)

      const routerExecutor = new EventRouterExecutor(router, req, () => {
        done()
      })
      routerExecutor.next()
    });

    it('should call #done if the subrouters and the layers stacks are empty.', (done) => {
      const routerExecutor = new EventRouterExecutor(router, req, () => {
        done()
      })
      routerExecutor.next()
    });

    it('should call #done in the following call to next when the layers and the subrouters stacks have been processed.', (done) => {
      let previouslyCalledLayer = false
      let previouslyCalledSubrouter = false

      router.event('S3CreateEvent', (req, next) => {
        previouslyCalledLayer = true
        next()
      })

      const subrouter = new Router
      subrouter.event('S3CreateEvent', (req, next) => {
        previouslyCalledSubrouter = true
        next()
      })
      router.mount(subrouter)

      const routerExecutor = new EventRouterExecutor(router, req, () => {
        Chai.expect(previouslyCalledLayer).to.be.true
        Chai.expect(previouslyCalledSubrouter).to.be.true
        done()
      })
      routerExecutor.next()
    });

    it('should reset the request params as the initial ones when #done is called.', (done) => {
      const initialNext = req.next
      let previouslyCalled = false

      router.event('S3CreateEvent', (req, next) => {
        previouslyCalled = true
        Chai.expect(initialNext).to.be.not.equals(req.next)
        next()
      })

      const routerExecutor = new EventRouterExecutor(router, req, () => {
        Chai.expect(previouslyCalled).to.be.true
        Chai.expect(initialNext).to.be.equals(req.next)
        done()
      })
      routerExecutor.next()
    });
  });

});
