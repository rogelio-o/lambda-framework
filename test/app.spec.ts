import App from '../src/index'
import { configuration } from '../src/index'
import defaultConfiguration from '../src/lib/configuration/defaultConfiguration'
import * as Chai from 'chai'

/**
 * Test for App.
 */
describe('App', () => {
  let app
  beforeEach(function(done) {
    app = new App()

    done()
  });

  it('#init without settings should init with default configuration', async (done) => {
    app.init()
    Object.keys(defaultConfiguration)
      .forEach(param => Chai.expect(defaultConfiguration[param]).to.be.equal(app.get(param)))

    done();
  });

  it('#init with settings should init with custom configuration', async (done) => {
    const settings = {}
    settings[configuration.DEFAULT_MYME_TYPE] = 'text/html'

    app.init(settings)
    Object.keys(settings)
      .forEach(param => Chai.expect(settings[param]).to.be.equal(app.get(param)))

    done();
  });

  it('#enable should set the param as true', async (done) => {
    app.enable('option1')
    Chai.expect(app.get('option1')).to.be.true

    done();
  });

  it('#disable should set the param as false', async (done) => {
    app.disable('option1')
    Chai.expect(app.get('option1')).to.be.false

    done();
  });

  it('#set should set the param with the indicated value', async (done) => {
    app.get('option1', 'value1')
    Chai.expect(app.get('option1')).to.be.equal('value1')

    done();
  });
});
