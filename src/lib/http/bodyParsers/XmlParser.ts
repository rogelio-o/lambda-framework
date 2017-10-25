import IBodyParser from "./../../types/http/IBodyParser";
import IHttpHandler from "./../../types/http/IHttpHandler";

/**
 * A layer that set the request body depending of its type.
 */
export default class XmlParser implements IBodyParser {

  public create(): IHttpHandler {
    return (req, res, next) => {

    };
  }

}
