# CODE USED TO TEST THE MORALITY OF AI

This code has been provided to show the programming methodology and parameters
used in measuring the morality of Google and OpenAI's publically available LLM
API endpoints.

### How this program works (briefly)

The API endpoints of popular foundational generative AI models are asked a range
of questions designed to measure some aspect of morality.

The questions and format are kept as close to the original questionnaires as
possible; however, some tweaking of the "primer" is done to improve the response
rate - this is kept consistent across all models.

For each model, this code generates a large sample of responses so as to
calculate how consistent models are in their responses.

There are many different factors that influence the randomness of AI responses
when using the API. The most obvious is the temperature parameter. Temperature
is one of a few different sampling parameters which influence the randomness of
generated content. To factor this in, each API endpoint is asked the same
questions at different temperature levels to include a spread from 0 to 0.8 (the
largest default temperature value as noted by OpenAI's documentation).

## TO USE THIS CODE

Download or clone this repository.

You will also need to download a Google access key and familiarise yourself with
Google's cloud platform, the Vertext AI portal within Google Cloud, and how to
make API calls (and where to find the correct values for each item below - hint:
ask Bard for step-by-step instructions). OpenAI configuration is a lot simpler
and only requires getting an API key.

You will also need to create an env file (create a file with the name .env)

In this .env file, add the following and update with your own values:

```

## OPEN AI

OPEN_AI_KEY=

## GOOGLE

API_ENDPOINT=
API_KEY=

BISON_CHAT=chat-bison@001
BISON_TEXT=text-bison@001

GOOGLE_APPLICATION_CREDENTIALS=./googl-access-key.json (or update with the file path to your Google access key)
PROJECT_ID=

```

### Once your values have been added, ensure you have node.js installed on your machine, open the terminal, ensure you are in the project folder and run:

```
npm install
```

Then run:

```
node app.js
```

The code is limited, with simple progress bars to display progress.

It takes time to run due to rate limits on the APIs.

Files are saved in JSON format. If needed, these files can be converted to csv
(and opened and then saved in Excel) using a site such as this:
https://www.convertcsv.com/json-to-csv.htm
