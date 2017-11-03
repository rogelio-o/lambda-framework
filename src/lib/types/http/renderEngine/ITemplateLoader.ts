/**
 * Implements the object that retrieve the content of a template file.
 */
export default interface ITemplateLoader {
  load(fileName: string, callback: (err: Error, content: string) => void): void;
}
