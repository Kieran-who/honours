import fs from 'fs';
export const errorLogger = (errorMessage, errorObject) => {
  const failedDate = new Date().toISOString();
  const stackTrace = errorObject.stack || 'No stack trace available';

  const logMessage = `${failedDate} ${errorMessage}\nCaller Stack Trace:\n${stackTrace}\n\n`;

  fs.appendFileSync('error.log', logMessage);
};
