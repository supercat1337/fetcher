export const FETCH_REQUEST_ABORTED: "Fetch request aborted";
export class Fetcher {
    /**
     * Aborts the currently running request and resets the loading state.
     * If no request is running, this is a no-op.
     */
    cancel(): void;
    /**
     * Creates a singleton fetch function based on the given options.
     * @param {Object} [options] - Additional options.
     * @param {number} [options.retryCount] - The number of retry attempts if the request fails.
     *                                          Default is 1.
     * @param {number} [options.waitTime] - The time to wait between retry attempts in milliseconds.
     *                                        Default is 1000.
     * @returns {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} A function that takes a resource and options as parameters
     * @throws {Error} If the request fails after exhausting all retry attempts.
     */
    createFetchFunction(options?: {
        retryCount?: number;
        waitTime?: number;
    }): (resource: RequestInfo | URL, options?: RequestInit) => Promise<Response>;
    /**
     * Sends a request to the specified resource using the Fetch API with the given options.
     * This function will abort the request when the cancel event is emitted on the Fetcher instance.
     * @param {RequestInfo | URL} resource - The resource to request.
     * @param {RequestInit} [options] - Additional options for the fetch request.
     * @returns {Promise<Response>} A promise that resolves with the response of the fetch request.
     */
    fetch(resource: RequestInfo | URL, options?: RequestInit): Promise<Response>;
    #private;
}
export class SingletonFetcher {
    /**
     * Creates a new instance of the SingletonFetcher class.
     *
     * @param {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} [customFetch] - A custom fetch function to use for requests.
     *                                            If not provided, the default fetch function is used.
     * @constructor
     */
    constructor(customFetch?: (resource: RequestInfo | URL, options?: RequestInit) => Promise<Response>);
    controller: AbortController;
    is_loading: boolean;
    /**
     * Sends a request to the specified resource using the Fetch API with the given options.
     * If a request is already in progress, it aborts the existing request before starting a new one.
     *
     * The function creates a new AbortController for each request and combines it with any
     * provided abort signals. It manages the loading state to ensure only one request is processed
     * at a time.
     *
     * @param {RequestInfo | URL} resource - The resource to request.
     * @param {RequestInit} [options] - Additional options for the fetch request.
     * @returns {Promise<Response>} A promise that resolves with the response of the fetch request.
     */
    fetch(resource: RequestInfo | URL, options?: RequestInit): Promise<Response>;
    /**
     * Aborts the currently running request and resets the loading state.
     * If no request is running, this is a no-op.
     */
    cancel(): void;
    #private;
}
/**
 * Creates a fetch function that retries the request a specified number of times
 * if it fails. The function will return the response if successful, or it will
 * throw an error after exhausting all retry attempts.
 *
 * @param {Object} [options] - Additional options.
 * @param {number} [options.retryCount=3] - The number of retry attempts.
 * @param {number} [options.waitTime=1000] - The time to wait between retry attempts in milliseconds.
 * @param {import("@supercat1337/event-emitter").EventEmitter<"cancel">} [options.eventEmitter] - An event emitter that emits a "cancel" event when the retry fetch should be cancelled.
 * @param {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} [options.customFetch] - A custom fetch function.
 * @returns {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} A function that takes a resource and options as parameters
 *                     and returns a Promise resolving to a Response.
 * @throws {Error} If all retry attempts fail.
 */
export function createRetryFetch(options?: {
    retryCount?: number;
    waitTime?: number;
    eventEmitter?: import("@supercat1337/event-emitter").EventEmitter<"cancel">;
    customFetch?: (resource: RequestInfo | URL, options?: RequestInit) => Promise<Response>;
}): (resource: RequestInfo | URL, options?: RequestInit) => Promise<Response>;
/**
 * Returns singleton version of function fetch
 * @param {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} [customFetch] - A custom fetch function to use for requests.
 *                                            If not provided, the default fetch function is used.
 * @returns
 */
export function createSingletonFetch(customFetch?: (resource: RequestInfo | URL, options?: RequestInit) => Promise<Response>): (resource: RequestInfo | URL, options?: RequestInit) => Promise<Response>;
//# sourceMappingURL=fetcher.esm.d.ts.map