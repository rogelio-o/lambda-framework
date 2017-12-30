import INext from "./../INext";

/**
 * It represents an incoming event.
 */
export default interface IEventRequest {

    readonly event: any;

    readonly eventType: string;

    next: INext;

    processed: boolean;

    /**
     * Context to save thins and use it
     * in other handlers.
     */
    readonly context: { [name: string]: any };

}
