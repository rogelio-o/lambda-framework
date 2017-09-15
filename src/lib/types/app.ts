export default interface IApp {

    /**
     * Initialize the framework with the configuration of `settings`. If
     * no `settings`are given, the framework is initialized with the
     * default configuration.
     *
     * @param {object} settings
     */
    init(settings?: object): void

    /**
     * Set to _true_ the configuration param `key`.
     *
     * @param {string} key
     */
    enable(key: string): void

    /**
     * Set to _false_ the configuration param `key`.
     * @param {string} key
     */
    disable(key: string): void

    /**
     * Set to `value` the configuration param `key`.
     *
     * @param {string} key
     * @param {any}    value
     */
    set(key: string, value: any): void

    /**
     * Return the value of the configuration param `key`.
     *
     * @param  {string} key
     * @return {any}
     */
    get(key: string): any
    
}
