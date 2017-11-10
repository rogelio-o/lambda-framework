import * as Chai from 'chai'
import Router from './../src/lib/Router'
import IRouter from './../src/lib/types/IRouter'
import HttpRequest from './../src/lib/http/HttpRequest'
import IHttpRequest from './../src/lib/types/http/IHttpRequest'
import EventRequest from './../src/lib/event/EventRequest'
import IEventRequest from './../src/lib/types/event/IEventRequest'
import HttpResponse from './../src/lib/http/HttpResponse'
import IHttpResponse from './../src/lib/types/http/IHttpResponse'
import App from './../src/lib/App'
import IApp from './../src/lib/types/IApp'

const httpEvent = {
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

const s3Event = {
  "Records": [
    {
      "eventVersion": "2.0",
      "eventTime": "1970-01-01T00:00:00.000Z",
      "requestParameters": {
        "sourceIPAddress": "127.0.0.1"
      },
      "s3": {
        "configurationId": "testConfigRule",
        "object": {
          "eTag": "0123456789abcdef0123456789abcdef",
          "sequencer": "0A1B2C3D4E5F678901",
          "key": "test/key",
          "size": 1024
        },
        "bucket": {
          "arn": "arn:aws:s3:::example-bucket",
          "name": "example-bucket",
          "ownerIdentity": {
            "principalId": "EXAMPLE"
          }
        },
        "s3SchemaVersion": "1.0"
      },
      "responseElements": {
        "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH",
        "x-amz-request-id": "EXAMPLE123456789"
      },
      "awsRegion": "us-east-1",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "EXAMPLE"
      },
      "eventSource": "aws:s3"
    }
  ]
}

/**
 * Test for Router.
 */
