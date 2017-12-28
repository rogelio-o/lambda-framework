import * as qs from "qs";
import * as querystring from "querystring";
import HttpError from "./../../exceptions/HttpError";
import IBodyParser from "./../../types/http/IBodyParser";
import IHttpHandler from "./../../types/http/IHttpHandler";
import IHttpRequest from "./../../types/http/IHttpRequest";
import parserHelper from "./parserHelper";

const parameterCount = (body: string, limit: number): number => {
  let count = 0;
  let index = 0;

  while (index !== -1) {
    count += 1;
    index += 1;

    if (count === limit) {
      return undefined;
    }

    index = body.indexOf("&", index);
  }

  return count;
};

type IParser = (body: string, parameterLimit: number, arrayLimit: number) => {[name: string]: string|string[]};

const extendedParser: IParser = (body: string, parameterLimit: number, arrayLimit: number): {[name: string]: string|string[]} => {
  return qs.parse(body, {
    allowPrototypes: true,
    arrayLimit,
    depth: Infinity,
    parameterLimit
  });
};

const simpleParser: IParser = (body: string, parameterLimit: number, arrayLimit: number): {[name: string]: string|string[]} => {
  return querystring.parse(body, undefined, undefined, {maxKeys: parameterLimit});
};

const abstractParser = (options: {[name: string]: any}, parser: IParser): (body: string) => {[name: string]: string|string[]} => {
  let parameterLimit = options.parameterLimit !== undefined
    ? options.parameterLimit
    : 1000;

  if (isNaN(parameterLimit) || parameterLimit < 1) {
    throw new TypeError("Option parameterLimit must be a positive number.");
  }

  if (!isFinite(parameterLimit)) {
    parameterLimit = Number.MAX_SAFE_INTEGER - 1;
  }

  return (body: string): {[name: string]: string|string[]} => {
    const paramCount = parameterCount(body, parameterLimit + 1);

    if (paramCount === undefined) {
      throw new HttpError("Too many parameters.", 413);
    }

    const arrayLimit = Math.max(100, paramCount);

    return parser(body, parameterLimit, arrayLimit);
  };
};

/**
 * A layer that set the request body depending of its type.
 */
export default class UrlEncodedParser implements IBodyParser {

  public create(options?: {[name: string]: any}): IHttpHandler {
    const opts = options || {};

    // initialize options
    const extended = opts.extended !== false;
    const contentType = opts.type || "application/x-www-form-urlencoded";

    // create the appropriate query parser
    const queryParser: (body: string, parameterLimit: number, arrayLimit: number) => {[name: string]: string|string[]} = extended
      ? extendedParser
      : simpleParser;
    const parser: (body: string) => {[name: string]: string|string[]} = abstractParser(opts, queryParser);

    return parserHelper(
      (initialBody: string, req: IHttpRequest): void => {
        req.body = parser(initialBody);
      },
      [contentType]
    );
  }

}
