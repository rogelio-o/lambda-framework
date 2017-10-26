import IBodyParser from "./../../types/http/IBodyParser";
import IHttpHandler from "./../../types/http/IHttpHandler";
import parserHelper from "./parserHelper";

/**
 * A layer that set the request body depending of its type.
 */
export default class JsonParser implements IBodyParser {

  public create(reviver?: (key: string, value: string) => any): IHttpHandler {
    return parserHelper((initialBody: string) => {
      return JSON.parse(initialBody, reviver);
    });
  }

}
