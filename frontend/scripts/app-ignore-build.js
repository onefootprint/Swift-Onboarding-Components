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

// argv is a custom argument we pass on vercel (e.g frontend)
// the second value is a list of directories that should trigger a re-build
const dirArray = process.argv[2] || '';
const dirSet = new Set(dirArray.split(',').map(d => d.trim()));

const hasChanged = (fileNameList, folder) => {
  fileNameList.some(file => file.startsWith(folder));
};

const stepCheck = () => {
  if (process.env.DISABLE_PROD_BUILD === 'true') {
    return abortBuild();
  }
  if (!dirSet.size) {
    return abortBuild();
  }
  const fileNameList = childProcess
    .execSync('git diff --name-only HEAD~1')
    .toString()
    .trim()
    .split('\n');

  // We don't want to build the frontend if only the backend has changed
  const hasBackendChanged = hasChanged(fileNameList, 'backend');
  const hasFrontendChanged = hasChanged(fileNameList, 'frontend');
  if (hasBackendChanged && !hasFrontendChanged) {
    return abortBuild();
  }

  // If a PR was merged to master and we had any frontend changes
  // we'll rebuild all the frontend apps
  if (hasFrontendChanged && process.env.VERCEL_ENV === 'production') {
    return continueBuild();
  }

  // We only want to build the frontend if the frontend packages or the
  // app itself has changed
  const hasAppChanged = fileNameList.some(file =>
    Array.from(dirSet).some(dir => file.startsWith(dir)),
  );
  const hasPackagesChanged = hasChanged(fileNameList, 'frontend/packages');
  const shouldBuild = hasAppChanged || hasPackagesChanged;
  return shouldBuild ? continueBuild() : abortBuild();
};

stepCheck();
