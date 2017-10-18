import * as Chai from 'chai'
import EventRequest from './../../src/lib/event/EventRequest'

const apiGatewayEvent = {
  "body": "{ \"test\": \"body\"}",
  "resource": "/{proxy+}",
  "requestContext": {
    "resourceId": "123456",
    "apiId": "1234567890",
    "resourcePath": "/{proxy+}",
    "httpMethod": "POST",
    "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
    "accountId": "123456789012",
    "identity": {
      "apiKey": null,
      "userArn": null,
      "cognitoAuthenticationType": null,
      "caller": null,
      "userAgent": "Custom User Agent String",
      "user": null,
      "cognitoIdentityPoolId": null,
      "cognitoIdentityId": null,
      "cognitoAuthenticationProvider": null,
      "sourceIp": "127.0.0.1",
      "accountId": null
    },
    "stage": "prod"
  },
  "queryStringParameters": {
    "foo": "bar"
  },
  "headers": {
    "Via": "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
    "Accept-Language": "en-US,en;q=0.8",
    "CloudFront-Is-Desktop-Viewer": "true",
    "CloudFront-Is-SmartTV-Viewer": "false",
    "CloudFront-Is-Mobile-Viewer": "false",
    "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
    "CloudFront-Viewer-Country": "US",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Upgrade-Insecure-Requests": "1",
    "X-Forwarded-Port": "443",
    "Host": "1234567890.execute-api.us-east-1.amazonaws.com",
    "X-Forwarded-Proto": "https",
    "X-Amz-Cf-Id": "aaaaaaaaaae3VYQb9jd-nvCd-de396Uhbp027Y2JvkCPNLmGJHqlaA==",
    "CloudFront-Is-Tablet-Viewer": "false",
    "Cache-Control": "max-age=0",
    "User-Agent": "Custom User Agent String",
    "CloudFront-Forwarded-Proto": "https",
    "Accept-Encoding": "gzip, deflate, sdch"
  },
  "pathParameters": {
    "proxy": "/examplepath"
  },
  "httpMethod": "POST",
  "stageVariables": {
    "baz": "qux"
  },
  "path": "/examplepath"
}
const customAuthorizerEvent = {
    "type" : "TOKEN",
    "authorizationToken" : "Bearer ACCESS_TOKEN",
    "methodArn":"arn:aws:execute-api:us-east-1:1234567890:apiId/stage/method/resourcePath"
}
const sNSEvent = {
  "Records": [
    {
      "EventVersion": "1.0",
      "EventSubscriptionArn": "arn:aws:sns:EXAMPLE",
      "EventSource": "aws:sns",
      "Sns": {
        "SignatureVersion": "1",
        "Timestamp": "1970-01-01T00:00:00.000Z",
        "Signature": "EXAMPLE",
        "SigningCertUrl": "EXAMPLE",
        "MessageId": "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
        "Message": "example message",
        "MessageAttributes": {
          "Test": {
            "Type": "String",
            "Value": "TestString"
          },
          "TestBinary": {
            "Type": "Binary",
            "Value": "TestBinary"
          }
        },
        "Type": "Notification",
        "UnsubscribeUrl": "EXAMPLE",
        "TopicArn": "arn:aws:sns:us-east-1:111122223333:ExampleTopic",
        "Subject": "example subject"
      }
    }
  ]
}
const s3CreateEvent = {
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
const kinesisEvent = {
  "Records": [
    {
      "eventID": "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
      "eventVersion": "1.0",
      "kinesis": {
        "approximateArrivalTimestamp": 1428537600,
        "partitionKey": "partitionKey-03",
        "data": "SGVsbG8sIHRoaXMgaXMgYSB0ZXN0IDEyMy4=",
        "kinesisSchemaVersion": "1.0",
        "sequenceNumber": "49545115243490985018280067714973144582180062593244200961"
      },
      "invokeIdentityArn": "arn:aws:iam::EXAMPLE",
      "eventName": "aws:kinesis:record",
      "eventSourceARN": "arn:aws:kinesis:EXAMPLE",
      "eventSource": "aws:kinesis",
      "awsRegion": "us-east-1"
    }
  ]
}
const cognitoUserPoolEvent = {
    "version": 1,
    "triggerSource": "string",
    "region": "us-east-1",
    "userPoolId": "string",
    "callerContext": {
      "awsSdkVersion": "string",
      "clientId": "string"
    },
    "request": {
      "userAttributes": {
        "string": "string"
      }
    },
    "response": {}
}
const dynamoDbEvent = {
  "Records": [
    {
      "eventID": "1",
      "eventVersion": "1.0",
      "dynamodb": {
        "Keys": {
          "Id": {
            "N": "101"
          }
        },
        "NewImage": {
          "Message": {
            "S": "New item!"
          },
          "Id": {
            "N": "101"
          }
        },
        "StreamViewType": "NEW_AND_OLD_IMAGES",
        "SequenceNumber": "111",
        "SizeBytes": 26
      },
      "awsRegion": "us-east-1",
      "eventName": "INSERT",
      "eventSourceARN": "arn:aws:dynamodb:us-east-1:account-id:table/ExampleTableWithStream/stream/2015-06-27T00:48:05.899",
      "eventSource": "aws:dynamodb"
    }
  ]
}
const cloudFormationCustomResourceCreateEvent = {
  "RequestType": "Create"
}
const cloudFormationCustomResourceUpdateEvent = {
  "RequestType": "Update"
}
const cloudFormationCustomResourceDeleteEvent = {
  "RequestType": "Delete"
}
const cloudFormationCustomResourceSuccessResponse = {
  "Status": "SUCCESS"
}
const cloudFormationCustomResourceFailedResponse = {
  "Status": "FAILED"
}
const scheduledEvent = {
  "account": "123456789012",
  "region": "us-east-1",
  "detail": {},
  "detail-type": "Scheduled Event",
  "source": "aws.events",
  "time": "1970-01-01T00:00:00Z",
  "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
  "resources": [
    "arn:aws:events:us-east-1:123456789012:rule/my-schedule"
  ]
}
const unknownEvent = {
  "a": "b"
}

/**
 * Test for EventRequest.
 */
describe('EventRequest', () => {

  describe('#eventType', () => {
    it('should return "APIGatewayEvent" if the event is of this type.', () => {
      const req = new EventRequest(apiGatewayEvent)
      Chai.expect(req.eventType).to.be.equal('APIGatewayEvent')
    });

    it('should return "CustomAuthorizerEvent" if the event is of this type.', () => {
      const req = new EventRequest(customAuthorizerEvent)
      Chai.expect(req.eventType).to.be.equal('CustomAuthorizerEvent')
    });

    it('should return "SNSEvent" if the event is of this type.', () => {
      const req = new EventRequest(sNSEvent)
      Chai.expect(req.eventType).to.be.equal('SNSEvent')
    });

    it('should return "S3CreateEvent" if the event is of this type.', () => {
      const req = new EventRequest(s3CreateEvent)
      Chai.expect(req.eventType).to.be.equal('S3CreateEvent')
    });

    it('should return "KinesisEvent" if the event is of this type.', () => {
      const req = new EventRequest(kinesisEvent)
      Chai.expect(req.eventType).to.be.equal('KinesisEvent')
    });

    it('should return "DynamoDbEvent" if the event is of this type.', () => {
      const req = new EventRequest(dynamoDbEvent)
      Chai.expect(req.eventType).to.be.equal('DynamoDbEvent')
    });

    it('should return "CognitoUserPoolEvent" if the event is of this type.', () => {
      const req = new EventRequest(cognitoUserPoolEvent)
      Chai.expect(req.eventType).to.be.equal('CognitoUserPoolEvent')
    });

    it('should return "CloudFormationCustomResourceCreateEvent" if the event is of this type.', () => {
      const req = new EventRequest(cloudFormationCustomResourceCreateEvent)
      Chai.expect(req.eventType).to.be.equal('CloudFormationCustomResourceCreateEvent')
    });

    it('should return "CloudFormationCustomResourceUpdateEvent" if the event is of this type.', () => {
      const req = new EventRequest(cloudFormationCustomResourceCreateEvent)
      Chai.expect(req.eventType).to.be.equal('CloudFormationCustomResourceCreateEvent')
    });

    it('should return "CloudFormationCustomResourceDeleteEvent" if the event is of this type.', () => {
      const req = new EventRequest(cloudFormationCustomResourceDeleteEvent)
      Chai.expect(req.eventType).to.be.equal('CloudFormationCustomResourceDeleteEvent')
    });

    it('should return "CloudFormationCustomResourceSuccessResponse" if the event is of this type.', () => {
      const req = new EventRequest(cloudFormationCustomResourceSuccessResponse)
      Chai.expect(req.eventType).to.be.equal('CloudFormationCustomResourceSuccessResponse')
    });

    it('should return "CloudFormationCustomResourceFailedResponse" if the event is of this type.', () => {
      const req = new EventRequest(cloudFormationCustomResourceFailedResponse)
      Chai.expect(req.eventType).to.be.equal('CloudFormationCustomResourceFailedResponse')
    });

    it('should return "ScheduledEvent" if the event is of this type.', () => {
      const req = new EventRequest(scheduledEvent)
      Chai.expect(req.eventType).to.be.equal('ScheduledEvent')
    });

    it('should return null if the event is of unknown type.', () => {
      const req = new EventRequest(unknownEvent)
      Chai.expect(req.eventType).to.be.null
    });
  });

});
