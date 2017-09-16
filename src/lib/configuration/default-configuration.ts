import Configuration from './configuration'

const result = {}
result[Configuration.DEFAULT_MYME_TYPE] = 'application/json;charset=UTF-8'
result[Configuration.ENVIRONMENT] = 'dev'
result[Configuration.TRUST_PROXY] = false

export default result
