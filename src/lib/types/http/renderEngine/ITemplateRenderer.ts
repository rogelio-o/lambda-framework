/**
 * The interface that has to implement the function that render a template.
 */
export default interface ITemplateRenderer {

  render(fileName: string, params: {[name: string]: any}, engineConfiguration: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void): void;

}
