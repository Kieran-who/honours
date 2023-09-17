import fs from 'fs';
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'json2csv';

// Get the current directory
const dirname = path.dirname(fileURLToPath(import.meta.url));

const inputDirectoryPath = path.resolve(dirname, 'toConvert');
const outputDirectoryPath = path.join(dirname, 'CSV', 'plain2');

// // Ensure the output directory exists
if (!fs.existsSync(outputDirectoryPath)) {
  fs.mkdirSync(outputDirectoryPath, { recursive: true });
}

const groupedData = {};

readdir(inputDirectoryPath)
  .then((files) => {
    const filePromises = files
      .filter((file) => extname(file) === '.json')
      .map((file) =>
        readFile(join(inputDirectoryPath, file), 'utf8').then((data) => {
          const jsonData = JSON.parse(data);
          const groupKey = `${jsonData.model}-${jsonData.questionnaireID}`;
          const questions = jsonData.questions;

          let maxAnswers = 0;
          for (let question of questions) {
            const answerLen = question.answers.length;
            if (answerLen > maxAnswers) {
              maxAnswers = answerLen;
            }
          }

          const csvData = questions.map((question) => {
            let item = { questionID: question.Q };
            for (let i = 0; i < maxAnswers; i++) {
              item[`Answer${i + 1}`] =
                question.answers[i] !== undefined ? question.answers[i] : '';
            }
            return item;
          });

          const fields = [
            'questionID',
            ...Array.from(
              { length: maxAnswers },
              (_, index) => `Answer${index + 1}`
            ),
          ];
          const csv = parse(csvData, { fields });

          return {
            groupKey,
            csv: `\nTemperature: ${jsonData.params.temperature}\n` + csv,
          };
        })
      );

    return Promise.all(filePromises);
  })
  .then((groupedCsvs) => {
    const groups = {};
    for (let group of groupedCsvs) {
      if (!groups[group.groupKey]) {
        groups[group.groupKey] = [];
      }
      groups[group.groupKey].push(group.csv);
    }
    return groups;
  })
  .then((groups) => {
    const writePromises = Object.entries(groups).map(([groupKey, csvs]) => {
      const outputFilePath = join(outputDirectoryPath, `${groupKey}.csv`);
      return writeFile(outputFilePath, csvs.join('\n'));
    });

    return Promise.all(writePromises);
  })
  .then(() => console.log('All CSV files successfully written.'))
  .catch((err) => console.error('An error occurred:', err));

/// for SPSS analysis
const outputDirectoryPathSPSS = path.join(dirname, 'CSV', 'zscore');

// // ensure the output directory exists
// if (!fs.existsSync(outputDirectoryPathSPSS)) {
//   fs.mkdirSync(outputDirectoryPathSPSS, { recursive: true });
// }
// // create a map to hold combined data for each model's attempt at each survey
// let combinedData = {};
// let dataStatistics = {};

// fs.readdirSync(inputDirectoryPath).forEach((file) => {
//   if (path.extname(file) === '.json') {
//     let rawData = fs.readFileSync(path.join(inputDirectoryPath, file));
//     let survey = JSON.parse(rawData);
//     let id = `${survey.model}_${survey.questionnaireID}`;

//     if (!combinedData[id]) {
//       combinedData[id] = [];
//     }

//     if (!dataStatistics[id]) {
//       dataStatistics[id] = {};
//     }

//     survey.questions.forEach((question) => {
//       question.answers.forEach((answer, index) => {
//         let row = combinedData[id].find(
//           (r) => r.Subjects === `${question.Q}_score${index + 1}`
//         );

//         let stat = dataStatistics[id][`${question.Q}_score${index + 1}`];
//         if (!stat) {
//           stat = { sum: 0, count: 0, values: [] };
//           dataStatistics[id][`${question.Q}_score${index + 1}`] = stat;
//         }

//         if (!row) {
//           row = { Subjects: `${question.Q}_score${index + 1}` };
//           combinedData[id].push(row);
//         }

//         row[`Temp_${survey.params.temperature}`] = answer;
//         stat.sum += answer;
//         stat.count++;
//         stat.values.push(answer);
//       });
//     });
//   }
// });

// // Compute mean and standard deviation for each question
// Object.entries(dataStatistics).forEach(([id, stats]) => {
//   Object.values(stats).forEach((stat) => {
//     stat.mean = stat.sum / stat.count;
//     let squaresSum = stat.values.reduce(
//       (sum, value) => sum + Math.pow(value - stat.mean, 2),
//       0
//     );
//     stat.stddev = Math.sqrt(squaresSum / stat.count);
//   });
// });

// // Standardize scores and generate CSV files
// Object.entries(combinedData).forEach(([id, data]) => {
//   let statRows = {};
//   data.forEach((row) => {
//     let stat = dataStatistics[id][row.Subjects];
//     for (let propName in row) {
//       if (propName !== 'Subjects') {
//         let rawScore = row[propName];
//         row[propName + '_Raw'] = rawScore; // keep raw score
//         row[propName] =
//           stat.stddev !== 0 ? (rawScore - stat.mean) / stat.stddev : 0;

//         // Accumulate statistics
//         if (!statRows[propName]) {
//           statRows[propName] = { mean: 0, stdDev: 0, count: 0 };
//         }
//         statRows[propName].mean += row[propName];
//         statRows[propName].stdDev += Math.pow(row[propName] - stat.mean, 2);
//         statRows[propName].count++;
//       }
//     }
//   });

//   // Finalize accumulated statistics and add to the data array
//   for (let propName in statRows) {
//     statRows[propName].mean /= statRows[propName].count;
//     statRows[propName].stdDev = Math.sqrt(
//       statRows[propName].stdDev / statRows[propName].count
//     );
//     data.push({
//       Subjects: 'Mean' + propName,
//       [propName]: statRows[propName].mean,
//     });
//     data.push({
//       Subjects: 'StdDev' + propName,
//       [propName]: statRows[propName].stdDev,
//     });
//   }

//   const csv = parse(data);
//   fs.writeFileSync(`${outputDirectoryPathSPSS}/${id}.csv`, csv);
// });
