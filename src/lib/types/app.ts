export default interface IApp {
    init(settings?: object): void
    enable(key: string): void
    disable(key: string): void
    set(key: string, value: any): void
    get(key: string): any
}
