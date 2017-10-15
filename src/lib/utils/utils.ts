import { APIGatewayEvent } from 'aws-lambda'
import { parse, format } from 'content-type'

export function setCharset(type, charset) {
  if (!type || !charset) {
    return type;
  }

  // parse type
  var parsed = parse(type);

  // set charset
  parsed.parameters.charset = charset;

  // format type
  return format(parsed);
};

export function merge(...objs: object[]): any {
  const result = {};
  for (let i = 0; i < objs.length; i++) {
    const obj = objs[i]
    for (var key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function getEventType(obj: any): string {
  if('httpMethod' in obj) {
    return 'APIGatewayEvent'
  } else if('authorizationToken' in obj) {
    return 'CustomAuthorizerEvent'
  } else if('Records' in obj) {
    const obj2 = obj.Records[0] || {}
    if('Sns' in obj2) {
      return 'SNSEvent'
    } else if('s3' in obj2) {
      return 'S3CreateEvent'
    } else if('kinesis' in obj2) {
      return 'KinesisEvent'
    } else if('dynamodb' in obj2) {
      return 'DynamoDbEvent'
    } else {
      return null
    }
  } else if('triggerSource' in obj) {
    return 'CognitoUserPoolEvent'
  } else if('RequestType' in obj) {
    const obj2 = obj.RequestType
    switch(obj2) {
      case 'Create':
        return 'CloudFormationCustomResourceCreateEvent'
      case 'Update':
        return 'CloudFormationCustomResourceUpdateEvent'
      case 'Delete':
        return 'CloudFormationCustomResourceDeleteEvent'
      default:
        return null
    }
  } else if('Status' in obj) {
      const obj2 = obj.Status
      switch(obj2) {
        case 'SUCCESS':
          return 'CloudFormationCustomResourceSuccessResponse'
        case 'FAILED':
          return 'CloudFormationCustomResourceFailedResponse'
        default:
          return null
      }
  } else if('time' in obj) {
    return 'ScheduledEvent'
  } else {
    return null
  }
}

export function mergeParams(event: APIGatewayEvent) {
  const body = typeof event.body === 'object' ? event.body : {};
  const query = event.queryStringParameters || {};
  const stageVariables = event.stageVariables || {};

  return merge(body, query, stageVariables);
}

export function stringify(value, replacer, spaces, escape) {
  // v8 checks arguments.length for optimizing simple call
  // https://bugs.chromium.org/p/v8/issues/detail?id=4730
  var json = replacer || spaces
    ? JSON.stringify(value, replacer, spaces)
    : JSON.stringify(value);

  if (escape) {
    json = json.replace(/[<>&]/g, function (c) {
      switch (c.charCodeAt(0)) {
        case 0x3c:
          return '\\u003c'
        case 0x3e:
          return '\\u003e'
        case 0x26:
          return '\\u0026'
        default:
          return c
      }
    })
  }

  return json
}
