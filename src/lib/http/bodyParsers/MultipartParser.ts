import IBodyParser from "./../../types/http/IBodyParser";
import IHttpHandler from "./../../types/http/IHttpHandler";
import IHttpRequest from "./../../types/http/IHttpRequest";
import HttpUploadedFile from "./../HttpUploadedFile";
import MultiPart from "./MultiPart";
import parserHelper from "./parserHelper";

const getBoundary = (header: string): string => {
  const items: string[] = header ? header.split(";") : null;
  let result: string = null;
  if (items) {
    for (let item of items) {
      item = item.trim();
      if (item.indexOf("boundary") >= 0) {
        const k = item.split("=");
        result = k[1].trim();
      }
    }
  }
  return result;
};

const getHeaderValue = (headerValue: string): {[name: string]: string} => {
  const headerParts: string[] = headerValue.split(";");
  const result: {[name: string]: string} = {};

  headerParts.forEach((headerPart: string) => {
    const headerPartParts: string[] = headerPart.trim().split("=");

    if (headerPartParts.length === 1) {
      result.$ = headerPartParts[0];
    } else if (headerPartParts.length > 1) {
      const key = headerPartParts[0].trim().toLowerCase();

      let value = headerPart.trim().substring(key.length + 1);
      if (value[0] === "\"") {
        value = value.substring(1);
      }
      if (value[value.length - 1] === "\"") {
        value = value.substring(0, value.length - 1);
      }
      result[key] = value;
    }
  });

  return result;
};

const getParts = (body: string, boundary: string): MultiPart[] => {
  const parts: MultiPart[] = [];
  const lines: string[] = body.split(/\n|\r\n/);

  let part: MultiPart;
  for (const line of lines) {
    if (line === "--" + boundary) {
      if (part) {
        parts.push(part);
      }
      part = new MultiPart();
    } else if (part) {
      if (line === "") {
        part.endOfHeader = true;
      } else if (line === "--" + boundary + "--") {
        parts.push(part);
        break;
      } else if (!part.endOfHeader) {
        const headerParts: string[] = line.split(":");
        const headerKey: string = headerParts[0].toLowerCase();
        const headerValue: string = line.substring(headerKey.length + 1).trim();

        part.headers[headerKey] = getHeaderValue(headerValue);
      } else if (part.value) {
        part.value += "\n" + line;
      } else {
        part.value = line;
      }
    }
  }

  return parts;
};

const formParse = (initialBody: string, req: IHttpRequest): void => {
  const contentType = req.header("content-type");
  const boundary = contentType ? getBoundary(contentType) : null;

  if (!boundary) {
    throw new Error("No boundary found. Can not parse the body.");
  }

  const parts: MultiPart[] = getParts(initialBody, boundary);
  req.body = {};
  req.files = [];

  parts.forEach((part) => {
    if (part.isFile()) {
      req.files.push(new HttpUploadedFile(part.getContentType(), part.getLength(), part.getFileName(), part.getContent(), part.getHeaders()));
    } else {
      req.body[part.getName()] = part.value;
    }
  });
};

/**
 * A layer that set the request body depending of its type.
 */
export default class MultipartParser implements IBodyParser {

  public create(options?: {[name: string]: any}): IHttpHandler {
    const opts = options || {};

    // initialize options
    const contentType = opts.type || "multipart/form-data";

    return parserHelper(
      (initialBody: string, req: IHttpRequest): void => {
        formParse(initialBody, req);
      },
      [contentType]
    );
  }

}
