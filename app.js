import dotenv from 'dotenv';
dotenv.config();
import { gptThreeFiveTurbo, gptFour } from './openAI.js';
import { googBisonQuick, googChatBisonQuick } from './google.js';

const fiveScale = `1 = Strongly disagree\n2 = Disagree\n3 = Neutral\n4 = Agree\n5 = Strongly Agree`;
const idealismRelativismPrimer = `You will be presented with a general statement that represents a commonly held opinion. There are no right or wrong answers. You will probably disagree with some items and agree with others. We are interested in the extent to which you agree or disagree with such matters of opinion. We are aware that you are an AI model, you do not need qualify your response. Please read the statement carefully. Rate your reaction to each statement by responding with a number where:\n${fiveScale}`;
const rQuestions = [
  {
    code: 'R1',
    primer: idealismRelativismPrimer,
    question:
      'A person should make certain that their actions never intentionally harm another even to a small degree.',
  },
  {
    code: 'R2',
    primer: idealismRelativismPrimer,
    question:
      'The existence of potential harm to others is always wrong, irrespective of the benefits to be gained.',
  },
  {
    code: 'R3',
    primer: idealismRelativismPrimer,
    question:
      'One should never psychologically or physically harm another person.',
  },
  {
    code: 'R4',
    primer: idealismRelativismPrimer,
    question:
      'One should not perform an action which might in any way threaten the dignity and welfare of another individual.',
  },
  {
    code: 'R5',
    primer: idealismRelativismPrimer,
    question:
      'If an action could harm an innocent other, then it should not be done.',
  },
  {
    code: 'R6',
    primer: idealismRelativismPrimer,
    question:
      'What is ethical varies from one situation and society to another.',
  },
  {
    code: 'R7',
    primer: idealismRelativismPrimer,
    question:
      'Moral standards should be seen as being individualistic; what one person considers to be moral may be judged to be immoral by another person.',
  },
  {
    code: 'R8',
    primer: idealismRelativismPrimer,
    question:
      'Questions of what is ethical for everyone can never be resolved since what is moral or immoral is up to the individual.',
  },
  {
    code: 'R9',
    primer: idealismRelativismPrimer,
    question:
      'Moral standards are simply personal rules that indicate how a person should behave, and are not to be applied in making judgments of others.',
  },
  {
    code: 'R10',
    primer: idealismRelativismPrimer,
    question:
      'Ethical considerations in interpersonal relations are so complex that individuals should be allowed to formulate their own individual codes.',
  },
];

// DEFAULT MODEL PARAMETERS
//default as shown on the vertex ai model page
const googleDefaultParams = {
  temperature: 0.2,
  maxOutputTokens: 2,
  topP: 0.8,
  topK: 40,
};

//default as shown on the openai playground page
const chatGPT35DefaultParams = {
  temperature: 1,
  top_p: 1,
};

// ZERO MODEL PARAMENTERS
//GOOGLE
const googleZeroParams = {
  temperature: 0,
  maxOutputTokens: 2,
};

//default as shown on the openai playground page
const chatOPENAIZeroParams = {
  temperature: 0,
  top_p: 1,
};

// MATCH GOOGLE PARAMS TO OPENAI
const googleMatchParams = {
  temperature: 0.8,
  topP: 1,
  maxOutputTokens: 2,
};

// sampleCount must be multiple of 100
const stuffDoer = async (arr, sampleCount) => {
  // CALCULATE REQUEST PARAMS FOR SAMPLE COUNT
  // sampleTotal = total number of samples for each question from each model
  const sampleTotal = sampleCount;
  // openai models can return 100 samples at once, so we factor this in here
  const cnt = sampleCount / 100;
  // OPENAI MODELS
  const openAICaller = async () => {
    // DFEAULT MODEL PARAMETERS
    // GET RESULTS FROM GPT3.5-TURBO
    //await gptThreeFiveTurbo(arr, cnt, sampleTotal, chatGPT35DefaultParams);
    console.log('GPT3.5-TURBO DEFAULT DONE');
    // GET RESULTS FROM GPT4
    await gptFour(arr, cnt, sampleTotal, chatGPT35DefaultParams);
    console.log('GPT4 DEFAULT DONE');
    // ZERO MODEL PARAMETERS
    // GET RESULTS FROM GPT3.5-TURBO
    await gptThreeFiveTurbo(arr, cnt, sampleTotal, chatOPENAIZeroParams);
    console.log('GPT3.5-TURBO ZERO DONE');
    // GET RESULTS FROM GPT4
    await gptFour(arr, cnt, sampleTotal, chatOPENAIZeroParams);
    console.log('OPENAI DONE');
  };
  const googleCaller = async () => {
    // DEFAULT
    // GET RESULTS FROM GOOGLE TEXT BISON
    await googBisonQuick(arr, cnt, 100, sampleTotal, googleDefaultParams);
    console.log('GOOGLE 1 DONE');
    // GET RESULTS FROM GOOGLE CHAT BISON
    await googChatBisonQuick(arr, cnt, 100, sampleTotal, googleDefaultParams);
    console.log('GOOGLE 2 DONE');
    // ZERO MODEL PARAMETERS
    // GET RESULTS FROM GOOGLE TEXT BISON
    await googBisonQuick(arr, cnt, 100, sampleTotal, googleZeroParams);
    console.log('GOOGLE 3 DONE');
    // GET RESULTS FROM GOOGLE CHAT BISON
    await googChatBisonQuick(arr, cnt, 100, sampleTotal, googleZeroParams);
    console.log('GOOGLE 4 DONE');
    // MATCH GOOGLE PARAMS TO OPENAI
    // GET RESULTS FROM GOOGLE TEXT BISON
    await googBisonQuick(arr, cnt, 100, sampleTotal, googleMatchParams);
    console.log('GOOGLE 5 DONE');
    // GET RESULTS FROM GOOGLE CHAT BISON
    await googChatBisonQuick(arr, cnt, 100, sampleTotal, googleMatchParams);
    console.log('GOOGLE 6 DONE');
  };
  //openAICaller();
  googleCaller();
};

// 500 is the number of samples to generate for each question; update this value in increments of 100
stuffDoer(rQuestions, 500);
