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
  console.log('*****************');
  console.log('Generating business.android.bundle');
  console.log('Once the file is generated, make the following changes manually');
  console.log('Remove all init/polyfill functions i.e. this bundle should only contain __d & __r statements')
  console.log('*****************');
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
    }),
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
  },
};