describe('Router', () => {
  const app: IApp = new App
  let router: IRouter, eventReq: IEventRequest
  let httpReq: IHttpRequest, res: IHttpResponse
  let callbackErrorResult, callBackSuccessResult, doCallback: Function

  beforeEach(() => {
    doCallback = undefined
    router = new Router
    eventReq = new EventRequest(s3Event)
    httpReq = new HttpRequest(httpEvent)
    res = new HttpResponse(app, httpReq, (error, success) => {
      callbackErrorResult = error
      callBackSuccessResult = success
      if(doCallback) {
        doCallback()
      }
    })
  })

  describe('#fullSubpath', () => {
    it('should return each parent subpath concadenated with the current subrouter subpath.', () => {
      const subrouter = new Router
      router.mount(subrouter, '/path1')

      const subsubrouter = new Router
      subrouter.mount(subsubrouter, '/path2')

      Chai.expect(subsubrouter.fullSubpath).to.be.equal('/path1/path2')
    });

    it('should return the current subpath if the router hasn\'t a parent.', () => {
      Chai.expect(router.fullSubpath).to.be.undefined
    });

    it('should return undefined if the subpath is undefined.', () => {
      const subrouter = new Router
      router.mount(subrouter)

      Chai.expect(subrouter.fullSubpath).to.be.undefined
    });
  });

  describe('#httpHandle', () => {
    it('should create and start a #HttpRouterExecutor if the request method is NOT OPTIONS', (done) => {
      router.use((req, res, next) => {
        done()
      })

      router.httpHandle(httpReq, res, () => {})
    });

    it('should response with the available HTTP methods for the request path in the Allow header if the request method is OPTIONS.', (done) => {
      const newEvent = Object.assign({}, httpEvent)
      newEvent.httpMethod = 'OPTIONS'
      const req = new HttpRequest(newEvent)

      router.route('/blog/:id').get((req, res) => {})
      router.route('/blog/:id').post((req, res) => {})

      doCallback = () => {
        Chai.expect(callBackSuccessResult.headers['Allow']).to.be.equals('GET,POST')
        done()
      }

      router.httpHandle(req, res, () => {})
    });

    it('should call #out if the request method is OPTIONS and there is no available HTTP methods for the request path.', (done) => {
      const newEvent = Object.assign({}, httpEvent)
      newEvent.httpMethod = 'OPTIONS'
      const req = new HttpRequest(newEvent)

      router.httpHandle(req, res, () => {
        done()
      })
    });
  });

  describe('#httpProcessParams', () => {
    const newEvent = Object.assign({}, httpEvent)
    newEvent.path = '/blog/:id1/:id2'
    const req = new HttpRequest(newEvent)

    let previouslyCalled1: boolean
    let previouslyCalled2: boolean
    let previouslyCalled3: boolean

    beforeEach(() => {
      previouslyCalled1 = false
      previouslyCalled2 = false
      previouslyCalled3 = false

      router.param('id1', (req, res, next, value) => {
        Chai.expect(value).to.be.equal('1')
        previouslyCalled1 = true
        next()
      })

      router.param('id1', (req, res, next, value) => {
        Chai.expect(value).to.be.equal('1')
        previouslyCalled2 = true
        next()
      })

      router.param('id2', (req, res, next, value) => {
        Chai.expect(value).to.be.equal('2')
        previouslyCalled3 = true
        next()
      })
    })

    it('should call each handlers for each param in #layerParams.', (done) => {
      router.httpProcessParams({id1: '1', id2: '2'}, [], req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true
        Chai.expect(previouslyCalled2).to.be.true
        Chai.expect(previouslyCalled3).to.be.true
        done()
      })
    });

    it('should NOT call the handlers for the params in #executedParams.', (done) => {
      router.httpProcessParams({id1: '1', id2: '2'}, ['id2'], req, res, () => {
        Chai.expect(previouslyCalled1).to.be.true
        Chai.expect(previouslyCalled2).to.be.true
        Chai.expect(previouslyCalled3).to.be.false
        done()
      })
    });

    it('should add the processed params into #executedParams.', (done) => {
      const executed: Array<string> = []
      router.httpProcessParams({id1: '1', id2: '2'}, executed, req, res, () => {
        Chai.expect(executed).to.contain('id1')
        Chai.expect(executed).to.contain('id2')
        done()
      })
    });

    it('should execute #done if there is no params in #layerParams.', (done) => {
      router.httpProcessParams({}, [], req, res, () => {
        done()
      })
    });

    it('should finalize calling #done when there is params without related handlers.', (done) => {
      const router = new Router // Clean router without params handlers
      router.httpProcessParams({id1: '1', id2: '2'}, [], req, res, () => {
        done()
      })
    });

    it('should finalize calling #done when there is params with related handlers.', (done) => {
      router.httpProcessParams({id1: '1', id2: '2'}, [], req, res, () => {
        done()
      })
    });
  });

  describe('#getAvailableMethodsForPath', () => {
    it('should return each HTTP method of each route that match with the request path', () => {
      router.route('/blog/:id').get((req, res) => {})
      router.route('/blog/:id').post((req, res) => {})

      const methods = router.getAvailableMethodsForPath('/blog/1')

      Chai.expect(methods).to.contain('GET')
      Chai.expect(methods).to.contain('POST')
    });

    it('should NOT return HTTP method of the routes that doesn\'t match with the request path', () => {
      router.route('/blog/:id').get((req, res) => {})
      router.route('/blog/a/:id').post((req, res) => {})

      const methods = router.getAvailableMethodsForPath('/blog/1')

      Chai.expect(methods).to.contain('GET')
      Chai.expect(methods).to.not.contain('POST')
    });

    it('should return each HTTP method of each route that match with the request path which are in a subrouter that match with request path.', () => {
      const subrouter = new Router
      subrouter.route('/:id').get((req, res) => {})
      subrouter.route('/:id').post((req, res) => {})
      router.mount(subrouter, '/blog')

      const methods = router.getAvailableMethodsForPath('/blog/1')

      Chai.expect(methods).to.contain('GET')
      Chai.expect(methods).to.contain('POST')
    });

    it('should NOT return HTTP method of the routes that match with the request path which are in a subrouter that doesn\'t match with request path.', () => {
      const subrouter = new Router
      subrouter.route('/:id').get((req, res) => {})
      subrouter.route('/a/:id').post((req, res) => {})
      router.mount(subrouter, '/blog')

      const methods = router.getAvailableMethodsForPath('/blog/1')

      Chai.expect(methods).to.contain('GET')
      Chai.expect(methods).to.not.contain('POST')
    });
  });

  describe('#eventHandle', () => {
    it('should create and start a #EventRouterExecutor.', (done) => {
      router.event('S3CreateEvent', (req, next) => {
        done()
      })

      router.eventHandle(eventReq, () => {})
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
