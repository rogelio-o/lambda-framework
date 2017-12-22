import IRawEvent from "./types/IRawEvent";

/**
 * The raw incoming event of the lambda function.
 */
export default class RawEvent implements IRawEvent {

  public type: string;

  public original: any;

  public isHttp: boolean;

  public body: string;

  public headers: {[name: string]: string};

  public queryParams: {[name: string]: string};

  public stageVariables: {[name: string]: string};

  public ip: string;

  public path: string;

  public httpMethod: string;

}
