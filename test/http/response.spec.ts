/**
 * Test for HttpResponse.
 */
describe('HttpResponse', () => {

  it('#status should set the outcoming response status code', async (done) => {
    done()
  });

  it('#statusCode should returns the outcoming response status code previously set', async (done) => {
    done()
  });

  it('#send should set the outcoming response body to the given string with "html" content type header and the right content length header', async (done) => {
    done()
  });

  it('#send should set the outcoming response body to the given number with "bin" content type header and the right content length header', async (done) => {
    done()
  });

  it('#send should set the outcoming response body to the given boolean with "bin" content type header and the right content length header', async (done) => {
    done()
  });

  it('#send should set the outcoming response header ETag to the generated with the function in #app.get(Configuration.ETAG_FN)', async (done) => {
    done()
  });

  it('#send should set the outcoming response status code to 304 if the response is not fresh', async (done) => {
    done()
  });

  it('#send should not set the outcoming response irrelevant headers (Content-Type, Content-Length and Transfer-Encoding) and the body if the response status code is 204', async (done) => {
    done()
  });

  it('#send should not set the outcoming response irrelevant headers (Content-Type, Content-Length and Transfer-Encoding) and the body if the response status code is 304', async (done) => {
    done()
  });

  it('#send should not set the outcoming response header Content-Length', async (done) => {
    done()
  });

  it('#send should set the outcoming response body to null if the request method is HEAD', async (done) => {
    done()
  });

  it('#json should set the outcoming response header Content-Type to "application/json"', async (done) => {
    done()
  });

  it('#json should set the outcoming response header Content-Length to the right length', async (done) => {
    done()
  });

  it('#sendStatus should set the outcoming response header Content-Length to "txt", the body to the status code body and the satus code to the given status code', async (done) => {
    done()
  });

  it('#contentType should set content type to the given one', async (done) => {
    done()
  });

  it('#contentType should set content type to the given one and transform it to a full mime type if it does not have /', async (done) => {
    done()
  });

  it('#format should execute the first function which key (mime type) is accepted by the incoming request', async (done) => {
    done()
  });

  it('#format should execute the default function if it exists and no key is accepted by the incoming request', async (done) => {
    done()
  });

  it('#format should execute #next with the "Not Acceptable" error if no key is accepted by the incoming request', async (done) => {
    done()
  });

  it('#putHeader should set the header `field` to `value`', async (done) => {
    done()
  });

  it('#putHeaders should set each header of `obj`', async (done) => {
    done()
  });

  it('#header should return a previously set header', async (done) => {
    done()
  });

  it('#appendHeader should append a header to a previously set header', async (done) => {
    done()
  });

  it('#removeHeader should remove a previously set header', async (done) => {
    done()
  });

  it('#addCookie should add the `name` cookie with the `value` and the `options`', async (done) => {
    done()
  });

  it('#addCookies should add all the cookies of `obj` with the `options`', async (done) => {
    done()
  });

  it('#clearCookie should add the cookie `field` with the `options` and the expires to 1 and the path to /', async (done) => {
    done()
  });

  it('#cookie should return the cookie `name`', async (done) => {
    done()
  });

  it('#location should set the header Location to the given URL', async (done) => {
    done()
  });

  it('#redirect should set the header Location to the given URL and the status code to the given one', async (done) => {
    done()
  });

});
