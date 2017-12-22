import RawEvent from "./../../src/lib/RawEvent";
import IRawEvent from "./../../src/lib/types/IRawEvent";

const httpEvent: IRawEvent = new RawEvent();
httpEvent.type = "APIGatewayEvent";
httpEvent.original = {};
httpEvent.isHttp = true;
httpEvent.headers = {
  header1: "HEADER VALUE 1",
  header2: "HEADER VALU 2",
  "X-Forwarded-Proto": "https",
  "Host": "localhost",
  "Content-Type": "application/json,text/html",
  "Accept": "application/json,text/html",
  "Accept-Encoding": "gzip, deflate",
  "Accept-Charset": "UTF-8, ISO-8859-1",
  "Accept-Language": "es,en",
  "If-None-Match": "etagValue",
  "If-Modified-Since": "2017-10-10T10:10:10"
};
httpEvent.queryParams = {
  query1: "Query 1"
};
httpEvent.stageVariables = {
  stage1: "Stage 1"
};
httpEvent.ip = "197.0.0.0";
httpEvent.path = "/blog/1";
httpEvent.httpMethod = "GET";

export default httpEvent;
