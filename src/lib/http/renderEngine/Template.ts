import ITemplate from "./../../types/http/renderEngine/ITemplate";
import ITemplateLoader from "./../../types/http/renderEngine/ITemplateLoader";

/**
 * Representation of a template file.
 */
export default class Template implements ITemplate {

  private _fileName: string;
  private _content: string;
  private _loaded: boolean;
  private _templateLoader: ITemplateLoader;

  constructor(fileName: string, templateLoader: ITemplateLoader) {
    this._fileName = fileName;
    this._loaded = false;
    this._templateLoader = templateLoader;
  }

  get fileName(): string {
    return this._fileName;
  }

  get content(): string {
    if (!this._loaded) {
      throw new Error("The template " + this._fileName + " has not been loaded.");
    }
    return this._content;
  }

  public load(callback: (err?: Error) => void): void {
    if (!this._loaded) {
      this._templateLoader.load(
        this._fileName,
        (err: Error, content: string) => {
          if (err) {
            callback(err);
          } else {
            this._content = content;
            this._loaded = true;
            callback();
          }
        }
      );
    } else {
      callback();
    }
  }

}
