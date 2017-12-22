import * as Chai from 'chai'
import { stub, SinonStub } from "sinon";
import HttpError from './../../src/lib/exceptions/HttpError'
import HttpLayer from './../../src/lib/http/HttpLayer'
import IHttpLayer from './../../src/lib/types/http/IHttpLayer'
import HttpRoute from './../../src/lib/http/HttpRoute'
import IHttpRoute from './../../src/lib/types/http/IHttpRoute'
import App from './../../src/lib/App'
import IApp from './../../src/lib/types/IApp'
import HttpRequest from './../../src/lib/http/HttpRequest'
import IHttpRequest from './../../src/lib/types/http/IHttpRequest'
import HttpResponse from './../../src/lib/http/HttpResponse'
import IHttpResponse from './../../src/lib/types/http/IHttpResponse'
import IRouter from './../../src/lib/types/IRouter'
import Router from './../../src/lib/Router'
import DefaultCallback from "./../utils/DefaultCallback";
import httpEvent from "./../utils/httpEvent";

/**
 * Test for HttpLayer.
 */
describe('HttpLayer', () => {
  let layer: IHttpLayer
  const app: IApp = new App
  const router: IRouter = new Router
  const subrouter: IRouter = new Router
  router.mount(subrouter, '/blog');
  let req: IHttpRequest
  let res: IHttpResponse

  const callback: DefaultCallback = new DefaultCallback();

  beforeEach(() => {
    req = new HttpRequest(Object.assign({}, httpEvent))
    res = new HttpResponse(app, req, callback)
    layer = new HttpLayer(router, '/blog/:id', {})
  });

  describe('#match', () => {
    it('should return true if #path match with the layer path.', () => {
      Chai.expect(layer.match('/blog/1')).to.be.true
    });

    it('should return false if the given #path does not match with the layer path.', () => {
      Chai.expect(layer.match('/blog')).to.be.false
    });

    it('should return true if the layer path is not defined.', () => {
      const layer = new HttpLayer(router, null, {})
      Chai.expect(layer.match('/blog')).to.be.true
    });

    it('should return true if the path is the router subpath plus the layer path.', () => {
      layer = new HttpLayer(subrouter, '/:id', {})
      Chai.expect(layer.match('/blog/1')).to.be.true
    });

    it("should return false if the path doesn't match with the router subpath.", () => {
      layer = new HttpLayer(subrouter, '/:id', {})
      Chai.expect(layer.match('/projects/1')).to.be.false
    });
  });

  describe('#parsePathParameters', () => {
    it('should return the parameters of the layer path with the related values in the given #path.', () => {
      Chai.expect(layer.parsePathParameters('/blog/1')).to.be.deep.equal({id: '1'})
    });

    it('should return an empty object if the layer path has no parameters.', () => {
      const layer: IHttpLayer = new HttpLayer(router, '/blog', {})
      Chai.expect(layer.parsePathParameters('/blog')).to.be.empty
    });

    it("should return the path as 0 variable if the layer path is *", () => {
      const layer: IHttpLayer = new HttpLayer(router, "*", {});
      Chai.expect(layer.parsePathParameters("/blog")).to.be.deep.equal({0: "/blog"});
    });

    it("should return an empty object if the layer path is / and the layer end option is false.", () => {
      const layer: IHttpLayer = new HttpLayer(router, "/", {end: false});
      Chai.expect(layer.parsePathParameters("/blog")).to.be.empty;
    });

    it("should return an empty object if the layer path is not in the router subpath.", () => {
      const layer: IHttpLayer = new HttpLayer(subrouter, "/:id", {});
      Chai.expect(layer.parsePathParameters("/projects/1")).to.be.empty;
    });

    it("should throw a HTTP error if there is an URI error decoding a param.", () => {
      Chai.expect(() => layer.parsePathParameters("/blog/%E0%A4%A")).to.throw(HttpError, "Failed to decode param \"%E0%A4%A\"");
    });
  });

  describe('#handle', () => {
    it('should call the #route dispatcher if #error is undefined and the layer has a #route (and it hasn\'t a #handler).', (done) => {
      let previouslyCalled: boolean = false;
      const route: IHttpRoute = new HttpRoute(layer)
      layer.route = route
      route.all((req, res, next) => {
        previouslyCalled = true
        next()
      })
      layer.handle(req, res, () => {
        Chai.expect(previouslyCalled).to.be.true
        done()
      })
    });

    it('should call #next if #error is NOT undefined and the layer has a #route (and it hasn\'t a #handler).', (done) => {
      let previouslyCalled: boolean = false;
      const route: IHttpRoute = new HttpRoute(layer)
      layer.route = route
      route.all((req, res, next) => {
        previouslyCalled = true
        next()
      })
      layer.handle(req, res, () => {
        Chai.expect(previouslyCalled).to.be.false
        done()
      }, new Error)
    });

    it('should call #next if the layer hasn\'t #handler neither #route.', (done) => {
      layer.handle(req, res, () => {
        done()
      })
    });

    it('should call #handler if the layer has an error #handler and there is an #error.', (done) => {
      let previouslyCalled: boolean = false;
      const layer: IHttpLayer = new HttpLayer(router, '/blog/:id', {}, (req, res, next, error) => {
        previouslyCalled = true
        next()
      })
      layer.handle(req, res, () => {
        Chai.expect(previouslyCalled).to.be.true
        done()
      }, new Error)
    });

    it('should call #next with the incoming #error if the layer has a #handler without error handling and there is an #error.', (done) => {
      const error: Error = new Error('Test')
      let previouslyCalled: boolean = false;
      const layer: IHttpLayer = new HttpLayer(router, '/blog/:id', {}, (req, res, next) => {
        previouslyCalled = true
        next()
      })
      layer.handle(req, res, (err) => {
        Chai.expect(previouslyCalled).to.be.false
        Chai.expect(err).to.be.equals(error)
        done()
      }, error)
    });

    it('should call #handler if the layer has #handler and there isn\'t an error.', (done) => {
      let previouslyCalled: boolean = false;
      const layer: IHttpLayer = new HttpLayer(router, '/blog/:id', {}, (req, res, next) => {
        previouslyCalled = true
        next()
      })
      layer.handle(req, res, () => {
        Chai.expect(previouslyCalled).to.be.true
        done()
      })
    });

    it('should call #next with error if the #handler raise an exception.', (done) => {
      const error: Error = new Error('Test')
      const layer: IHttpLayer = new HttpLayer(router, '/blog/:id', {}, (req, res, next) => {
        throw error
      })
      layer.handle(req, res, (err) => {
        Chai.expect(err).to.be.equal(error)
        done()
      })
    });
  });

  describe('#isErrorHandler', () => {
    it('should return false if the layer has a #route.', () => {
      const route: IHttpRoute = new HttpRoute(layer)
      layer.route = route
      Chai.expect(layer.isErrorHandler()).to.be.false
    });

    it('should return false if the layer hasn\'t a #route but the #handler has 3 arguments as input.', () => {
      const layer: IHttpLayer = new HttpLayer(router, '/blog/:id', {}, (req, res, next) => {

      })
      Chai.expect(layer.isErrorHandler()).to.be.false
    });

    it('should return false if the layer hasn\'t a #route and hasn\'t a #handler.', () => {
      Chai.expect(layer.isErrorHandler()).to.be.false
    });

    it('should return true if the layer hasn\'t a #route and the #handler has 4 arguments as input.', () => {
      const layer: IHttpLayer = new HttpLayer(router, '/blog/:id', {}, (req, res, next, err) => {

      })
      Chai.expect(layer.isErrorHandler()).to.be.true
    });
  });
});
