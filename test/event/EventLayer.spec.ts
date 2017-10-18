import * as Chai from 'chai'
import EventRequest from './../../src/lib/event/EventRequest'
import EventLayer from './../../src/lib/event/EventLayer'

/**
 * Test for EventLayer.
 */
describe('EventLayer', () => {
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
    req =  new EventRequest(event)
  })

  describe('#match', () => {
    it('should return true if the looking event is an event type (string) and the event type of the given #request is the same.', () => {
      const layer = new EventLayer('S3CreateEvent', {}, () => {})
      Chai.expect(layer.match(req)).to.be.true
    });

    it('should return false if the looking event is an event type (string) and the event type of the given #request is NOT the same.', () => {
      const layer = new EventLayer('SNSEvent', {}, () => {})
      Chai.expect(layer.match(req)).to.be.false
    });

    it('should return true if the looking event is a predicate (function) and the result of calling that function with the given #request is true.', () => {
      const predicate = (req) => req.event.Records[0].s3.bucket.arn == 'arn:aws:s3:::example-bucket'
      const layer = new EventLayer(predicate, {}, () => {})
      Chai.expect(layer.match(req)).to.be.true
    });

    it('should return false if the looking event is a predicate (function) and the result of calling that function with the given #request is false.', () => {
      const predicate = (req) => req.event.Records[0].s3.bucket.arn == 'other-bucket'
      const layer = new EventLayer(predicate, {}, () => {})
      Chai.expect(layer.match(req)).to.be.false
    });
  });

  describe('#handle', () => {
    it('should call the handler if it exists.', (done) => {
      const layer = new EventLayer('S3CreateEvent', {}, () => {
        done()
      })

      layer.handle(req, () => {}, null)
    });

    it('should call #next if the handler does not exist.', (done) => {
      const layer = new EventLayer('S3CreateEvent', {}, null)

      layer.handle(req, () => {
        done()
      }, null)
    });
  });

  describe('#isErrorHandler', () => {
    it('should return true if the handler has 3 arguments as input.', () => {
      const layer = new EventLayer('S3CreateEvent', {}, (arg1, arg2, arg3) => {

      })
      Chai.expect(layer.isErrorHandler()).to.be.true
    });

    it('should return false if the handler doesn\'t exist.', () => {
      const layer = new EventLayer('S3CreateEvent', {}, null)
      Chai.expect(layer.isErrorHandler()).to.be.false
    });

    it('should return false if the handler has NOT 3 arguments as input.', () => {
      const layer = new EventLayer('S3CreateEvent', {}, (arg1, arg2) => {

      })
      Chai.expect(layer.isErrorHandler()).to.be.false
    });
  });

});
