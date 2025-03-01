// @ts-check

import {
  createRetryFetch,
} from "../../src/index.js";

/**
 * Executes the provided callback function once the DOM is fully loaded.
 * If the DOM is still loading, it waits for the "DOMContentLoaded" event.
 *
 * @param {()=>void} callback - The function to be executed when the DOM is ready.
 */
function DOMReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

DOMReady(() => {
  let retry_test_button = document.getElementById("retry_test_button");
  if (!retry_test_button) {
    throw new Error("Button 'retry_test_button' not found");
  }

  let retry_count_input = /** @type {HTMLInputElement} */ (
    document.getElementById("retry_count_input")
  );
  if (!retry_count_input) {
    throw new Error("Input 'retry_count_input' not found");
  }

  retry_test_button.addEventListener("click", async () => {
    try {
      const count = parseInt(retry_count_input.value);
      const retryFetch = createRetryFetch({
        retryCount: count,
        waitTime: 1000,
      });

      console.log(`Retry count: ${count}`);
      let response = await retryFetch(
        "https://jsonplaceholder.typicode.com/posts/1"
      );

      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });
});
