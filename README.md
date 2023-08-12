# CODE USED TO TEST THE MORALITY OF AI

This code has been provided to show the programming methodology and parameters
used in measuring the morality of Google and OpenAI's publically available LLM
API endpoints.

See https://transparency-project.ai for more data and information on the
exploration of the morality of Large Language Models.

## TO USE THIS CODE

Download or clone this repository.

You will also need to download a Google access key and familiarise yourself with
Google's cloud platform. OpenAI configuration is a lot simplier and only
requires getting an API key.

You will also need to create a env file (create a file with the name .env)

In this .env file, add the following and update with your own values:

```

## OPEN AI

OPEN_AI_KEY=

## GOOGLE

API_ENDPOINT=
API_KEY=

BISON_CHAT=chat-bison@001
BISON_TEXT=text-bison@001

GOOGLE_APPLICATION_CREDENTIALS=./googl-access-key.json
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

The code is limited with no progress bars to display progress. It will log on
the console when each run is complete. The last console log will likely be
'GOOGLE 6 DONE'.

It takes time to run due to rate limits on the APIs.
