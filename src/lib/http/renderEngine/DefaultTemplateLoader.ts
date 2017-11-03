import * as S3 from "aws-sdk/clients/s3";
import * as NodeCache from "node-cache";
import ITemplateLoader from "./../../types/http/renderEngine/ITemplateLoader";

/**
 * Loads the template from AWS S3 bucket.
 */
export default class DefaultTemplateLoader implements ITemplateLoader {

  private _s3: S3;
  private _bucket: string;
  private _cache: NodeCache;

  constructor(bucket: string, ttl: number) {
    this._s3 = new S3();
    this._bucket = bucket;
    if (ttl) {
        this._cache = new NodeCache({ stdTTL: ttl });
    }
  }

  public load(fileName: string, callback: (err: Error, content: string) => void): void {
    this.getFromCache(fileName, (cacheErr: Error, cacheValue: string) => {
      if (cacheErr) {
        callback(cacheErr, null);
      } else {
        if (cacheValue === undefined) {
          this._s3.getObject(
            {
              Bucket: this._bucket,
              Key: fileName
            },
            (err: Error, data: S3.Types.GetObjectOutput) => {
              if (err) {
                callback(err, null);
              } else {
                const content: string = data.Body.toString();
                this.setToCache(fileName, content);
                callback(null, content);
              }
            }
          );
        } else {
          callback(null, cacheValue);
        }
      }
    });
  }

  private getFromCache(fileName: string, callback: (cacheErr: Error, cacheValue: string) => void): void {
    if (this._cache) {
      this._cache.get(fileName, callback);
    } else {
      callback(null, undefined);
    }
  }

  private setToCache(fileName: string, content: string): void {
    if (this._cache) {
      this._cache.set(fileName, (err: Error, success: boolean) => {
        if (err || !success) {
          console.error("Error saving template into cache: " + fileName, err);
        }
      });
    }
  }

}
