import fs from 'fs';
import { readdir, readFile, writeFile } from 'fs/promises';
import fsPromises from 'fs/promises';
import path from 'path';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'json2csv';

// Get the current directory
const dirname = path.dirname(fileURLToPath(import.meta.url));

const wideFormat = async (pathOfData) => {
  const inputDirectoryPath = pathOfData;
  const outputDirectoryPath = path.join(dirname, 'data', 'CSV', 'wide');

  // Ensure the output directory exists
  fs.existsSync(outputDirectoryPath) ||
    fs.mkdirSync(outputDirectoryPath, { recursive: true });

  try {
    const files = await readdir(inputDirectoryPath);
    const filePromises = files
      .filter((file) => extname(file) === '.json')
      .map(async (file) => {
        const data = await readFile(join(inputDirectoryPath, file), 'utf8');
        let processedFile = processFile(data);
        return processedFile; // We don't need to sort here
      });

    const groupedCsvs = await Promise.all(filePromises);
    const groups = groupCsvs(groupedCsvs);
    await writeCsvs(groups, outputDirectoryPath);
  } catch (err) {
    console.error('An error occurred:', err);
  }
};

const processFile = (data) => {
  const jsonData = JSON.parse(data);
  const groupKey = `${jsonData.model}-${jsonData.questionnaireID}`;
  const questions = jsonData.questions;

  const maxAnswers = questions.reduce(function (max, question) {
    return Math.max(max, question.answers.length);
  }, 0);

  let csvData = questions.map((question) => {
    let item = { questionID: question.Q };
    for (let i = 0; i < maxAnswers; i++) {
      item[`Answer${i + 1}`] =
        question.answers[i] !== undefined ? question.answers[i] : '';
    }
    return item;
  });

  // Sort questions by questionID in ascending order
  csvData = csvData.sort((a, b) => {
    return a.questionID.localeCompare(b.questionID);
  });

  const fields = [
    'questionID',
    ...Array.from({ length: maxAnswers }, (_, index) => `Answer${index + 1}`),
  ];
  const csv = parse(csvData, { fields });

  return {
    groupKey,
    csv: `\nTemperature: ${jsonData.params.temperature}\n` + csv,
  };
};

const groupCsvs = (groupedCsvs) => {
  const groups = {};
  for (let group of groupedCsvs) {
    if (!groups[group.groupKey]) {
      groups[group.groupKey] = [];
    }
    groups[group.groupKey].push(group.csv);
  }
  return groups;
};

const writeCsvs = (groups, outputDirectoryPath) => {
  const writePromises = Object.entries(groups).map(([groupKey, csvs]) => {
    const outputFilePath = join(outputDirectoryPath, `${groupKey}.csv`);
    return writeFile(outputFilePath, csvs.join('\n'));
  });

  return Promise.all(writePromises);
};

const longFormat = async (pathOfData) => {
  const outputDirectoryPath = path.join(dirname, 'data', 'CSV', 'long');
  const inputDirectoryPath = pathOfData;

  // ensure the output directory exists
  if (!fs.existsSync(outputDirectoryPath)) {
    fs.mkdirSync(outputDirectoryPath, { recursive: true });
  }

  // a map to hold combined data for each model's attempt at each survey
  let combinedSurveyData = {};

  const surveyIdentifierDataList = []; // List to sort survey identifiers

  fs.readdirSync(inputDirectoryPath)
    .filter((file) => path.extname(file) === '.json') // filter .json files
    .forEach((file) => {
      let rawData = fs.readFileSync(path.join(inputDirectoryPath, file));
      let survey = JSON.parse(rawData);
      let surveyIdentifier = `${survey.model}_${survey.questionnaireID}`;

      if (!combinedSurveyData[surveyIdentifier]) {
        combinedSurveyData[surveyIdentifier] = [];
        surveyIdentifierDataList.push({
          id: surveyIdentifier,
          data: combinedSurveyData[surveyIdentifier],
        }); // Add surveyIdentifier to list
      }

      survey.questions.sort((a, b) => a.Q.localeCompare(b.Q)); // Sort questions in ascending order

      survey.questions.forEach((question) => {
        question.answers.forEach((answer, index) => {
          let dataRow = combinedSurveyData[surveyIdentifier].find(
            (r) => r.Subjects === `${question.Q}_score${index + 1}`
          );

          if (!dataRow) {
            dataRow = { Subjects: `${question.Q}_score${index + 1}` };
            combinedSurveyData[surveyIdentifier].push(dataRow);
          }

          dataRow[`Temp_${survey.params.temperature}_Score`] =
            answer !== undefined ? answer : '';
        });
      });
    });

  // Sort surveyIdentifierDataList by id for ordered CSV generation
  surveyIdentifierDataList.sort((a, b) => a.id.localeCompare(b.id));

  // Generate CSV files
  surveyIdentifierDataList.forEach(({ id, data }) => {
    const csv = parse(data);
    fs.writeFileSync(`${outputDirectoryPath}/${id}.csv`, csv);
  });
};

const getDirectoriesWithJson = async (dirPath) => {
  const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((dir) => path.join(dirPath, dir.name));

  const jsonDirs = (await Promise.all(dirs.map(getDirectoriesWithJson))).flat();

  const files = entries.filter((entry) => entry.isFile());

  // Check if any of the files in this directory is a '.json' file
  if (files.find((file) => path.extname(file.name) === '.json')) {
    return [...jsonDirs, dirPath]; // include this directory if contains json file
  } else {
    return jsonDirs; // else just return directories found in subdirectories
  }
};

export const jsonToCSV = async (dataPath) => {
  // Get all subdirectories with JSON files
  const directories = await getDirectoriesWithJson(dataPath);

  for (let dir of directories) {
    await longFormat(dir);
    await wideFormat(dir);
  }
};
