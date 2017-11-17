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

const event = {
  body: 'BODY',
  headers: {
    header1: 'HEADER VALUE 1',
    header2: 'HEADER VALU 2',
    'X-Forwarded-Proto': 'https',
    'Host': 'localhost',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Charset': 'UTF-8, ISO-8859-1',
    'Accept-Language': 'es,en',
    'If-None-Match': 'etagValue',
    'If-Modified-Since': '2017-10-10T10:10:10'
  },
  httpMethod: 'GET',
  isBase64Encoded: true,
  path: '/blog/1',
  pathParameters: {
    param1: 'Param 1'
  },
  queryStringParameters: {
    query1: 'Query 1'
  },
  stageVariables: {
    stage1: 'Stage 1'
  },
  requestContext: {
    accountId: 'A1',
    apiId: 'API1',
    httpMethod: 'GET',
    identity: {
      accessKey: 'ABCD',
      accountId: 'AAA',
      apiKey: 'BBB',
      caller: 'caller',
      cognitoAuthenticationProvider: 'facebook',
      cognitoAuthenticationType: 'authtype',
      cognitoIdentityId: 'IID',
      cognitoIdentityPoolId: 'PID',
      sourceIp: '197.0.0.0',
      user: 'user',
      userAgent: 'Chrome',
      userArn: 'ARN'
    },
    stage: 'test',
    requestId: 'RQID',
    resourceId: 'RSID',
    resourcePath: '/blog/1'
  },
  resource: 'API'
}

/**
 * Test for HttpRoute.
 */
describe('HttpRoute', () => {
  const app: IApp = new App
  const router: IRouter = new Router
  let layer: IHttpLayer, route: IHttpRoute
  let req: IHttpRequest, res: IHttpResponse

  beforeEach(() => {
    layer = new HttpLayer(router, '/blog/:id', {})
    route = new HttpRoute(layer)
    layer.route = route
    req = new HttpRequest(Object.assign({}, event))
    res = new HttpResponse(app, req, (error, success) => {})
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

  describe("#get", () => {
    it("should set a handler for the method GET.", (done) => {
      route.get((req, res, next) => {
        done();
      });
      req.event.httpMethod = "GET";
      route.dispatch(req, res, null);
    });
  });

  describe("#post", () => {
    it("should set a handler for the method POST.", (done) => {
      route.post((req, res, next) => {
        done();
      });
      req.event.httpMethod = "POST";
      route.dispatch(req, res, null);
    });
  });

  describe("#put", () => {
    it("should set a handler for the method PUT.", (done) => {
      route.put((req, res, next) => {
        done();
      });
      req.event.httpMethod = "PUT";
      route.dispatch(req, res, null);
    });
  });

  describe("#delete", () => {
    it("should set a handler for the method DELETE.", (done) => {
      route.delete((req, res, next) => {
        done();
      });
      req.event.httpMethod = "DELETE";
      route.dispatch(req, res, null);
    });
  });

  describe("#layer", () => {
    it("should return the initialized in constructor value for layer.", () => {
      Chai.expect(route.layer).to.be.equal(layer);
    });
  });

});
