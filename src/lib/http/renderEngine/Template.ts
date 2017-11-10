import ITemplate from "./../../types/http/renderEngine/ITemplate";

/**
 * Representation of a template file.
 */
export default class Template implements ITemplate {

  private _fileName: string;
  private _content: string;

  constructor(fileName: string, content: string) {
    this._fileName = fileName;
    this._content = content;
  }

  get fileName(): string {
    return this._fileName;
  }

  get content(): string {
    return this._content;
  }

}
