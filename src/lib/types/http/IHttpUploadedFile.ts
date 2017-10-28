/**
 * This class represents an uploaded file.
 */
export default interface IHttpUploadedFile {

  readonly contentType: string;

  readonly length: number;

  readonly fileName: string;

  readonly content: string;

  readonly headers: {[name: string]: string};

}
