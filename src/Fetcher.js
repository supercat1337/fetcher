// @ts-check

import { createRetryFetch } from "./retryFetch.js";
import { SingletonFetcher } from "./SingletonFetcher.js";
import { EventEmitter } from "@supercat1337/event-emitter";

export class Fetcher {
  /** @type {EventEmitter<"cancel">} */
  #eventEmitter = new EventEmitter();

  /**
   * Aborts the currently running request and resets the loading state.
   * If no request is running, this is a no-op.
   */
  cancel() {
    this.#eventEmitter.emit("cancel");
    this.#eventEmitter.waitForEvent
  }

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
  createFetchFunction(options) {
    const _options = Object.assign(
      { singleton: true, retryCount: 1, waitTime: 1000 },
      options
    );

    /** @type {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} */
    let f = createRetryFetch({ ..._options, eventEmitter: this.#eventEmitter });

    let singletonFetcher = new SingletonFetcher(f);

    this.#eventEmitter.on("cancel", () => {
      singletonFetcher.cancel();
    });

    /**
     * @param {RequestInfo | URL} resource - The resource to request.
     * @param {RequestInit} [options] - Additional options for the fetch request.
     * @returns {Promise<Response>} A promise that resolves with the response of the fetch request.
     */
    const _f = (resource, options) => {
      return singletonFetcher.fetch(resource, options);
    };

    return _f;
  }

  /**
   * Sends a request to the specified resource using the Fetch API with the given options.
   * This function will abort the request when the cancel event is emitted on the Fetcher instance.
   * @param {RequestInfo | URL} resource - The resource to request.
   * @param {RequestInit} [options] - Additional options for the fetch request.
   * @returns {Promise<Response>} A promise that resolves with the response of the fetch request.
   */
  fetch(resource, options) {
    let abortController = new AbortController();
    let signals = [abortController.signal];

    if (options && options.signal) {
      signals.push(options.signal);
    }

    const combinedSignal = AbortSignal.any(signals);

    let unsubscriber = this.#eventEmitter.once("cancel", () => {
      abortController.abort();
    });

    /**
     * @param {RequestInfo | URL} resource - The resource to request.
     * @param {RequestInit} [options] - Additional options for the fetch request.
     * @returns {Promise<Response>} A promise that resolves with the response of the fetch request.
     * @private
     */
    const _fetch = async (resource, options) => {
      try {
        let response = await fetch(resource, options);
        unsubscriber();
        abortController = null;

        return response;
      } catch (error) {
        unsubscriber();
        abortController = null;

        throw error;      
      }
    }

    return _fetch(
      resource,
      Object.assign({}, options, { signal: combinedSignal })
    );
  }
}
