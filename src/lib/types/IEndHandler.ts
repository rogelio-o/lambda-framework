/**
 * Handler called just before the provider callback is called.
 */
type IEndHandler = () => Promise<void>;
export default IEndHandler;
