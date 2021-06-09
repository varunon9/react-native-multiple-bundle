// metro.business.config.js

const fs = require('fs');

const MAP_FILE = 'fileToIdMap.txt';
const commonFileToIdMap = {};

// Read MAP_FILE & populate commonFileToIdMap
fs.readFileSync(MAP_FILE, 'utf8').toString().split('\n').forEach((content) => {
  const contentArr = content.split(':');
  commonFileToIdMap[contentArr[0]] = parseInt(contentArr[1]);
});

(function() {
  console.log(
    `
    *****************
    Generating business.android.bundle
    Make sure that both common.android.bundle & ${MAP_FILE} are updated
    If you want to generate bytecode then use "yarn hermes-bundle"
    This single command will generate both common.android.bundle & business.android.bundle as binary file
    *****************
    `
  )
})();

function getParsedModulePath(path) {
  const projectRootPath = __dirname;
  return path.substr(projectRootPath.length + 1);
}

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    })
  },
  serializer: {
    createModuleIdFactory: function () {
      const businessFileToIdMap = {};
      // start from end of common bundle
      let nextId = Object.keys(commonFileToIdMap).length;

      return function (path) {
        const modulePath = getParsedModulePath(path);

        let moduleId = commonFileToIdMap[modulePath] || businessFileToIdMap[modulePath];
        
        if (typeof moduleId !== 'number') {
          moduleId = nextId++;
          businessFileToIdMap[modulePath] = moduleId;
        }
        return moduleId;
      }
    },
    processModuleFilter: function (modules) {
      const modulePath = getParsedModulePath(modules.path);
      if (typeof commonFileToIdMap[modulePath] !== 'number') {
        console.log('createModuleIdFactory path', modulePath);
        return true;
      }
      return false;
    },
    // we don't need polyfills here as they are already part of common bundle
    // sadly, require.js polyfill would still be included :(
    // https://github.com/facebook/metro/blob/master/packages/metro/src/lib/getPrependedScripts.js
    // https://github.com/facebook/metro/blob/master/packages/metro-config/src/defaults/defaults.js
    getPolyfills: () => [],
    postProcessBundleSourcemap: ({code, map, outFileName}) => {
      // we could have excluded require.js polyfill here
      // however this parameter is not yet implemented
      // Check: https://github.com/facebook/metro/issues/400
      // for now post-business-js-bundle script is doing this job for us
      return {
        code, map
      };
    }
  },
};