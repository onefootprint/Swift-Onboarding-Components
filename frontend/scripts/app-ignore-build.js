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

const stepCheck = () => {
  if (process.env.VERCEL_ENV === 'production') {
    return continueBuild();
  }

  if (!dirSet.size) {
    return abortBuild();
  }
  const fileNameList = childProcess
    .execSync('git diff --name-only HEAD..origin/master')
    .toString()
    .trim()
    .split('\n');

  // Changes to any files in this app should trigger re-building
  const hasChangedApp = fileNameList.some(file =>
    Array.from(dirSet).some(dir => file.startsWith(dir)),
  );
  // Changes to packages (ui components, types, hooks, etc.) should trigger building all apps
  const hasChangedPackages = fileNameList.some(file =>
    file.startsWith('frontend/packages'),
  );
  const shouldBuild = hasChangedApp || hasChangedPackages;
  return shouldBuild ? continueBuild() : abortBuild();
};

stepCheck();
