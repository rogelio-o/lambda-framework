import * as NodeCache from "node-cache";
import ITemplate from "./../../types/http/renderEngine/ITemplate";
import ITemplateEngine from "./../../types/http/renderEngine/ITemplateEngine";
import ITemplateRenderer from "./../../types/http/renderEngine/ITemplateRenderer";
import Template from "./Template";

/**
 * A class that render a template with a template renderer.
 */
export default class TemplateEngine implements ITemplateEngine {

  private _bucket: string;
  private _templateRenderer: ITemplateRenderer;
  private _cache: NodeCache;

  constructor(bucket: string, templateRenderer: ITemplateRenderer, ttl: number) {
    this._bucket = bucket;
    this._templateRenderer = templateRenderer;
    if (ttl) {
        this._cache = new NodeCache({ stdTTL: ttl });
    }
  }

  public render(fileName: string, params: {[name: string]: any}, callback: (err: Error, parsedHtml: string) => void): void {
    const template: ITemplate = new Template(fileName, this._bucket, this._cache);

    template.load((err: Error) => {
      if (err) {
        callback(err, null);
      } else {
        this._templateRenderer(template, params, (parsedHtml: string) => {
          callback(null, parsedHtml);
        });
      }
    });
  }

}
