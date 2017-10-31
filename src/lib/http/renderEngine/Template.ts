import * as S3 from "aws-sdk/clients/s3";
import * as NodeCache from "node-cache";
import ITemplate from "./../../types/http/renderEngine/ITemplate";

const s3: S3 = new S3();

/*
 * Representation of a template file.
 */
export default class Template implements ITemplate {

  private _fileName: string;
  private _bucket: string;
  private _content: string;
  private _loaded: boolean;
  private _cache: NodeCache;

  constructor(fileName: string, bucket: string, cache: NodeCache) {
    this._fileName = fileName;
    this._bucket = bucket;
    this._loaded = false;
    this._cache = cache;
  }

  get content(): string {
    if (!this._loaded) {
      throw new Error("The template " + this._fileName + " has not been loaded.");
    }
    return this._content;
  }

  public load(callback: (err?: Error) => void): void {
    if (!this._loaded) {
      this.getFromCache((cacheErr: Error, cacheValue: string) => {
        if (cacheErr) {
          callback(cacheErr);
        } else {
          const finalize = (body: string): void => {
            this._content = body;
            this._loaded = true;
            callback();
          };

          if (cacheValue === undefined) {
            s3.getObject(
              {
                Bucket: this._bucket,
                Key: this._fileName
              },
              (err: Error, data: {[name: string]: any}) => {
                 if (err) {
                   callback(err);
                 } else {
                   finalize(data.Body);
                 }
              }
             );
           } else {
             finalize(cacheValue);
           }
         }
      });
    }
  }

  private getFromCache(callback: (cacheErr: Error, cacheValue: string) => void): void {
    if (this._cache) {
      this._cache.get(this._fileName, callback);
    } else {
      callback(null, undefined);
    }
  }

}
