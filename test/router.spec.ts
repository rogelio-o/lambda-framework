/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import App from "./../src/lib/App";
import EventRequest from "./../src/lib/event/EventRequest";
import HttpRequest from "./../src/lib/http/HttpRequest";
import HttpResponse from "./../src/lib/http/HttpResponse";
import Router from "./../src/lib/Router";
import IEventRequest from "./../src/lib/types/event/IEventRequest";
import IHttpRequest from "./../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../src/lib/types/http/IHttpResponse";
import IApp from "./../src/lib/types/IApp";
import IRouter from "./../src/lib/types/IRouter";
import DefaultCallback from "./utils/DefaultCallback";
import httpEvent from "./utils/httpEvent";
import otherEvent from "./utils/otherEvent";

/**
 * Test for Router.
 */
describe("Router", () => {
  const app: IApp = new App();
  let router: IRouter;
  let eventReq: IEventRequest;
  let httpReq: IHttpRequest;
  let res: IHttpResponse;
  let callback: DefaultCallback;

  beforeEach(() => {
    callback = new DefaultCallback();
    router = new Router();
    eventReq = new EventRequest(otherEvent);
    httpReq = new HttpRequest(app, httpEvent);
    res = new HttpResponse(app, httpReq, callback);
  });

  describe("#constructor", () => {
    it("can initialize the router with a subpath.", () => {
      const subpathRouter = new Router({subpath: "/subpath"});
      Chai.expect(subpathRouter.fullSubpath).to.be.equal("/subpath");
    });
  });

  describe("#fullSubpath", () => {
    it("should return each parent subpath concadenated with the current subrouter subpath.", () => {
      const subrouter = new Router();
      router.mount(subrouter, "/path1");

      const subsubrouter = new Router();
      subrouter.mount(subsubrouter, "/path2");

      Chai.expect(subsubrouter.fullSubpath).to.be.equal("/path1/path2");
    });

    it("should return the current subpath if the router hasn't a parent.", () => {
      Chai.expect(router.fullSubpath).to.be.undefined;
    });

    it("should return undefined if the subpath is undefined.", () => {
      const subrouter = new Router();
      router.mount(subrouter);

      Chai.expect(subrouter.fullSubpath).to.be.undefined;
    });
  });

  describe("#httpHandle", () => {
    it("should create and start a #HttpRouterExecutor if the request method is NOT OPTIONS", (done) => {
      router.use((request, response, next) => {
        done();
      });

      router.httpHandle(httpReq, res, () => console.log("OK"));
    });

    it("should response with the available HTTP methods for the request path in the Allow header if the request method is OPTIONS.", (done) => {
      const newEvent = Object.assign({}, httpEvent);
      newEvent.httpMethod = "OPTIONS";
      const req = new HttpRequest(app, newEvent);

      router.route("/blog/:id").get((request, response) => console.log("OK"));
      router.route("/blog/:id").post((request, response) => console.log("OK"));

      callback.setCallback(() => {
        Chai.expect(callback.successResult.headers.Allow).to.be.equals("GET,POST");
        done();
      });

      router.httpHandle(req, res, () => console.log("OK"));
    });

    it("should call #out if the request method is OPTIONS and there is no available HTTP methods for the request path.", (done) => {
      const newEvent = Object.assign({}, httpEvent);
      newEvent.httpMethod = "OPTIONS";
      const req = new HttpRequest(app, newEvent);

      router.httpHandle(req, res, () => {
        done();
      });
    });
  });

  describe("#httpProcessParams", () => {
    const newEvent = Object.assign({}, httpEvent);
    newEvent.path = "/blog/:id1/:id2";
    const req = new HttpRequest(app, newEvent);

    let previouslyCalled1: boolean;
    let previouslyCalled2: boolean;
    let previouslyCalled3: boolean;

    beforeEach(() => {
      previouslyCalled1 = false;
      previouslyCalled2 = false;
      previouslyCalled3 = false;

      router.param("id1", (request, response, next, value) => {
        Chai.expect(value).to.be.equal("1");
        previouslyCalled1 = true;
        next();
      });

      router.param("id1", (request, response, next, value) => {
        Chai.expect(value).to.be.equal("1");
        previouslyCalled2 = true;
        next();
      });

      router.param("id2", (request, response, next, value) => {
        Chai.expect(value).to.be.equal("2");
        previouslyCalled3 = true;
        next();
      });
    });

    it("should call each handlers for each param in #layerParams.", (done) => {
      router.httpProcessParams({id1: "1", id2: "2"}, [], req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true;
        Chai.expect(previouslyCalled2).to.be.true;
        Chai.expect(previouslyCalled3).to.be.true;
        done();
      });
    });

    it("should NOT call the handlers for the params in #executedParams.", (done) => {
      router.httpProcessParams({id1: "1", id2: "2"}, ["id2"], req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true;
        Chai.expect(previouslyCalled2).to.be.true;
        Chai.expect(previouslyCalled3).to.be.false;
        done();
      });
    });

    it("should add the processed params into #executedParams.", (done) => {
      const executed: string[] = [];
      router.httpProcessParams({id1: "1", id2: "2"}, executed, req, res, () => {
        Chai.expect(executed).to.contain("id1");
        Chai.expect(executed).to.contain("id2");
        done();
      });
    });

    it("should execute #done if there is no params in #layerParams.", (done) => {
      router.httpProcessParams({}, [], req, res, () => {
        done();
      });
    });

    it("should finalize calling #done when there is params without related handlers.", (done) => {
      const newRouter = new Router(); // Clean router without params handlers
      newRouter.httpProcessParams({id1: "1", id2: "2"}, [], req, res, () => {
        done();
      });
    });

    it("should finalize calling #done when there is params with related handlers.", (done) => {
      router.httpProcessParams({id1: "1", id2: "2"}, [], req, res, () => {
        done();
      });
    });
  });

  describe("#getAvailableMethodsForPath", () => {
    it("should return each HTTP method of each route that match with the request path", () => {
      router.route("/blog/:id").get((request, response) => console.log("OK"));
      router.route("/blog/:id").post((request, response) => console.log("OK"));

      const methods = router.getAvailableMethodsForPath("/blog/1");

      Chai.expect(methods).to.contain("GET");
      Chai.expect(methods).to.contain("POST");
    });

    it("should NOT return HTTP method of the routes that doesn't match with the request path", () => {
      router.route("/blog/:id").get((request, response) => console.log("OK"));
      router.route("/blog/a/:id").post((request, response) => console.log("OK"));

      const methods = router.getAvailableMethodsForPath("/blog/1");

      Chai.expect(methods).to.contain("GET");
      Chai.expect(methods).to.not.contain("POST");
    });

    it("should return each HTTP method of each route that match with the request path which are in a subrouter that match with request path.", () => {
      const subrouter = new Router();
      subrouter.route("/:id").get((request, response) => console.log("OK"));
      subrouter.route("/:id").post((request, response) => console.log("OK"));
      router.mount(subrouter, "/blog");

      const methods = router.getAvailableMethodsForPath("/blog/1");

      Chai.expect(methods).to.contain("GET");
      Chai.expect(methods).to.contain("POST");
    });

    it("should NOT return HTTP method of the routes that match with the request path which are in a subrouter that doesn't match with request path.", () => {
      const subrouter = new Router();
      subrouter.route("/:id").get((request, response) => console.log("OK"));
      subrouter.route("/a/:id").post((request, response) => console.log("OK"));
      router.mount(subrouter, "/blog");

      const methods = router.getAvailableMethodsForPath("/blog/1");

      Chai.expect(methods).to.contain("GET");
      Chai.expect(methods).to.not.contain("POST");
    });
  });

  describe("#eventHandle", () => {
    it("should create and start a #EventRouterExecutor.", (done) => {
      router.event("S3CreateEvent", (req, next) => {
        done();
      });

      router.eventHandle(eventReq, () => console.log("OK"));
    });
  });

  describe("#templateEngine", () => {
    it("returns the templateEngine of a parent router if it has no one.", () => {
      const subrouter: IRouter = new Router();
      router.mount(subrouter);

      const subsubrouter: IRouter = new Router();
      subrouter.mount(subsubrouter);

      router.addTemplateEngine(null);

      Chai.expect(subrouter.templateEngine).to.be.equal(router.templateEngine);
      Chai.expect(subsubrouter.templateEngine).to.be.equal(router.templateEngine);
    });

    it("returns the its templateEngine if it has one.", () => {
      const subrouter: IRouter = new Router();
      router.mount(subrouter);

      router.addTemplateEngine(null);
      subrouter.addTemplateEngine(null);

      Chai.expect(subrouter.templateEngine).to.be.not.equal(router.templateEngine);
      Chai.expect(subrouter.templateEngine).to.be.not.null;
    });

    it("returns `null` if any parent has one.", () => {
      const subrouter: IRouter = new Router();
      router.mount(subrouter);

      Chai.expect(subrouter.templateEngine).to.be.null;
      Chai.expect(subrouter.templateEngine).to.be.null;
    });
  });

});
