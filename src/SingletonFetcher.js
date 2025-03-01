// @ts-check

import { FETCH_REQUEST_ABORTED } from "./common.js";

export class SingletonFetcher {
  /** @type {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} */
  #fetch;

  /**
   * Creates a new instance of the SingletonFetcher class.
   *
   * @param {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} [customFetch] - A custom fetch function to use for requests.
   *                                            If not provided, the default fetch function is used.
   * @constructor
   */
  constructor(customFetch) {
    /** @type {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} */
    this.#fetch = customFetch
      ? customFetch.bind(globalThis)
      : fetch.bind(globalThis);

    this.controller = new AbortController();
    this.is_loading = false;
  }

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
  async fetch(resource, options = {}) {
    if (this.is_loading) {
      this.cancel();
    }

    this.controller = new AbortController();

    /** @type {AbortSignal[]} */
    let signals = [this.controller.signal];
    if (options && options.signal) {
      signals.push(options.signal);
    }

    const combinedSignal = AbortSignal.any(signals);
    const _options = Object.assign({}, options, { signal: combinedSignal });
    this.is_loading = true;

    let response = await this.#fetch(resource, _options);
    return response;
  }

  /**
   * Aborts the currently running request and resets the loading state.
   * If no request is running, this is a no-op.
   */
  cancel() {
    this.controller.abort(FETCH_REQUEST_ABORTED);
    this.is_loading = false;
  }
}

/**
 * Returns singleton version of function fetch
 * @param {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} [customFetch] - A custom fetch function to use for requests.
 *                                            If not provided, the default fetch function is used.
 * @returns
 */
export function createSingletonFetch(customFetch) {
  const singletonFetcher = new SingletonFetcher(customFetch);

  /** @type {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} */
  const f = async (resource, options) => {
    let response = await singletonFetcher.fetch(resource, options);
    return response;
  }

  return f;
}
