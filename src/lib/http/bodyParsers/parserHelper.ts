import IHttpHandler from "./../../types/http/IHttpHandler";
import IHttpRequest from "./../../types/http/IHttpRequest";
import IHttpResponse from "./../../types/http/IHttpResponse";
import HttpError from "./../../exceptions/HttpError";
import INext from "./../../types/INext";

const parserHelper = (func: (body: string, contentType?: string) => { [name: string]: any }|string): IHttpHandler => {
  return (req: IHttpRequest, res: IHttpResponse, next: INext) => {
    let error;

    if(req.body) {
      const contentType = req.header("content-type");
      try {
        req.body = func(req.event.body, contentType);
      } catch(e) {
        if(contentType) {
          error = new HttpError("Body can not be parsed.", 400);
        }
      }
    }

    next(error);
  };
};

export default parserHelper;
