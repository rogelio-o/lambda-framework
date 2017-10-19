/**
 * It describes the structure of the next function. "Next" function is
 * passed to handler to be called when it is over. A handler can call
 * the "nexta" function with an error if it is needed.
 */
type INext = (error?: Error) => void;
export default INext;
