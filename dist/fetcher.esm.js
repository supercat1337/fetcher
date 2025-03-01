import { EventEmitter } from '@supercat1337/event-emitter';

// @ts-check

const FETCH_REQUEST_ABORTED = "Fetch request aborted";

// @ts-check


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
function createRetryFetch(options = {}) {
  const retryCount = options.retryCount || 3;
  const waitTime = options.waitTime || 1000;
  const eventEmitter = options.eventEmitter || new EventEmitter();
  const _fetch = options.customFetch || fetch;

  if (retryCount < 1) {
    throw new Error("Retry count must be greater than 0.");
  }

  /** @type {EventEmitter<"cancel">} */
  const _eventEmitter = eventEmitter || new EventEmitter();

  /** @type {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} */
  const f = async (resource, options) => {
    for (let i = 0; i < retryCount; i++) {
      try {
        let response = await _fetch(resource, options);
        return response;
      } catch (e) {
        //console.error(e);

        if (e.name == FETCH_REQUEST_ABORTED) {
          throw e;
        }

        if (i === retryCount - 1) {
          throw e;
        }

        await _eventEmitter.waitForEvent("cancel", waitTime);
      }
    }

    throw new Error("All retry attempts failed.");
  };

  return f;
}

// @ts-check


class SingletonFetcher {
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
function createSingletonFetch(customFetch) {
  const singletonFetcher = new SingletonFetcher(customFetch);

  /** @type {(resource: RequestInfo | URL, options?: RequestInit)=> Promise<Response>} */
  const f = async (resource, options) => {
    let response = await singletonFetcher.fetch(resource, options);
    return response;
  };

  return f;
}

// @ts-check


class Fetcher {
  /** @type {EventEmitter<"cancel">} */
  #eventEmitter = new EventEmitter();

  /**
   * Aborts the currently running request and resets the loading state.
   * If no request is running, this is a no-op.
   */
  cancel() {
    this.#eventEmitter.emit("cancel");
    this.#eventEmitter.waitForEvent;
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
    };

    return _fetch(
      resource,
      Object.assign({}, options, { signal: combinedSignal })
    );
  }
}

export { FETCH_REQUEST_ABORTED, Fetcher, SingletonFetcher, createRetryFetch, createSingletonFetch };
