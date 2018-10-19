import IEndHandler from "../types/IEndHandler";
import IEventRequest from "./../types/event/IEventRequest";
import INext from "./../types/INext";
import IRawCallback from "./../types/IRawCallback";

/**
 * The final handler to be executed if no previous handler has stopped
 * the router execution.
 * @param  {IEventRequest}           req     the incoming request which start
 *                                           the exec.
 * @param  {[name: string]: any}    options the options of the final handler.
 * @return {[INext]}
 */
export default function eventFinalHandler(req: IEventRequest, callback: IRawCallback, options: {[name: string]: any}): INext {
  const opts = options || {};

  // get error callback
  const onerror = opts.onerror;

  return (err?: Error) => {
    const endHandlers: IEndHandler[] = opts.endHandlers || [];

    // schedule onerror callback
    if (onerror) {
      setImmediate(() => onerror(err, req));
    }

    Promise.all(endHandlers.map((f) => f())).then(() => {
      if (callback) {
        callback.finalize(err);
      }
    });
  };
}
