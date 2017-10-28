import IHttpUploadedFile from "./../types/http/IHttpUploadedFile";

/**
 * This class represents an uploaded file.
 */
export default class HttpUploadedFile implements IHttpUploadedFile {

  private _contentType: string;

  private _length: number;

  private _fileName: string;

  private _content: string;

  private _headers: {[name: string]: string};

  constructor(contentType: string, length: number, fileName: string, content: string, headers: {[name: string]: string}) {
    this._contentType = contentType;
    this._length = length;
    this._fileName = fileName;
    this._content = content;
    this._headers = headers;
  }

  get contentType(): string {
    return this._contentType;
  }

  get length(): number {
    return this._length;
  }

  get fileName(): string {
    return this._fileName;
  }

  get content(): string {
    return this._content;
  }

  get headers(): {[name: string]: string} {
    return this._headers;
  }

}
