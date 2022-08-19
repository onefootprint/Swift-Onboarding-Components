const path = require('path');
const childProcess = require('child_process');

// https://vercel.com/support/articles/how-do-i-use-the-ignored-build-step-field-on-vercel
const ABORT_BUILD_CODE = 0;
const CONTINUE_BUILD_CODE = 1;

const continueBuild = () => {
  process.exit(CONTINUE_BUILD_CODE);
};

const abortBuild = () => {
  process.exit(ABORT_BUILD_CODE);
};

const stepCheck = () => {
  // get all file names changed in last commit
  const fileNameList = childProcess
    .execSync('git diff --name-only HEAD~1')
    .toString()
    .trim()
    .split('\n');
  const shouldBuild = fileNameList.some(file =>
    file.startsWith('frontend/packages'),
  );
  return shouldBuild ? continueBuild() : abortBuild();
};

stepCheck();
