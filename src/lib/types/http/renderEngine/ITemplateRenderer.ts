import ITemplate from "./ITemplate";

/**
 * The interface that has to implement the function that render a template.
 */
 type ITemplateRenderer = (template: ITemplate, params: {[name: string]: any}, callback: (parsedHtml: string) => void) => void;
 export default ITemplateRenderer;
