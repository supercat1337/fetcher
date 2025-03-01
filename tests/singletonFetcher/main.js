// @ts-check

import { createSingletonFetch } from "../../src/index.js";

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
  let singleton_test_button = document.getElementById("singleton_test_button");
  if (!singleton_test_button) {
    throw new Error("Button 'singleton_test_button' not found");
  }

  const singletonFetch = createSingletonFetch();

  singleton_test_button.addEventListener("click", async () => {
    try {
      let response = await singletonFetch(
        "https://jsonplaceholder.typicode.com/posts/1"
      );
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });

});
