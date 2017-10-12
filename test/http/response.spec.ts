import * as Chai from 'chai'
import Configuration from './../../src/lib/configuration/configuration'
import HttpRequest from './../../src/lib/http/request'
import IHttpRequest from './../../src/lib/types/http-request'
import HttpResponse from './../../src/lib/http/response'
import IHttpResponse from './../../src/lib/types/http-response'
import HttpRoute from './../../src/lib/http/route'
import App from './../../src/lib/lambda-framework'
import IApp from './../../src/lib/types/app'
import { APIGatewayEvent } from 'aws-lambda'

/**
 * Test for HttpResponse.
 */
describe('HttpResponse', () => {
  let request: IHttpRequest
  let response: IHttpResponse
  let event: APIGatewayEvent
  let errResult
  let succResult
  let app: IApp
  beforeEach(function(done) {
    app = new App()
    errResult = undefined
    succResult = undefined
    event = {
      body: 'BODY',
      headers: {
        header1: 'HEADER VALUE 1',
        header2: 'HEADER VALU 2',
        'X-Forwarded-Proto': 'https',
        'Host': 'localhost',
        'Accept': 'application/json,text/html',
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
    request = new HttpRequest(app, event)
    response = new HttpResponse(app, request, (err, succ) => {
      errResult = err;
      succResult = succ
    });

    done()
  });

  it('#status should set the outcoming response status code', () => {
    response.status(302)
    response.send('')
    Chai.expect(succResult.statusCode).to.be.equal(302)
  });

  it('#statusCode should returns the outcoming response status code previously set', () => {
    response.status(302)
    Chai.expect(response.statusCode).to.be.equal(302)
  });

  it('#send should set the outcoming response body to the given string with "html" content type header and the right content length header', () => {
    response.send('ABC')
    Chai.expect(succResult.headers['Content-Type']).to.be.equal('text/html; charset=utf-8')
    Chai.expect(succResult.headers['Content-Length']).to.be.equal('3')
    Chai.expect(response.isSent).to.be.true
  });

  it('#send should set the outcoming response body to the given number with no content type header and the right content length header', () => {
    response.send(false)
    Chai.expect(succResult.headers['Content-Type']).to.be.undefined
    Chai.expect(succResult.headers['Content-Length']).to.be.equal('5')
    Chai.expect(succResult.body).to.be.equal('false')
    Chai.expect(response.isSent).to.be.true
  });

  it('#send should set the outcoming response body to the given boolean with no content type header and the right content length header', () => {
    response.send(1)
    Chai.expect(succResult.headers['Content-Type']).to.be.undefined
    Chai.expect(succResult.headers['Content-Length']).to.be.equal('1')
    Chai.expect(succResult.body).to.be.equal('1')
    Chai.expect(response.isSent).to.be.true
  });

  it('#send should set the outcoming response body to the given Buffer with "bin" content type header and the right content length header', () => {
    response.send(new Buffer('test'))
    Chai.expect(succResult.headers['Content-Type']).to.be.equal('bin')
    Chai.expect(succResult.headers['Content-Length']).to.be.equal('4')
    Chai.expect(succResult.body).to.be.equal('test')
    Chai.expect(response.isSent).to.be.true
  });

  it('#send should set the outcoming response header ETag to the generated with the function in #app.get(Configuration.ETAG_FN)', () => {
    app.set(Configuration.ETAG_FN, (buff, encoding) => 'ETAG' + buff.toString(encoding))
    response.send('test')
    Chai.expect(succResult.headers['ETag']).to.be.equal('ETAGtest')
  });

  it('#send should set the outcoming response status code to 304 if the response is not fresh', () => {
    app.set(Configuration.ETAG_FN, (buff, encoding) => 'etagValue')
    response.putHeader('Last-Modified', '2017-10-10T10:10:09')
    response.send('test')
    Chai.expect(succResult.statusCode).to.be.equal(304)
  });

  it('#send should not set the outcoming response irrelevant headers (Content-Type, Content-Length and Transfer-Encoding) and the body if the response status code is 204', () => {
    response.status(204)
    response.send('')
    Chai.expect(succResult.headers['Content-Type']).to.be.undefined
    Chai.expect(succResult.headers['Content-Length']).to.be.undefined
    Chai.expect(succResult.headers['Transfer-Encoding']).to.be.undefined
  });

  it('#send should not set the outcoming response irrelevant headers (Content-Type, Content-Length and Transfer-Encoding) and the body if the response status code is 304', () => {
    response.status(304)
    response.send('')
    Chai.expect(succResult.headers['Content-Type']).to.be.undefined
    Chai.expect(succResult.headers['Content-Length']).to.be.undefined
    Chai.expect(succResult.headers['Transfer-Encoding']).to.be.undefined
  });

  it('#send should set the outcoming response body to null if the request method is HEAD', () => {
    event.httpMethod = 'HEAD'
    response.send('test')
    Chai.expect(succResult.body).to.be.undefined
  });

  it('#json should set the outcoming response header Content-Type to "application/json"', () => {
    response.json({})
    Chai.expect(succResult.headers['Content-Type']).to.be.equal('application/json; charset=utf-8')
  });

  it('#json should set the outcoming response header Content-Length to the right length', () => {
    const body = {test: 'test1'}
    response.json(body)
    Chai.expect(succResult.headers['Content-Length']).to.be.equal('16')
    Chai.expect(succResult.body).to.be.equal(body)
  });

  it('#sendStatus should set the outcoming response header Content-Length to "txt", the body to the status code body and the satus code to the given status code', () => {
    response.sendStatus(404)
    Chai.expect(succResult.headers['Content-Type']).to.be.equal('text/plain; charset=utf-8')
    Chai.expect(succResult.body).to.be.equal('Not Found')
  });

  it('#contentType should set content type to the given one', () => {
    const contentType = 'application/xml'
    response.contentType(contentType)
    response.send('test')
    Chai.expect(succResult.headers['Content-Type']).to.be.equal('application/xml; charset=utf-8')
  });

  it('#contentType should set content type to the given one and transform it to a full mime type if it does not have /', () => {
    const contentType = 'xml'
    response.contentType(contentType)
    response.send('test')
    Chai.expect(succResult.headers['Content-Type']).to.be.equal('application/xml; charset=utf-8')
  });

  it('#format should execute the first function which key (mime type) is accepted by the incoming request', () => {
    let result;
    response.format({
      'application/xml': (req, res) => {
        result = 'NO';
      },
      'application/json': (req, res) => {
        result = 'YES';
      }
    })
    Chai.expect(result).to.be.equal('YES')
  });

  it('#format should execute the default function if it exists and no key is accepted by the incoming request', () => {
    let result;
    response.format({
      'application/xml': (req, res) => {
        result = 'NO';
      },
      default: (req, res) => {
        result = 'YES';
      }
    })
    Chai.expect(result).to.be.equal('YES')
  });

  it('#format can execute #next if the function is given as argument', () => {
    let result;
    response.format({
      'application/json': (req, res, next) => {
        next();
      }
    }, (err) => { result = 'YES' })
    Chai.expect(result).to.be.equal('YES')
  });

  it('#format should execute #next with the "Not Acceptable" error if no key is accepted by the incoming request and #next is given as argument', () => {
    let err;
    response.format({
      'application/xml': (req, res, next) => {
        next();
      }
    }, (e) => { err = e })
    Chai.expect(err).to.not.be.undefined
    Chai.expect(err.statusCode).to.be.equal(406)
  });

  it('#format should throw "Not Acceptable" error if no key is accepted by the incoming request and #next is not given as argument', () => {
    let err;
    try {
      response.format({
        'application/xml': (req, res, next) => {
          next();
        }
      })
    } catch(e) {
      err = e;
    }
    Chai.expect(err).to.not.be.undefined
    Chai.expect(err.statusCode).to.be.equal(406)
  });

  it('#putHeader should set the header `field` to `value`', () => {
    response.putHeader('field', 'value');
    response.send('test');
    Chai.expect(succResult.headers['field']).to.be.equal('value')
  });

  it('#putHeaders should set each header of `obj`', () => {
    response.putHeaders({
      'field1': 'value1',
      'field2': 'value2'
    });
    response.send('test');
    Chai.expect(succResult.headers['field1']).to.be.equal('value1')
    Chai.expect(succResult.headers['field2']).to.be.equal('value2')
  });

  it('#header should return a previously set header', () => {
    response.putHeader('field', 'value');
    Chai.expect(response.header('field')).to.be.equal('value')
  });

  it('#appendHeader should append a header to a previously set header', () => {
    response.putHeader('field', 'value1');
    response.appendHeader('field', 'value2');
    Chai.expect(response.header('field')).to.be.contain('value1')
    Chai.expect(response.header('field')).to.be.contain('value2')
  });

  it('#removeHeader should remove a previously set header', () => {
    response.putHeader('field', 'value1');
    response.removeHeader('field');
    Chai.expect(response.header('field')).to.be.undefined
  });

  it('#addCookie should add the `name` cookie with the `value` and the `options`', () => {
    response.addCookie('cookie', 'cookieValue', {path: '/test'})
    Chai.expect(response.header('Set-Cookie')).to.be.equal('cookie=cookieValue; Path=/test')
  });

  it('#addCookies should add all the cookies of `obj` with the `options`', () => {
    response.addCookies({
      cookie1: 'cookieValue1',
      cookie2: 'cookieValue2'
    }, {path: '/test'})
    Chai.expect(response.header('Set-Cookie')).to.contain('cookie1=cookieValue1; Path=/test')
    Chai.expect(response.header('Set-Cookie')).to.contain('cookie2=cookieValue2; Path=/test')
  });

  it('#clearCookie should add the cookie `field` with the `options` and the expires to 1 and the path to /', () => {
    response.clearCookie('cookie')
    console.log(response.header('Set-Cookie'))
    Chai.expect(response.header('Set-Cookie')).to.be.equal('cookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
  });

  it('#cookie should return the cookie `name`', () => {
    response.addCookies({
      cookie1: 'cookieValue1',
      cookie2: 'cookieValue2'
    }, {path: '/test'})
    Chai.expect(response.cookie('cookie1')).to.be.equal('cookieValue1')
  });

  it('#location should set the header Location to the given URL', () => {
    response.location('/test');
    Chai.expect(response.header('Location')).to.be.equal('/test')
  });

  it('#redirect should set the header Location to the given URL and the status code to 302', () => {
    response.redirect('/test');
    Chai.expect(succResult.headers['Location']).to.be.equal('/test')
    Chai.expect(succResult.statusCode).to.be.equal(302)
  });

  it('#redirect should set the header Location to the given URL and the status code to the given one', () => {
    response.redirect('/test', 301);
    Chai.expect(succResult.headers['Location']).to.be.equal('/test')
    Chai.expect(succResult.statusCode).to.be.equal(301)
  });

});
