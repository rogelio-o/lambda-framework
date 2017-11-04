import ITemplateLoader from "./ITemplateLoader";

/**
 * A class that render a template with a template renderer.
 */
 export default interface ITemplateEngine {

   readonly loader: ITemplateLoader;

   render(fileName: string, params: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void): void;

 }
