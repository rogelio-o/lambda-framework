/**
 * The raw incoming event of the lambda function.
 */
export default interface IRawEvent {

  type: string;

  original: any;

  isHttp: boolean;

  body: string;

  headers: {[name: string]: string};

  queryParams: {[name: string]: string};

  stageVariables: {[name: string]: string};

  ip: string;

  path: string;

  httpMethod: string;

}
