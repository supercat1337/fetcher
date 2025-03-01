// @ts-check

import { Fetcher } from "../../src/index.js";

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
  let fetcher_test_button = document.getElementById("fetcher_test_button");
  if (!fetcher_test_button) {
    throw new Error("Button 'fetcher_test_button' not found");
  }

  let fetcher_test_button_2 = document.getElementById("fetcher_test_button_2");
  if (!fetcher_test_button_2) {
    throw new Error("Button 'fetcher_test_button_2' not found");
  }

  let fetcher_test_button_3 = document.getElementById("fetcher_test_button_3");
  if (!fetcher_test_button_3) {
    throw new Error("Button 'fetcher_test_button_3' not found");
  }

  let cancel_fetcher_button = document.getElementById("cancel_fetcher_button");
  if (!cancel_fetcher_button) {
    throw new Error("Button 'cancel_fetcher_button' not found");
  }
  

  let fetcher = new Fetcher();
  const fetch_1 = fetcher.createFetchFunction({ retryCount: 10, waitTime: 5000 });
  const fetch_2 = fetcher.createFetchFunction({ retryCount: 10, waitTime: 5000 });
  const fetch_3 = fetcher.createFetchFunction({ retryCount: 10, waitTime: 5000 });

  fetcher_test_button.addEventListener("click", async () => {
    try {
      let response = await fetch_1(
        "https://jsonplaceholder.typicode.com/posts/1"
      );
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });

  fetcher_test_button_2.addEventListener("click", async () => {
    try {
      let response = await fetch_2(
        "https://jsonplaceholder.typicode.com/posts/2"
      );
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });

  fetcher_test_button_3.addEventListener("click", async () => {
    try {
      let response = await fetch_3(
        "https://jsonplaceholder.typicode.com/posts/3"
      );
      console.log(response);    
    } catch (e) {
      console.error(e);
    }
  });
 
  cancel_fetcher_button.addEventListener("click", () => {
    fetcher.cancel();
  });
});
