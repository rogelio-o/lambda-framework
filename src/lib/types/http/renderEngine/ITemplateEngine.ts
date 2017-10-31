/**
 * A class that render a template with a template renderer.
 */
 export default interface ITemplateEngine {

   render(fileName: string, params: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void): void;

 }
