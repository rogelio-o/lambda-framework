import HttpError from "./../../exceptions/HttpError";
import IHttpHandler from "./../../types/http/IHttpHandler";
import IHttpRequest from "./../../types/http/IHttpRequest";
import IHttpResponse from "./../../types/http/IHttpResponse";
import INext from "./../../types/INext";

const canBeParsed = (body: string | { [name: string]: any }) => {
  return body && typeof body === "string";
};

/**
 * Abtraction of the parser conditions and fallback mechanism.
 *
 * @param  {IHttpRequest}  req
 * @param  {IHttpResponse} res
 * @param  {INext}         next
 * @return {[type]}
 */
const parserHelper = (func: (body: string, req: IHttpRequest) => void, allowContentTypes?: string[]): IHttpHandler => {
  return (req: IHttpRequest, res: IHttpResponse, next: INext) => {
    let error;

    if (canBeParsed(req.body) && !req.context._previouslyBodyParsed) {
      const initialBody = req.body;
      if (!allowContentTypes || req.is(allowContentTypes)) {
        const contentType = req.header("content-type");
        try {
          func(req.body as string, req);

          req.context._previouslyBodyParsed = true;
        } catch (e) {
          console.log("400 " + req.method + " " + req.path + ": Body can not be parsed: " + JSON.stringify(initialBody), e);
          if (e instanceof HttpError) {
            error = e;
          } else if (contentType) {
            error = new HttpError("Body can not be parsed.", 400);
          }
        }
      }
    }

    next(error);
  };
};

export default parserHelper;
