import * as Chai from 'chai'
import { stub } from "sinon";
import { App } from '../src/index'
import Router from "../src/lib/Router";
import { configuration } from '../src/index'
import defaultConfiguration from '../src/lib/configuration/defaultConfiguration'
import DefaultCallback from './utils/DefaultCallback';
import httpEvent from './utils/httpEvent';
import otherEvent from './utils/otherEvent';

/**
 * Test for App.
 */
describe('App', () => {
  let app: App;

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

  describe("#handle", () => {
    it("should call the router httpHandle if the event type is HTTP.", () => {
      const httpHandleStub = stub(Router.prototype, "httpHandle");
      app.handle(httpEvent, new DefaultCallback());
      Chai.expect(httpHandleStub.calledOnce).to.be.true;
      httpHandleStub.restore();
    });

    it("should call the router eventHandle if the event type is NOT HTTP.", () => {
      const eventHandleStub = stub(Router.prototype, "eventHandle");
      app.handle(otherEvent, new DefaultCallback());
      Chai.expect(eventHandleStub.calledOnce).to.be.true;
      eventHandleStub.restore();
    });
  });

  describe("#use", () => {
    it("should delegate the action to the default router.", () => {
      const useStub = stub(Router.prototype, "use");
      app.use(null);
      Chai.expect(useStub.calledOnce).to.be.true;
      useStub.restore();
    });
  });

  describe("#mount", () => {
    it("should delegate the action to the default router.", () => {
      const mountStub = stub(Router.prototype, "mount");
      app.mount(null);
      Chai.expect(mountStub.calledOnce).to.be.true;
      mountStub.restore();
    });
  });

  describe("#param", () => {
    it("should delegate the action to the default router.", () => {
      const paramStub = stub(Router.prototype, "param");
      app.param(null, null);
      Chai.expect(paramStub.calledOnce).to.be.true;
      paramStub.restore();
    });
  });

  describe("#route", () => {
    it("should delegate the action to the default router.", () => {
      const routeStub = stub(Router.prototype, "route");
      app.route(null);
      Chai.expect(routeStub.calledOnce).to.be.true;
      routeStub.restore();
    });
  });

  describe("#event", () => {
    it("should delegate the action to the default router.", () => {
      const eventStub = stub(Router.prototype, "event");
      app.event(null, null);
      Chai.expect(eventStub.calledOnce).to.be.true;
      eventStub.restore();
    });
  });

  describe("#addTemplateEngine", () => {
    it("should delegate the action to the default router.", () => {
      const addTepmlateEngineStub = stub(Router.prototype, "addTemplateEngine");
      app.addTemplateEngine(null);
      Chai.expect(addTepmlateEngineStub.calledOnce).to.be.true;
      addTepmlateEngineStub.restore();
    });
  });
});
