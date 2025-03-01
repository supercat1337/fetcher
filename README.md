# Fetcher
Utility for managing fetch requests with cancellation and retry capabilities.

## Installation

You can install the package via npm:
`npm install @supercat1337/fetcher`

# **createSingletonFetch**

Creates a singleton fetch function based on the given options.

**Parameters**

- `options` - An object containing the following properties:
  - `retryCount` - The maximum number of retry attempts (default: 3).
  - `waitTime` - The time to wait between retry attempts in milliseconds (default: 1000).

**Returns**

A function that can be used to make fetch requests.

**Example**

```javascript
import { createSingletonFetch } from "@supercat1337/fetcher";

const singleton_test_button = document.getElementById("singleton_test_button");

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
```

# **createRetryFetch**

Creates a retry fetch function based on the given options.

**Parameters**

- `options` - An object containing the following properties:
  - `retryCount` - The maximum number of retry attempts (default: 3).
  - `waitTime` - The time to wait between retry attempts in milliseconds (default: 1000).

**Returns**

A function that can be used to make fetch requests.

**Example**

```javascript
import { createRetryFetch } from "@supercat1337/fetcher";

const retry_test_button = document.getElementById("retry_test_button");
const retry_count_input = /** @type {HTMLInputElement} */ (
  document.getElementById("retry_count_input")
);

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
```

# **Fetcher**

A utility class for managing fetch requests with cancellation and retry capabilities.

The `Fetcher` class provides a simple way to make fetch requests with built-in support for cancellation and retry attempts. It allows you to create a singleton fetch function that can be used to make requests to a specific resource, and also provides a method for making one-off fetch requests.

**Key Features**

- Cancellation: Abort ongoing requests and reset the loading state.
- Retry: Configure retry attempts and wait time for failed requests.
- Singleton fetch function: Create a reusable fetch function for a specific resource.
- One-off fetch requests: Make ad-hoc fetch requests with cancellation support.

## **Example**

```javascript
import { Fetcher } from "@supercat1337/fetcher";

const fetcher_test_button = document.getElementById("fetcher_test_button");
const fetcher_test_button_2 = document.getElementById("fetcher_test_button_2");
const fetcher_test_button_3 = document.getElementById("fetcher_test_button_3");
const cancel_fetcher_button = document.getElementById("cancel_fetcher_button");

const fetcher = new Fetcher();
const fetch_1 = fetcher.createFetchFunction({ retryCount: 10, waitTime: 5000 });
const fetch_2 = fetcher.createFetchFunction({ retryCount: 10, waitTime: 5000 });
const fetch_3 = fetcher.createFetchFunction({ retryCount: 10, waitTime: 5000 });

cancel_fetcher_button.addEventListener("click", () => {
  fetcher.cancel();
});

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
```

**License**

This project is licensed under the MIT License. 
