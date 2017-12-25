/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import App from "./../../src/lib/App";
import HttpLayer from "./../../src/lib/http/HttpLayer";
import HttpRequest from "./../../src/lib/http/HttpRequest";
import HttpResponse from "./../../src/lib/http/HttpResponse";
import HttpRoute from "./../../src/lib/http/HttpRoute";
import Router from "./../../src/lib/Router";
import IHttpLayer from "./../../src/lib/types/http/IHttpLayer";
import IHttpRequest from "./../../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../../src/lib/types/http/IHttpResponse";
import IHttpRoute from "./../../src/lib/types/http/IHttpRoute";
import IApp from "./../../src/lib/types/IApp";
import IRawEvent from "./../../src/lib/types/IRawEvent";
import IRouter from "./../../src/lib/types/IRouter";
import DefaultCallback from "./../utils/DefaultCallback";
import httpEvent from "./../utils/httpEvent";

/**
 * Test for HttpRoute.
 */
describe("HttpRoute", () => {
  const app: IApp = new App();
  const router: IRouter = new Router();
  let layer: IHttpLayer;
  let route: IHttpRoute;
  let req: IHttpRequest;
  let res: IHttpResponse;
  let event: IRawEvent;
  let callback: DefaultCallback;

  beforeEach(() => {
    event = Object.assign({}, httpEvent);
    callback = new DefaultCallback();
    layer = new HttpLayer(router, "/blog/:id", {});
    route = new HttpRoute(layer);
    layer.route = route;
    req = new HttpRequest(app, event);
    res = new HttpResponse(app, req, callback);
  });

  describe("#hasMethod", () => {
    it("should return true if the has a handler for the given #method.", () => {
      route.get((request, response, next) => { console.log("OK"); });
      Chai.expect(route.hasMethod("GET")).to.be.true;
    });

    it("should return false if the has NOT a handler for the given #method.", () => {
      route.get((request, response, next) => { console.log("OK"); });
      Chai.expect(route.hasMethod("POST")).to.be.false;
    });

    it("should return true if the has a handler for all.", () => {
      route.all((request, response, next) => { console.log("OK"); });
      Chai.expect(route.hasMethod("POST")).to.be.true;
    });
  });

  describe("#dispatch", () => {
    it("should call the handler for the request method (if it exists).", (done) => {
      let previouslyCalled: boolean = false;
      route.get((request, response, next) => {
        previouslyCalled = true;
        next();
      });
      route.dispatch(req, res, () => {
        Chai.expect(previouslyCalled).to.be.true;
        done();
      });
    });

    it("should call the handler for ALL the methods if it exists and there is no handler for the request method.", (done) => {
      let previouslyCalled: boolean = false;
      route.all((request, response, next) => {
        previouslyCalled = true;
        next();
      });
      route.dispatch(req, res, () => {
        Chai.expect(previouslyCalled).to.be.true;
        done();
      });
    });

    it("should call next if there is no handler for the request method neither for ALL.", (done) => {
      let previouslyCalled: boolean = false;
      route.post((request, response, next) => {
        previouslyCalled = true;
        next();
      });
      route.dispatch(req, res, () => {
        Chai.expect(previouslyCalled).to.be.false;
        done();
      });
    });
  });

  describe("#get", () => {
    it("should set a handler for the method GET.", (done) => {
      route.get((request, response, next) => {
        done();
      });
      event.httpMethod = "GET";
      route.dispatch(req, res, null);
    });
  });

  describe("#post", () => {
    it("should set a handler for the method POST.", (done) => {
      route.post((request, response, next) => {
        done();
      });
      event.httpMethod = "POST";
      route.dispatch(req, res, null);
    });
  });

  describe("#put", () => {
    it("should set a handler for the method PUT.", (done) => {
      route.put((request, response, next) => {
        done();
      });
      event.httpMethod = "PUT";
      route.dispatch(req, res, null);
    });
  });

  describe("#delete", () => {
    it("should set a handler for the method DELETE.", (done) => {
      route.delete((request, response, next) => {
        done();
      });
      event.httpMethod = "DELETE";
      route.dispatch(req, res, null);
    });
  });

  describe("#layer", () => {
    it("should return the initialized in constructor value for layer.", () => {
      Chai.expect(route.layer).to.be.equal(layer);
    });
  });

});
