import Configuration from './configuration'
import { generate } from 'randomstring'

const result = {}
result[Configuration.DEFAULT_MYME_TYPE] = 'application/json;charset=UTF-8'
result[Configuration.ENVIRONMENT] = 'development'
result[Configuration.TRUST_PROXY] = false
result[Configuration.COOKIE_SECRET] = generate()

export default result
