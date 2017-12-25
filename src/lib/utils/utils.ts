import { format, parse as parseContentType } from "content-type";
import { parse as parseCookie } from "cookie";
import { unsign } from "cookie-signature";
import { lookup } from "mime-types";
import Cookie from "./../http/Cookie";
import ICookie from "./../types/http/ICookie";
import IRawEvent from "./../types/IRawEvent";

/**
 * Utils functions shared between multiple classes.
 */

export function setCharset(contentType: string, charset: string): string {
  if (!contentType || !charset) {
    return contentType;
  }

  // parse type
  const parsed = parseContentType(contentType);

  // set charset
  parsed.parameters.charset = charset;

  // format type
  return format(parsed);
}

export function merge(...objs: object[]): any {
  const result = {};
  for (const obj of objs) {
    if (obj) {
      const keys = Object.keys(obj);
      for (const key  of keys) {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

export function mergeParams(event: IRawEvent): {[name: string]: string} {
  const query = event.queryParams || {};
  const stageVariables = event.stageVariables || {};

  return merge(query, stageVariables);
}

export function stringify(value: {}, replacer?: any[]|((key: string, v: any) => any), spaces?: string|number, escape?: boolean): string {
  // v8 checks arguments.length for optimizing simple call
  // https://bugs.chromium.org/p/v8/issues/detail?id=4730
  let json = replacer || spaces
    ? JSON.stringify(value, replacer as any, spaces)
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

export function normalizeType(type: string): string {
  return type.indexOf("/") === -1
    ? lookup(type)
    : type;
}

const parseCookieValue = (rawValue: string, secret: string): string | { [name: string]: any } => {
  let result: string | { [name: string]: any } = rawValue;

  if (result.startsWith("s:")) {
    result = unsign(result.substr(2), secret) as string;
  }

  if (result.startsWith("j:")) {
    result = JSON.parse(result.substr(2));
  }

  return result;
};

export function getCookiesFromHeader(header: string, secret: string): { [name: string]: ICookie } {
  const result: { [name: string]: ICookie } = {};

  if (header) {
    const cookiesAsObject: { [name: string]: string } = parseCookie(header);

    for (const cookieName of Object.keys(cookiesAsObject)) {
      const cookieValue: string | { [name: string]: any } = parseCookieValue(cookiesAsObject[cookieName], secret);

      result[cookieName] = new Cookie(cookieName, cookieValue);
    }
  }

  return result;
}
