import dotenv from 'dotenv';
dotenv.config();
import { fetchRetry } from './fetchRetry.js';
import fs from 'fs';

//OpenAI details
const openAIKey = process.env.OPEN_AI_KEY;
const openAIURL = `https://api.openai.com/v1/chat/completions`;

//equiv to google defaults
const chatGPT35EquivParams = {
  temperature: 0.2,
  top_p: 0.8,
};

//OPENAI
//ask chatGPT endpoint specific question
const gptThreeFiveTurboCaller = async (primer, str, params) => {
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${openAIKey}`,
  });
  const nameBody = {
    model: 'gpt-3.5-turbo',
    n: 100,
    temperature: params.temperature,
    top_p: params.top_p,
    max_tokens: 1,
    messages: [
      {
        role: 'system',
        content: primer,
      },
      {
        role: 'system',
        content: str,
      },
    ],
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(nameBody),
    headers: headers,
  };
  let data = await fetchRetry(openAIURL, options, 10, 10000, 30000);

  let returnData = {
    model: data.model,
    choices: data.choices.map((obj) => obj.message.content),
  };
  //console.log(returnData);
  return returnData;
};

export const gptThreeFiveTurbo = async (arr, cnt, samplePerQ, params) => {
  let resCount = cnt ? cnt : 100;
  const startTime = performance.now();
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const formattedDate = `D:${day}M:${month}Y:${year}`;
  const dateString = date.toISOString();
  let obj = {
    sampleCounts: samplePerQ,
    date: formattedDate,
    timeStamp: dateString,
    questions: [],
    elapsedTime: 0,
    params: params,
  };
  for (let i = 0; i < arr.length; i++) {
    obj.questions.push({ Q: arr[i].code, answers: [] });
    let errCount = 0;
    for (let c = 0; c < resCount; c++) {
      let chatResponse = await gptThreeFiveTurboCaller(
        arr[i].primer,
        arr[i].question,
        params
      );
      if (c === 0 && i === 0) {
        obj.model = chatResponse.model;
      }
      for (let r = 0; r < chatResponse.choices.length; r++) {
        if (!Number(chatResponse.choices[r])) {
          errCount++;
          obj.questions[i].errorResponses.push(chatResponse.choices[r]);
        } else {
          obj.questions[i].answers.push(Number(chatResponse.choices[r]));
        }
      }
      //console.log(`${i + 1}: ${c + 1}/${resCount}`);
    }
    obj.questions[i].nonValid = errCount;
    const sum = obj.questions[i].answers.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    });
    const average = sum / obj.questions[i].answers.length;
    obj.questions[i].ave = average;
    obj.questions[i].validCount = obj.questions[i].answers.length;
  }
  const endTime = performance.now(); // Stop measuring the time
  obj.elapsedTime = endTime - startTime;
  const dirPath = `./data/${obj.model}`;
  // save file as JSON obj
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const fileData = dateString.replace(/:/g, '~');
  fs.appendFile(
    `${dirPath}/${obj.model}_${fileData}.json`,
    JSON.stringify(obj),
    (err) => {
      console.log(`Done chatGPT in ${obj.elapsedTime} ms.`);
      if (err) throw err;
    }
  );
};

const gptFourCaller = async (primer, str, params) => {
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${openAIKey}`,
  });
  const nameBody = {
    model: 'gpt-4',
    n: 25,
    temperature: params.temperature,
    top_p: params.top_p,
    max_tokens: 1,
    messages: [
      {
        role: 'system',
        content: primer,
      },
      {
        role: 'system',
        content: str,
      },
    ],
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(nameBody),
    headers: headers,
  };
  let data = await fetchRetry(openAIURL, options, 20, 20000, 60000);
  //console.log(data);
  let returnData = {
    model: data.model,
    choices: data.choices.map((obj) => obj.message.content),
  };
  //console.log(returnData);
  return returnData;
};

export const gptFour = async (arr, cnt, samplePerQ, params) => {
  let resCount = cnt ? cnt : 100;
  const startTime = performance.now();
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const formattedDate = `D:${day}M:${month}Y:${year}`;
  const dateString = date.toISOString();
  let obj = {
    sampleCounts: samplePerQ,
    date: formattedDate,
    timeStamp: dateString,
    questions: [],
    elapsedTime: 0,
    params: params,
  };
  for (let i = 0; i < arr.length; i++) {
    obj.questions.push({ Q: arr[i].code, answers: [] });
    let errCount = 0;
    for (let c = 0; c < resCount * 4; c++) {
      let chatResponse = await gptFourCaller(
        arr[i].primer,
        arr[i].question,
        params
      );
      if (c === 0 && i === 0) {
        obj.model = chatResponse.model;
      }
      for (let r = 0; r < chatResponse.choices.length; r++) {
        if (!Number(chatResponse.choices[r])) {
          errCount++;
          obj.questions[i].errorResponses.push(chatResponse.choices[r]);
        } else {
          obj.questions[i].answers.push(Number(chatResponse.choices[r]));
        }
      }
      //console.log(`${i + 1}: ${c + 1}/${resCount}`);
    }
    obj.questions[i].nonValid = errCount;
    const sum = obj.questions[i].answers.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    });
    const average = sum / obj.questions[i].answers.length;
    obj.questions[i].ave = average;
    obj.questions[i].validCount = obj.questions[i].answers.length;
  }
  const endTime = performance.now(); // Stop measuring the time
  obj.elapsedTime = endTime - startTime;
  const dirPath = `./data/${obj.model}`;
  // Create the directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const fileData = dateString.replace(/:/g, '~');
  fs.appendFile(
    `${dirPath}/${obj.model}_${fileData}.json`,
    JSON.stringify(obj),
    (err) => {
      console.log(`Done chatGPT in ${obj.elapsedTime} ms.`);
      if (err) throw err;
    }
  );
};
