import * as Chai from 'chai'
import HttpLayer from './../../src/lib/http/layer'
import IHttpLayer from './../../src/lib/types/http-layer'
import HttpRoute from './../../src/lib/http/route'
import IHttpRoute from './../../src/lib/types/http-route'
import App from './../../src/lib/app'
import IApp from './../../src/lib/types/app'
import HttpRequest from './../../src/lib/http/request'
import IHttpRequest from './../../src/lib/types/http-request'
import HttpResponse from './../../src/lib/http/response'
import IHttpResponse from './../../src/lib/types/http-response'
import IRouter from './../../src/lib/types/router'
import Router from './../../src/lib/router'

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
 * Test for HttpLayer.
 */
describe('HttpLayer', () => {
  let layer: IHttpLayer
  const app: IApp = new App
  const router: IRouter = new Router
  let req: IHttpRequest
  let res: IHttpResponse
  let callbackErrorResult, callBackSuccessResult

  beforeEach(() => {
    req = new HttpRequest(Object.assign({}, event))
    res = new HttpResponse(app, req, (error, success) => {
      callbackErrorResult = error
      callBackSuccessResult = success
    })
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
  });

  describe('#parsePathParameters', () => {
    it('should return the parameters of the layer path with the related values in the given #path.', () => {
      Chai.expect(layer.parsePathParameters('/blog/1')).to.be.deep.equal({id: '1'})
    });

    it('should return an empty object if the layer path has no parameters.', () => {
      const layer: IHttpLayer = new HttpLayer(router, '/blog', {})
      Chai.expect(layer.parsePathParameters('/blog')).to.be.empty
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