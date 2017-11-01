import ITemplate from "./../../types/http/renderEngine/ITemplate";
import ITemplateEngine from "./../../types/http/renderEngine/ITemplateEngine";
import ITemplateLoader from "./../../types/http/renderEngine/ITemplateLoader";
import ITemplateRenderer from "./../../types/http/renderEngine/ITemplateRenderer";
import Template from "./Template";

/**
 * A class that render a template with a template renderer.
 */
export default class TemplateEngine implements ITemplateEngine {

  private _bucket: string;
  private _templateRenderer: ITemplateRenderer;
  private _templateLoader: ITemplateLoader;

  constructor(bucket: string, templateRenderer: ITemplateRenderer, templateLoader: ITemplateLoader) {
    this._bucket = bucket;
    this._templateRenderer = templateRenderer;
    this._templateLoader = templateLoader;
  }

  public render(fileName: string, params: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void): void {
    const template: ITemplate = new Template(fileName, this._templateLoader);

    template.load((err: Error) => {
      if (err) {
        callback(err, null);
      } else {
        this._templateRenderer(template, params, callback);
      }
    });
  }

}
