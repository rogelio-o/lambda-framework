import * as Chai from 'chai'
import { stub } from "sinon";
import App from '../src/index'
import Router from "../src/lib/Router";
import { configuration } from '../src/index'
import defaultConfiguration from '../src/lib/configuration/defaultConfiguration'

/**
 * Test for App.
 */
describe('App', () => {
  let app;

  beforeEach(() => {
    app = new App()
  });

  it('#init without settings should init with default configuration', async () => {
    app.init()
    Object.keys(defaultConfiguration)
      .forEach(param => Chai.expect(defaultConfiguration[param]).to.be.equal(app.get(param)))
  });

  it('#init with settings should init with custom configuration', async () => {
    const settings = {}
    settings[configuration.DEFAULT_MYME_TYPE] = 'text/html'

    app.init(settings)
    Object.keys(settings)
      .forEach(param => Chai.expect(settings[param]).to.be.equal(app.get(param)))
  });

  it('#enable should set the param as true', async () => {
    app.enable('option1')
    Chai.expect(app.get('option1')).to.be.true
  });

  it('#disable should set the param as false', async () => {
    app.disable('option1')
    Chai.expect(app.get('option1')).to.be.false
  });

  it('#set should set the param with the indicated value', async () => {
    app.set('option1', 'value1')
    Chai.expect(app.get('option1')).to.be.equal('value1')
  });

  describe("#addTemplateEngine", () => {
    it("delegates the action to the default router.", () => {
      const addTepmlateEngineStub = stub(Router.prototype, "addTemplateEngine");
      app.addTemplateEngine(null);
      Chai.expect(addTepmlateEngineStub.calledOnce).to.be.true;
      addTepmlateEngineStub.restore();
    });
  });
});
