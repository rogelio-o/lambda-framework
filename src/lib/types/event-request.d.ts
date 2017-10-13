import INext from './next'

export default interface IEventRequest {

    readonly event: any

    readonly eventType: string

    next: INext

    /**
     * Context to save thins and use it
     * in other handlers.
     */
    readonly context: { [name: string]: any }

}
