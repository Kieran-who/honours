import fetch from 'node-fetch';
//retry API function

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchRetry = async (
  url,
  fetchOptions,
  retries,
  retryDelay,
  timeout
) => {
  let attempt = 0;
  let rejectTime = timeout ? timeout : 50000;
  while (attempt < retries) {
    try {
      const response = await Promise.race([
        fetch(url, fetchOptions), // normal fetch request
        new Promise((_, reject) =>
          setTimeout(() => reject('timeout'), rejectTime)
        ), // reject timeout after 50 seconds
      ]);

      if (response.ok) {
        if (response.status === 204) {
          return response;
        } else {
          return response.json();
        }
      } else if (response.status === 404) {
        console.log(`No item found at ${url}`);
        return `fetch error`;
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      attempt++;
      const errorMessage = error.message;
      if (!errorMessage.includes(`429`)) {
        console.log(
          `${errorMessage}, retrying ${url}, attempt number: ${attempt}`
        );
        console.error('Error:', error);
      }
      await delay(retryDelay * attempt);
    }
  }

  console.log(`Too many failed attempts were made to ${url}`);
  //sendErrorAlert(err, url);
  return `fetch error`;
};
