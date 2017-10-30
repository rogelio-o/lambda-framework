import configuration from "./../../configuration/configuration";
import ITemplateRenderer from "./../../types/http/renderEngine/ITemplateRenderer";
import ITemplate from "./../../types/http/renderEngine/ITemplate";
import IApp from "./../../types/IApp";
import Template from "./Template";

const checkIsTemplateRenderer = (func: any) => {
  return typeof func == "function" && (func.arguments == 2 || func.arguments == 3);
}

export default class AbstractTemplateEngine {

  private _bucket: string;
  private _templateRenderer: ITemplateRenderer;

  constructor(app: IApp) {
    this._bucket = app.get(configuration.TEMPLATE_RENDERER_FILES_BUCKET);
    this._templateRenderer = app.get(configuration.TEMPLATE_RENDERER_FUNCTION);

    if(!this._bucket) {
      throw new Error("The bucket of the files that are going to be rendered is required.");
    }

    if(!this._templateRenderer || !checkIsTemplateRenderer(this._templateRenderer)) {
      throw new Error("The template renderer is required and have to be a function which implements ITemplateRenderer.");
    }
  }

  public render(fileName: string, params: {[name: string]: any}, callback: (parsedHtml: string) => void): void {
    const template: ITemplate = new Template(fileName, this._bucket);

    template.load(() => {
      this._templateRenderer(template, params, (parsedHtml: string) => {
        callback(parsedHtml);
      });
    });
  }

}
