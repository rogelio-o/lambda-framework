const CONTENT_DISPOSITION = "content-disposition";
const CONTENT_TYPE = "content-type";
const CONTENT_LENGHT = "content-length";

/**
 * A part of a multipart form.
 */
export default class MultiPart {

  public headers: {[name: string]: {[name: string]: string}};

  public endOfHeader: boolean;

  public value: string;

  constructor() {
    this.headers = {};
    this.endOfHeader = false;
  }

  public isFile(): boolean {
    return this.headers[CONTENT_DISPOSITION] != null && this.headers[CONTENT_DISPOSITION].filename != null;
  }

  public getContentType(): string {
    return this.headers[CONTENT_TYPE] ? this.headers[CONTENT_TYPE].$ : null;
  }

  public getLength(): number {
    return this.headers[CONTENT_LENGHT] && this.headers[CONTENT_LENGHT].$ ? parseInt(this.headers[CONTENT_LENGHT].$, 10) : null;
  }

  public getFileName(): string {
    return this.headers[CONTENT_DISPOSITION] ? this.headers[CONTENT_DISPOSITION].filename : null;
  }

  public getName(): string {
    return this.headers[CONTENT_DISPOSITION] ? this.headers[CONTENT_DISPOSITION].name : null;
  }

  public getContent(): string {
    return this.value;
  }

  public getHeaders(): {[name: string]: string} {
    const result: {[name: string]: string} = {};

    Object.keys(this.headers).forEach((k) => {
      result[k] = this.headers[k].$;
    });

    return result;
  }

}
