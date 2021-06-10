/**
* To generate hermes bytecode bundle-
*
* 1. Generate common JS bundle
* 2. Generate business JS bundle
* 3. Convert common JS bundle to bytecode using hermesvm
* 4. Convert business JS bundle to bytecode using hermesvm
*/

const { exec, spawn } = require('child_process');

const OS_BIN = 'linux64-bin'; // change if using MAC/WIN
const HERMES_PATH = `./node_modules/hermes-engine/${OS_BIN}/hermesc`;

const COMMON_BUNDLE_PATH = '../app/src/main/assets/common.android.bundle';
const COMMON_BUNDLE_BINARY_PATH = '../app/src/main/assets/common.android.hermes.bundle';
const BUSINESS_BUNDLE_PATH = '../app/src/main/assets/business.android.bundle';
const BUSINESS_BUNDLE_BINARY_PATH = '../app/src/main/assets/business.android.hermes.bundle';


// for long running-process
const spawnCommand = (cmd, arg, callback) => {
  console.log(`executing command: ${cmd} ${arg}`);
  const exec = spawn(cmd, [arg]);
  exec.stdout.on('data', function (data) {
    console.log(data.toString());
  });
  exec.stderr.on('data', function (data) {
    console.error(data.toString());
  });
  exec.on('close', code => {
    console.log(`child process exited with code ${code}`);
    callback();
  });
};

// for short processes
const execCommand = (cmd, callback) => {
  console.log(`executing command ${cmd}`);
  exec(cmd, callback);
};

const generateCommonJsBundle = () => {
  return new Promise((resolve, reject) => {
    const arg = `common-js-bundle`;
    spawnCommand('yarn', arg, () => {
      resolve();
    });
  });
};

const generateBusinessJsBundle = () => {
  return new Promise((resolve, reject) => {
    const arg = `business-js-bundle`;
    spawnCommand('yarn', arg, () => {
      resolve();
    });
  });
};

const generateCommonHermesBundle = () => {
  return new Promise((resolve, reject) => {
    const cmd = `${HERMES_PATH} ${COMMON_BUNDLE_PATH} -emit-binary -out ${COMMON_BUNDLE_BINARY_PATH}`;
    execCommand(cmd, () => {
      resolve();
    });
  });
};

const generateBusinessHermesBundle = () => {
  return new Promise((resolve, reject) => {
    const cmd = `${HERMES_PATH} ${BUSINESS_BUNDLE_PATH} -emit-binary -out ${BUSINESS_BUNDLE_BINARY_PATH}`;
    execCommand(cmd, () => {
      resolve();
    });
  });
};

(async function() {
  
  await generateCommonJsBundle();
  await generateBusinessJsBundle();
  await generateCommonHermesBundle();
  await generateBusinessHermesBundle();

}());

