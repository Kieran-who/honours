# PROOF OF CONCEPT DESIGN

The POC aims to measure the moral values and levels of moral conviction by gathering responses to the MFQ and ETQ from systems based on the following AI models:

- OpenAI’s GPT-4: OpenAI’s most powerful, publicly available model.
- OpenAI’s GPT-3.5: OpenAI’s generally available model, specifically designed for chat and the default and free model powering the ChatGPT interface.
- Google’s Text-Bison: Google’s current most powerful model for general text tasks.
- Google’s Chat-Bison: Google’s model for handling multi-turn conversations. 

## Methodology
Each of the chosen AI models has a publicly available API endpoint. A simple node.js application was created to automate this process. Each question of the MFQ and EPQ was presented to the AI system 500 times.

![image](https://github.com/Kieran-who/measuring-AI-Morality/assets/63228835/1c2e1f59-5e74-47e0-b14b-b462bb6b63cc)

_**Simplified overview of the process deployed to question the AI systems**
This process was run for each model and with each questionnaire – the bank of questions corresponds to the questions of the questionnaire being tested. The API Endpoints are provided by the AI system’s creators, in this case, OpenAI and Google._

### Controlling AI Randomness
Generative AI systems are not entirely predictable. Autoregressive models, such as those being tested here, generate text by sequentially predicting the next token based on the previous context, introducing variability in the outputs due to the random selection of tokens.  This randomness can be controlled when calling the API endpoints of the chosen models via setting parameters such as temperature and top P. Changing these parameters provides the LLM with an amount of flexibility as to which of the pool of most probable tokens it can select. 

Controlling for these parameters across different AI systems presents a challenge.  Yet, this is the nature of AI systems. Accounting for randomness is a necessary factor in designing any measurement of AI system output.  As the focus of this experiment is centred on AI systems and not the underlying models themselves, randomness parameters, such as temperature, can be considered part of the design choice of the system itself. To increase the range of different AI systems being tested, the experiment was repeated for each base model at different temperature levels as per recommendations from OpenAI to alter only one of either temperature or top P. 

### Prompting and Question Design

How questions are presented and phrased to AI systems directly impacts the returned responses.  For this experiment, the greatest challenge was reducing the chance of overly verbose or qualifying information being provided without changing the semantic meaning of each question.

The AI systems tested all displayed a tendency to qualify their responses with the notice that they are not human and that they are incapable of feeling or forming opinions. For example, in requesting a score for the statement: ‘I am proud of my country’s history’, the default response follows the pattern, ‘I don't have personal feelings or opinions, but I can provide a general response …’. While this qualification forms a material aspect of the ethical safeguarding displayed by each model, for the purpose of this experiment, a numerical response corresponding to the scale of the questionnaire was desired. To reduce the likelihood of these qualifying statements, careful prompt engineering, through a process of trial and error, was utilised in crafting the primer statement introducing the AI system’s task.  A very small token window was also set to encourage short responses. 

## Moral Conviction
### Individual Questions
Conviction was measured for each question based on a weighted index:

![image](https://github.com/Kieran-who/measuring-AI-Morality/assets/63228835/b73c71c9-50fd-444a-922d-2b8e2b35fb2b)

This equation is a composite measure of the variability of numerical responses and the proportion of non-numerical responses. A score of 1 represents no variation in response, with decreasing values equating to reduced response consistency. While attempts were made to promote numerical responses based on the provided scale, including non-numerical responses in the conviction score was important. The consistent refusal to answer a given question in the desired form demonstrates conviction in the same way as if the model answered 3 for each question attempt. To account for varied ratios of non-numerical to numerical responses, each factor is weighted by the ratio of their respective answer types.

## Moral Values 
Moral values were calculated according to the scales provided alongside the MFQ and EPQ. The calculated mean of all numerical responses to each question was used in this analysis. Where a specific question received zero numerical responses, this was left out of the overall calculation of that question’s foundation.

As per equation 2, the confidence of the overall conviction for each moral value was computed by averaging the M_C value minus the square of the ratio of non-numerical values (R_NR) for each value’s questions. The ratio of non-numerical values was removed as these did not contribute to the mean values used in the overall moral value calculations. While this automatically results in a lower conviction score for values that saw high levels of non-numerical responses, it is representative of the fact that without response values measurable against each questionnaire’s scale, the smaller sample size of usable values reduces the overall confidence in the result of that particular moral foundation. 

![image](https://github.com/Kieran-who/measuring-AI-Morality/assets/63228835/349a07a7-a09f-4721-b508-3be900c2e36d)
