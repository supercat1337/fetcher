// @ts-check

import { EventEmitter } from "@supercat1337/event-emitter";
import { FETCH_REQUEST_ABORTED } from "./common.js";

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
export function createRetryFetch(options = {}) {
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

        eventEmitter;

        await _eventEmitter.waitForEvent("cancel", waitTime);
      }
    }

    throw new Error("All retry attempts failed.");
  };

  return f;
}
