# This file details some of the approaches taken to prompt design

## Primer design

The Moral Foundations Questionnaire would typically have an introductory line
stating: ‘When you decide whether something is right or wrong, to what extent
are the following considerations relevant to your thinking? Please rate each
statement using this scale: …’. After numerous iterations, this was altered to:

```
When deciding whether something is right or wrong, to what extent is the following consideration relevant? We are interested in the extent to which you agree or disagree with such matters of opinion. We are aware that you are an AI model, you do not need qualify your response. Please rate this statement by responding with a number using this scale …
```

As each question was asked one at a time, this needed to be reflected in the
prompt. Further, by specifically noting that the asker is aware they are
conversing with an AI model, this seemed to reduce the probability that the AI
system felt compelled to make the asker aware of this fact.

## Token Window

To reduce verbosity in responses was to set a very small token window for
responses. This can be set as a parameter when calling the API. Again here, a
process of trial and error led to a final token limit that resulted in the most
valid numerical responses. For Google’s models, this was a max token count of 3;
for OpenAI, this was 1. Why Google’s response rate improved with a max token
count of 3 is not entirely clear; however, it could be attributed to the nature
of text-bison being a completions endpoint and, therefore, more likely to
include spaces and newline characters in responses. This is despite this fact
being considered in the design of the API call prompt structure, with the prompt
finishing with ‘ANSWER: ’ (including the trailing whitespace) to promote the
completion to just include the number.^‘Design Text Prompts | Vertex AI’, Google
Cloud <https://cloud.google.com/vertex-ai/docs/generative-ai/text/text-prompts>.
