import fetch from 'node-fetch';
import { errorLogger } from './errorLogger.js';
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
      } else if (response.status === 401) {
        return `update google token`;
      } else if (response.status === 429) {
        throw new Error(`429`);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      attempt++;
      const errorMessage = error.message;
      // 429 will be returned frequently as rate limits hit, no need to console log
      if (errorMessage !== `429`) {
        errorLogger(`fetchRetry error: ${errorMessage}`, error);
      }
      await delay(retryDelay * attempt);
    }
  }
  throw new Error(`Too many failed attempts were made to ${url}`);
};
