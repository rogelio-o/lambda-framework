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
    const obj2 = obj[0] || {}
    if('Sns' in obj2) {
      return 'SNSEvent'
    } else if('s3' in obj2) {
      return 'S3CreateEvent'
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
  } else {
    return null
  }
}

export function mergeParams(event: APIGatewayEvent) {
  const body = typeof this.body === 'object' ? this.body : {};
  const query = this._event.queryStringParameters || {};
  const stageVariables = this._event.stageVariables || {};

  return merge(body, query, stageVariables);
}
