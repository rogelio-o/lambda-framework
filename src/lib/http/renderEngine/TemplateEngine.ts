import ITemplateEngine from "./../../types/http/renderEngine/ITemplateEngine";
import ITemplateRenderer from "./../../types/http/renderEngine/ITemplateRenderer";

/**
 * A class that render a template with a template renderer.
 */
export default class TemplateEngine implements ITemplateEngine {

  private _engineConfiguration: {[name: string]: any};
  private _templateRenderer: ITemplateRenderer;

  constructor(templateRenderer: ITemplateRenderer, engineConfiguration?: {[name: string]: any}) {
    this._templateRenderer = templateRenderer;
    this._engineConfiguration = engineConfiguration;
  }

  public render(fileName: string, params: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void): void {
    this._templateRenderer(fileName, params, this._engineConfiguration, callback);
  }

}
