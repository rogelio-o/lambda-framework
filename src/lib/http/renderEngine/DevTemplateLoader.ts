import * as fs from "fs";
import * as path from "path";
import Template from "./../../http/renderEngine/Template";
import ITemplate from "./../../types/http/renderEngine/ITemplate";
import ITemplateLoader from "./../../types/http/renderEngine/ITemplateLoader";

/**
 * Loads the template from file system.
 */
export default class DevTemplateLoader implements ITemplateLoader {

  private _basePath: string;
  private _encoding: string;

  constructor(basePath?: string, encoding?: string) {
    this._basePath = basePath;
    this._encoding = encoding;
  }

  public load(fileName: string, callback: (err: Error, template: ITemplate) => void): void {
    const basePath = this._basePath || "";
    const filePath = path.join(basePath, fileName);
    const encoding = this._encoding || "utf8";
    fs.readFile(filePath, encoding, (err: Error, content: string) => {
      if (err) {
        callback(err, null);
      } else {
        const template: ITemplate = new Template(fileName, content);
        callback(null, template);
      }
    });
  }

}
