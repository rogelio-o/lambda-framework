import * as Chai from 'chai'
import finalHandler from './../../src/lib/event/final-handler'
import EventRequest from './../../src/lib/event/request'

/**
 * Test for finalHandler.
 */
describe('finalHandler', () => {
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
  let req

  beforeEach(() => {
    req = new EventRequest(event)
  });

  it('should call #onerror handler if it is set in the #options when #error is undefined.', (done) => {
    const options = {
      onerror: (err, req) => {
        done()
      }
    }
    const handler = finalHandler(req, options)
    handler(new Error)
  });

  it('should call #onerror handler if it is set in the #options when #error is NOT undefined.', (done) => {
    const options = {
      onerror: (err, req) => {
        done()
      }
    }
    const handler = finalHandler(req, options)
    handler()
  });

});
