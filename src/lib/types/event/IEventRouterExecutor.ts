/**
 * This class execute all the layers for an incoming event.
 */
export default interface IEventRouterExecutor {

  next(error?: Error): void;

}
