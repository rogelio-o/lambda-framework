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
    res = new HttpResponse(app, req, (error, success) => {
    })
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
