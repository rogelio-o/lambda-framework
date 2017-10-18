import IEventRequest from './../types/event/IEventRequest'

const defer = typeof setImmediate === 'function'
  ? setImmediate
  : function (fn, err, req) { process.nextTick(fn.bind.apply(fn, arguments)) }

export default function finalHandler(req: IEventRequest, options: {[name: string]: any}) {
  const opts = options || {}

  // get environment
  const env = opts.env || process.env.NODE_ENV || 'development'

  // get error callback
  const onerror = opts.onerror

  return (err?: Error) => {
    // schedule onerror callback
    if (onerror) {
      defer(onerror, err, req)
    }
  }
}
