import * as Chai from 'chai'
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
 * Test for HttpRoute.
 */
describe('HttpRoute', () => {
  const app: IApp = new App
  const router: IRouter = new Router
  let layer: IHttpLayer, route: IHttpRoute
  let req: IHttpRequest, res: IHttpResponse
  let callback: DefaultCallback;

  beforeEach(() => {
    callback = new DefaultCallback();
    layer = new HttpLayer(router, '/blog/:id', {})
    route = new HttpRoute(layer)
    layer.route = route
    req = new HttpRequest(Object.assign({}, httpEvent))
    res = new HttpResponse(app, req, callback);
  })


  describe('#hasMethod', () => {
    it('should return true if the has a handler for the given #method.', () => {
      route.get((req, res, next) => {})
      Chai.expect(route.hasMethod('GET')).to.be.true
    });

    it('should return false if the has NOT a handler for the given #method.', () => {
      route.get((req, res, next) => {})
      Chai.expect(route.hasMethod('POST')).to.be.false
    });

    it('should return true if the has a handler for all.', () => {
      route.all((req, res, next) => {})
      Chai.expect(route.hasMethod('POST')).to.be.true
    });
  });

  describe('#dispatch', () => {
    it('should call the handler for the request method (if it exists).', (done) => {
      let previouslyCalled: boolean = false
      route.get((req, res, next) => {
        previouslyCalled = true
        next()
      })
      route.dispatch(req, res, () => {
        Chai.expect(previouslyCalled).to.be.true
        done()
      })
    });

    it('should call the handler for ALL the methods if it exists and there is no handler for the request method.', (done) => {
      let previouslyCalled: boolean = false
      route.all((req, res, next) => {
        previouslyCalled = true
        next()
      })
      route.dispatch(req, res, () => {
        Chai.expect(previouslyCalled).to.be.true
        done()
      })
    });

    it('should call next if there is no handler for the request method neither for ALL.', (done) => {
      let previouslyCalled: boolean = false
      route.post((req, res, next) => {
        previouslyCalled = true
        next()
      })
      route.dispatch(req, res, () => {
        Chai.expect(previouslyCalled).to.be.false
        done()
      })
    });
  });

});
