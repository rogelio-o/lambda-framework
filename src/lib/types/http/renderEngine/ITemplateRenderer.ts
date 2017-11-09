/**
 * The interface that has to implement the function that render a template.
 */
type ITemplateRenderer = (fileName: string, params: {[name: string]: any}, engineConfiguration: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void) => void;
export default ITemplateRenderer;
