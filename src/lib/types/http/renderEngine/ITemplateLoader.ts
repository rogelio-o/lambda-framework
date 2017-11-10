import ITemplate from "./ITemplate";

/**
 * Implements the object that retrieve the content of a template file.
 */
export default interface ITemplateLoader {
  load(fileName: string, callback: (err: Error, template: ITemplate) => void): void;
}
