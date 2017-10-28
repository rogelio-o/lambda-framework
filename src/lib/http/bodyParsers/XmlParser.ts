import * as xml2json from "xml2json";
import IBodyParser from "./../../types/http/IBodyParser";
import IHttpHandler from "./../../types/http/IHttpHandler";
import IHttpRequest from "./../../types/http/IHttpRequest";
import parserHelper from "./parserHelper";

/**
 * A layer that set the request body depending of its type.
 */
export default class XmlParser implements IBodyParser {

  public create(): IHttpHandler {
    return parserHelper(
      (body: string, req: IHttpRequest): void => {
        const result: {[name: string]: string} = JSON.parse(xml2json.toJson(body));

        if (Object.keys(result).length === 0) {
          throw new Error("XML can not be parsed.");
        }

        req.body = result;
      },
      ["text/xml"]
    );
  }

}
