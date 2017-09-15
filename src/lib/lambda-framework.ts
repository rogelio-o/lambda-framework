import IApp from './types/app'
import defaultConfiguration from './configuration/default-configuration'

export default class App implements IApp {

  private _settings: object

  constructor() {
    this._settings = {}
  }

  init(settings?: object):void {
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
