import defaultConfiguration from './configuration/default-configuration'

export interface IApp {
    init(settings: object): void
    enable(key: string): void
    disable(key: string): void
    set(key: string, value: any): void
    get(key: string): any
}

export class App implements IApp {

  private _settings: object

  init(settings: object):void {
    this._initDefaultConfiguration(settings);
  }

  /* configuration */

  private _initDefaultConfiguration(settings: object):void {
    this._settings = settings ? settings : defaultConfiguration
  }

  enable(key: string): void {
    this._settings[key] = true;
  }

  disable(key: string): void {
    this._settings[key] = false;
  }

  set(key: string, value: any): void {
    this._settings[key] = value;
  }

  get(key: string): any {
    return this._settings[key]
  }

}
