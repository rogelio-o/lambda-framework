import IEventRequest from "./../types/event/IEventRequest";
import INext from "./../types/INext";

const defer = typeof setImmediate === "function"
  ? setImmediate
  : (fn, err, req) => process.nextTick(fn.bind.apply(fn, arguments));

/**
 * The final handler to be executed if no previous handler has stopped
 * the router execution.
 * @param  {IEventRequest}           req     the incoming request which start
 *                                           the exec.
 * @param  {[name: string]: any}    options the options of the final handler.
 * @return {[INext]}
 */
export default function eventFinalHandler(req: IEventRequest, options: {[name: string]: any}): INext {
  const opts = options || {};

  // get error callback
  const onerror = opts.onerror;

  return (err?: Error) => {
    // schedule onerror callback
    if (onerror) {
      defer(onerror, err, req);
    }
  };
}
