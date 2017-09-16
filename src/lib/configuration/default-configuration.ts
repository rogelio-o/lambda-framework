import Configuration from './configuration'
import randomstring from 'randomstring'

const result = {}
result[Configuration.DEFAULT_MYME_TYPE] = 'application/json;charset=UTF-8'
result[Configuration.ENVIRONMENT] = 'dev'
result[Configuration.TRUST_PROXY] = false
result[Configuration.COOKIE_SECRET] = randomstring.generate()

export default result
