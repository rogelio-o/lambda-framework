/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import * as fs from "fs";
import { SinonStub, stub } from "sinon";
import { App } from "../src/index";
import { configuration } from "../src/index";
import defaultConfiguration from "../src/lib/configuration/defaultConfiguration";
import Router from "../src/lib/Router";
import DefaultCallback from "./utils/DefaultCallback";
import httpEvent from "./utils/httpEvent";
import otherEvent from "./utils/otherEvent";

/**
 * Test for App.
 */
describe("App", () => {
  let defaultApp: App;
  let readFileStub: SinonStub;
  let existsStub: SinonStub;
  let oldPWD: string;

  const mockFile = (file, config) => {
    const path = "/test/conf/" + file + ".json";
    readFileStub.withArgs(path, "utf8").returns(JSON.stringify(config));
    existsStub.withArgs(path).returns(true);
  };

  beforeEach(() => {
    defaultApp = new App();
    readFileStub = stub(fs, "readFileSync");
    existsStub = stub(fs, "existsSync");

    oldPWD = process.env.PWD;
    process.env.PWD = "/test";
  });

  afterEach(() => {
    readFileStub.restore();
    existsStub.restore();

    delete process.env.ENVIRONMENT;
    delete process.env.TEST;

    process.env.PWD = oldPWD;
  });

  describe("#constructor", () => {
    it("without settings should init with default configuration", async () => {
      const app = new App();
      Object.keys(defaultConfiguration)
        .forEach((param) => Chai.expect(defaultConfiguration[param]).to.be.equal(app.get(param)));
    });

    it("with settings should init with custom configuration", async () => {
      const settings = {};
      settings[configuration.DEFAULT_MYME_TYPE] = "text/html";

      const app = new App(settings);
      Object.keys(settings)
        .forEach((param) => Chai.expect(settings[param]).to.be.equal(app.get(param)));
    });

    it("should set env variables as app settings", async () => {
      process.env.TEST = "test";

      const app = new App();
      Chai.expect(app.get("TEST")).to.be.equal("test");
    });

    it("should set the settings in the env file", async () => {
      process.env.ENVIRONMENT = "test";
      const config: {[name: string]: any} = {TEST: "test"};
      mockFile("test", config);

      const app = new App();
      Chai.expect(app.get("TEST")).to.be.equal("test");
    });

    it("should set the settings in the 'development' env file by default", async () => {
      const config: {[name: string]: any} = {TEST: "test"};
      mockFile("development", config);

      const app = new App();
      Chai.expect(app.get("TEST")).to.be.equal("test");
    });

    it("should set the settings in the default file", async () => {
      const config: {[name: string]: any} = {TEST: "test"};
      mockFile("application", config);

      const app = new App();
      Chai.expect(app.get("TEST")).to.be.equal("test");
    });

    it("should set the settings in the default file if the PWD env variable is not set", async () => {
      delete process.env.PWD;
      const oldCWD = process.cwd;
      process.cwd = () => "/test";

      const config: {[name: string]: any} = {TEST: "test"};
      mockFile("application", config);

      const app = new App();
      Chai.expect(app.get("TEST")).to.be.equal("test");

      process.cwd = oldCWD;
    });

    it("should set the default configuration", async () => {
      const app = new App();
      Chai.expect(app.get(configuration.ENVIRONMENT)).to.be.equal("development");
    });

    it("should set the env settings before others", async () => {
      process.env.ENVIRONMENT = "test1";

      const envConfig: {[name: string]: any} = {ENVIRONMENT: "test2"};
      mockFile("test1", envConfig);

      const appConfig: {[name: string]: any} = {ENVIRONMENT: "test3"};
      mockFile("application", appConfig);

      const paramConfig: {[name: string]: any} = {ENVIRONMENT: "test4"};

      const app = new App(paramConfig);
      Chai.expect(app.get(configuration.ENVIRONMENT)).to.be.equal("test1");
    });

    it("should set the params settings before files and default configuration", async () => {
      process.env.ENVIRONMENT = "test1";

      const envConfig: {[name: string]: any} = {COOKIE_SECRET: "1"};
      mockFile("test1", envConfig);

      const appConfig: {[name: string]: any} = {COOKIE_SECRET: "2"};
      mockFile("application", appConfig);

      const paramConfig: {[name: string]: any} = {COOKIE_SECRET: "3"};

      const app = new App(paramConfig);
      Chai.expect(app.get(configuration.COOKIE_SECRET)).to.be.equal("3");
    });

    it("should set the env file settings before default file and default configuration", async () => {
      process.env.ENVIRONMENT = "test1";

      const envConfig: {[name: string]: any} = {COOKIE_SECRET: "1"};
      mockFile("test1", envConfig);

      const appConfig: {[name: string]: any} = {COOKIE_SECRET: "2"};
      mockFile("application", appConfig);

      const app = new App();
      Chai.expect(app.get(configuration.COOKIE_SECRET)).to.be.equal("1");
    });

    it("should set the default file settings before default configuration", async () => {
      const appConfig: {[name: string]: any} = {COOKIE_SECRET: "1"};
      mockFile("application", appConfig);

      const app = new App();
      Chai.expect(app.get(configuration.COOKIE_SECRET)).to.be.equal("1");
    });
  });

  it("#enable should set the param as true", async () => {
    defaultApp.enable("option1");
    Chai.expect(defaultApp.get("option1")).to.be.true;
  });

  it("#disable should set the param as false", async () => {
    defaultApp.disable("option1");
    Chai.expect(defaultApp.get("option1")).to.be.false;
  });

  it("#set should set the param with the indicated value", async () => {
    defaultApp.set("option1", "value1");
    Chai.expect(defaultApp.get("option1")).to.be.equal("value1");
  });

  describe("#handle", () => {
    it("should call the router httpHandle if the event type is HTTP.", () => {
      const httpHandleStub = stub(Router.prototype, "httpHandle");
      defaultApp.addEndHandler(() => Promise.resolve());
      defaultApp.handle(httpEvent, new DefaultCallback());
      Chai.expect(httpHandleStub.calledOnce).to.be.true;
      httpHandleStub.restore();
    });

    it("should call the router eventHandle if the event type is NOT HTTP.", () => {
      const eventHandleStub = stub(Router.prototype, "eventHandle");
      defaultApp.addEndHandler(() => Promise.resolve());
      defaultApp.handle(otherEvent, new DefaultCallback());
      Chai.expect(eventHandleStub.calledOnce).to.be.true;
      eventHandleStub.restore();
    });
  });

  describe("#use", () => {
    it("should delegate the action to the default router.", () => {
      const useStub = stub(Router.prototype, "use");
      defaultApp.use(null);
      Chai.expect(useStub.calledOnce).to.be.true;
      useStub.restore();
    });
  });

  describe("#mount", () => {
    it("should delegate the action to the default router.", () => {
      const mountStub = stub(Router.prototype, "mount");
      defaultApp.mount(null);
      Chai.expect(mountStub.calledOnce).to.be.true;
      mountStub.restore();
    });
  });

  describe("#param", () => {
    it("should delegate the action to the default router.", () => {
      const paramStub = stub(Router.prototype, "param");
      defaultApp.param(null, null);
      Chai.expect(paramStub.calledOnce).to.be.true;
      paramStub.restore();
    });
  });

  describe("#route", () => {
    it("should delegate the action to the default router.", () => {
      const routeStub = stub(Router.prototype, "route");
      defaultApp.route(null);
      Chai.expect(routeStub.calledOnce).to.be.true;
      routeStub.restore();
    });
  });

  describe("#event", () => {
    it("should delegate the action to the default router.", () => {
      const eventStub = stub(Router.prototype, "event");
      defaultApp.event(null, null);
      Chai.expect(eventStub.calledOnce).to.be.true;
      eventStub.restore();
    });
  });

  describe("#addTemplateEngine", () => {
    it("should delegate the action to the default router.", () => {
      const addTepmlateEngineStub = stub(Router.prototype, "addTemplateEngine");
      defaultApp.addTemplateEngine(null);
      Chai.expect(addTepmlateEngineStub.calledOnce).to.be.true;
      addTepmlateEngineStub.restore();
    });
  });
});
