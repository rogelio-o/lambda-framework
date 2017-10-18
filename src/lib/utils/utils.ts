import { APIGatewayEvent } from "aws-lambda";
import { format, parse } from "content-type";

/**
 * Utils functions shared between multiple classes.
 */

export function setCharset(contentType: string, charset: string): string {
  if (!contentType || !charset) {
    return contentType;
  }

  // parse type
  const parsed = parse(contentType);

  // set charset
  parsed.parameters.charset = charset;

  // format type
  return format(parsed);
}

export function merge(...objs: object[]): any {
  const result = {};
  for (const obj of objs) {
    const keys = Object.keys(obj);
    for (const key  of keys) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function getEventType(obj: any): string {
  if ("httpMethod" in obj) {
    return "APIGatewayEvent";
  } else if ("authorizationToken" in obj) {
    return "CustomAuthorizerEvent";
  } else if ("Records" in obj) {
    const obj2 = obj.Records[0] || {};
    if ("Sns" in obj2) {
      return "SNSEvent";
    } else if ("s3" in obj2) {
      return "S3CreateEvent";
    } else if ("kinesis" in obj2) {
      return "KinesisEvent";
    } else if ("dynamodb" in obj2) {
      return "DynamoDbEvent";
    } else {
      return null;
    }
  } else if ("triggerSource" in obj) {
    return "CognitoUserPoolEvent";
  } else if ("RequestType" in obj) {
    const obj2 = obj.RequestType;
    switch (obj2) {
      case "Create":
        return "CloudFormationCustomResourceCreateEvent";
      case "Update":
        return "CloudFormationCustomResourceUpdateEvent";
      case "Delete":
        return "CloudFormationCustomResourceDeleteEvent";
      default:
        return null;
    }
  } else if ("Status" in obj) {
      const obj2 = obj.Status;
      switch (obj2) {
        case "SUCCESS":
          return "CloudFormationCustomResourceSuccessResponse";
        case "FAILED":
          return "CloudFormationCustomResourceFailedResponse";
        default:
          return null;
      }
  } else if ("time" in obj) {
    return "ScheduledEvent";
  } else {
    return null;
  }
}

export function mergeParams(event: APIGatewayEvent): {[name: string]: string} {
  const body = typeof event.body === "object" ? event.body : {};
  const query = event.queryStringParameters || {};
  const stageVariables = event.stageVariables || {};

  return merge(body, query, stageVariables);
}

export function stringify(value: {}, replacer: (string[]|number[]), spaces: string|number, escape: boolean): string {
  // v8 checks arguments.length for optimizing simple call
  // https://bugs.chromium.org/p/v8/issues/detail?id=4730
  let json = replacer || spaces
    ? JSON.stringify(value, replacer, spaces)
    : JSON.stringify(value);

  if (escape) {
    json = json.replace(/[<>&]/g, (c: string) => {
      switch (c.charCodeAt(0)) {
        case 0x3c:
          return "\\u003c";
        case 0x3e:
          return "\\u003e";
        case 0x26:
          return "\\u0026";
        default:
          return c;
      }
    });
  }

  return json;
}
