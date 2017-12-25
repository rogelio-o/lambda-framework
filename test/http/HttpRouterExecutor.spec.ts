/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import App from "./../../src/lib/App";
import HttpRequest from "./../../src/lib/http/HttpRequest";
import HttpResponse from "./../../src/lib/http/HttpResponse";
import HttpRouterExecutor from "./../../src/lib/http/HttpRouterExecutor";
import Router from "./../../src/lib/Router";
import IHttpRequest from "./../../src/lib/types/http/IHttpRequest";
import IHttpResponse from "./../../src/lib/types/http/IHttpResponse";
import IHttpRouterExecutor from "./../../src/lib/types/http/IHttpRouterExecutor";
import IApp from "./../../src/lib/types/IApp";
import IRouter from "./../../src/lib/types/IRouter";
import DefaultCallback from "./../utils/DefaultCallback";
import httpEvent from "./../utils/httpEvent";

/**
 * Test for HttpRouterExecutor.
 */
describe("HttpRouterExecutor", () => {
  const app: IApp = new App();
  let req: IHttpRequest;
  let res: IHttpResponse;
  let router: IRouter;
  let callback: DefaultCallback;

  beforeEach(() => {
    callback = new DefaultCallback();
    req = new HttpRequest(Object.assign({}, httpEvent));
    res = new HttpResponse(app, req, callback);
    router = new Router();
  });

  describe("#next", () => {
    it("should call #handle on the first layer which match with the request path (if it exists).", (done) => {
      let previouslyCalled: boolean = false;

      router.route("/blog/:id").get((request, response, next) => {
        previouslyCalled = true;
        next();
      });

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should call #handle on the next layer (after a previous next call) which match with the request path (if it exists).", (done) => {
      let previouslyCalled1: boolean = false;
      let previouslyCalled2: boolean = false;

      router.use((request, response, next) => {
        previouslyCalled1 = true;
        next();
      });

      router.route("/blog/:id").get((request, response, next) => {
        previouslyCalled2 = true;
        next();
      });

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true;
        Chai.expect(previouslyCalled2).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should call #next if there is no layer matching with the request path.", (done) => {
      let previouslyCalled: boolean = false;

      router.route("/blog").get((request, response, next) => {
        previouslyCalled = true;
        next();
      });

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled).to.be.false;
        done();
      });
      routerExecutor.next();
    });

    it("should call #next if the found layer hasn\'t an error handler and the given #error is not undefined.", (done) => {
      let previouslyCalled1: boolean = false;
      let previouslyCalled2: boolean = false;

      router.use((request, response, next) => {
        previouslyCalled1 = true;
        next();
      });

      router.route("/blog/:id").get((request, response, next) => {
        previouslyCalled2 = true;
        next();
      });

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled1).to.be.false;
        Chai.expect(previouslyCalled2).to.be.false;
        done();
      });
      routerExecutor.next(new Error());
    });

    it("should use the layer if the found layer has an error handler and the given #error is not undefined.", (done) => {
      let previouslyCalled1: boolean = false;
      let previouslyCalled2: boolean = false;

      router.use((request, response, next, error) => {
        previouslyCalled1 = true;
        next(error);
      });

      router.route("/blog/:id").get((request, response, next) => {
        previouslyCalled2 = true;
        next();
      });

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true;
        Chai.expect(previouslyCalled2).to.be.false;
        done();
      });
      routerExecutor.next(new Error());
    });

    it("should set the request route to the route of the layer before call the layer handler.", (done) => {
      let previouslyCalled1: boolean = false;
      let previouslyCalled2: boolean = false;

      router.route("/blog/:id").get((request, response, next) => {
        previouslyCalled1 = true;
        Chai.expect(req.route).to.be.not.undefined;
        next();
      });

      router.use((request, response, next) => {
        previouslyCalled2 = true;
        Chai.expect(req.route).to.be.undefined;
        next();
      });

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true;
        Chai.expect(previouslyCalled2).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should set the request params to the params of the layer merged with the initial request params before call the layer handler.", (done) => {
      let previouslyCalled1: boolean = false;
      let previouslyCalled2: boolean = false;

      router.route("/blog/:id").get((request, response, next) => {
        previouslyCalled1 = true;
        Chai.expect(req.params).to.deep.include({id: "1", query1: "Query 1"});
        next();
      });

      router.use((request, response, next) => {
        previouslyCalled2 = true;
        Chai.expect(req.params).to.deep.include({query1: "Query 1"});
        Chai.expect(req.params).to.not.deep.include({id: "1"});
        next();
      });

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true;
        Chai.expect(previouslyCalled2).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should set the request params to the params of the layer only if the initial request params is null before call the layer handler.", (done) => {
      let previouslyCalled: boolean = false;

      router.route("/blog/:id").get((request, response, next) => {
        previouslyCalled = true;
        Chai.expect(req.params).to.deep.include({id: "1"});
        next();
      });

      req.params = null;
      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should 'process the layer params' with the router before call the layer handler.", (done) => {
      let previouslyCalled: boolean = false;

      router.param("id", (request, response, next, value) => {
        req.context.idValue = value;
        next();
      });

      router.route("/blog/:id").get((request, response, next) => {
        previouslyCalled = true;
        Chai.expect(req.context.idValue).to.be.equal("1");
        next();
      });

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should call #next with error if there was an error processing the params before call the layer handler.", (done) => {
      let previouslyCalled: boolean = false;

      router.param("id", (request, response, next, value) => {
        next(new Error());
      });

      router.route("/blog/:id").get((request, response, next) => {
        previouslyCalled = true;
        next();
      });

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, (error) => {
        Chai.expect(previouslyCalled).to.be.false;
        Chai.expect(error).to.be.not.undefined;
        done();
      });
      routerExecutor.next();
    });

    it("should call #httpHandle on the first subrouter which match with the request path (if it exists) and when there is no more layer in the stack.", (done) => {
      let previouslyCalled1: boolean = false;
      let previouslyCalled2: boolean = false;

      router.use((request, response, next) => {
        previouslyCalled1 = true;
        next();
      });

      const subrouter = new Router();
      subrouter.route("/:id").get((request, response, next) => {
        previouslyCalled2 = true;
        next();
      });
      router.mount(subrouter, "/blog");

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true;
        Chai.expect(previouslyCalled2).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should call #httpHandle on the first subrouter which match with the request path (if it exists) and when the layer stack is empty.", (done) => {
      let previouslyCalled: boolean = false;

      const subrouter = new Router();
      subrouter.route("/blog/:id").get((request, response, next) => {
        previouslyCalled = true;
        next();
      });
      router.mount(subrouter);

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should call #httpHandle on the next subrouter (after a previous next call) which match with the request path (if it exists).", (done) => {
      let previouslyCalled1: boolean = false;
      let previouslyCalled2: boolean = false;

      const subrouter1 = new Router();
      subrouter1.use((request, response, next) => {
        previouslyCalled1 = true;
        next();
      });

      const subrouter2 = new Router();
      subrouter2.route("/blog/:id").get((request, response, next) => {
        previouslyCalled2 = true;
        next();
      });
      router.mount(subrouter1);
      router.mount(subrouter2);

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true;
        Chai.expect(previouslyCalled2).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should call #next if there is no subrouter matching with the request path.", (done) => {
      let previouslyCalled: boolean = false;
      const subrouter = new Router();
      subrouter.route("/:id").get((request, response, next) => {
        previouslyCalled = true;
        next();
      });
      router.mount(subrouter, "/contact");

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled).to.be.false;
        done();
      });
      routerExecutor.next();
    });

    it("should call #done if the subrouters and the layers stacks are empty.", (done) => {
      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        done();
      });
      routerExecutor.next();
    });

    it("should call #done in the following call to next when the layers and the subrouters stacks have been processed.", (done) => {
      let previouslyCalled1: boolean = false;
      let previouslyCalled2: boolean = false;

      router.use(
        (request, response, next) => {
          previouslyCalled1 = true;
          next();
        },
        "/blog/:id"
      );

      const subrouter = new Router();
      subrouter.route("/:id").get((request, response, next) => {
        previouslyCalled2 = true;
        next();
      });
      router.mount(subrouter, "/blog");

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true;
        Chai.expect(previouslyCalled2).to.be.true;
        done();
      });
      routerExecutor.next();
    });

    it("should reset the request params as the initial ones when #done is called.", (done) => {
      const initialParams = req.params;
      let previouslyCalled: boolean = false;

      router.use(
        (request, response, next) => {
          previouslyCalled = true;
          Chai.expect(req.params).to.be.not.equal(initialParams);
          next();
        },
        "/blog/:id"
      );

      const routerExecutor: IHttpRouterExecutor = new HttpRouterExecutor(router, req, res, () => {
        Chai.expect(previouslyCalled).to.be.true;
        Chai.expect(req.params).to.be.equal(initialParams);
        done();
      });
      routerExecutor.next();
    });
  });

});
