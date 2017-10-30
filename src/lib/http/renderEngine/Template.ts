import ITemplate from "./../../types/http/renderEngine/ITemplate";

const cachedTemplates: {[name: string]: string} = {};

export default class Template implements ITemplate {

  private _fileName: string;
  private _bucket: string;
  private _content: string;
  private _loaded: boolean;

  constructor(fileName: string, bucket: string) {
    this._fileName = fileName;
    this._bucket = bucket;
    this._loaded = false;
  }

  get content(): string {
    if(!this._loaded) {
      throw new Error("The template " + this._fileName + " has not been loaded.");
    }
    return this._content;
  }

  public load(callback: () => void): void {
    if(!this._loaded) {
      if(cachedTemplates[this._fileName]) {
        this._content = cachedTemplates[this._fileName];
      } else {
        // TODO load file from S3
        cachedTemplates[this._fileName] = this._content;
        this._loaded = true;
      }
    }
  }

}
