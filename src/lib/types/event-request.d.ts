import INext from './next'

export default interface IEventRequest {

    readonly event: any

    readonly eventType: string

    next: INext

}
