/**
* References-
* https://segmentfault.com/a/1190000039834087/en
* https://github.com/facebook/metro/blob/master/packages/metro/src/lib/createModuleIdFactory.js
*/

const fs = require('fs');

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
      // map of module paths to their Ids
      const fileToIdMap = {};

      const projectRootPath = __dirname;
      let nextId = 0;

      // create fileToIdMap file so that it can be used in metro.business.config
      const MAP_FILE = 'fileToIdMap.txt';
      if (fs.existsSync(MAP_FILE)) {
        // delete file if exists
        fs.unlinkSync(MAP_FILE);
      }
      return function (path) {
        // Based on the relative path of the file
        const modulePath = path.substr(projectRootPath.length + 1);

        let moduleId = fileToIdMap[modulePath];
        if (typeof moduleId !== 'number') {
          moduleId = nextId++;
          fileToIdMap[modulePath] = moduleId;
          fs.appendFileSync(MAP_FILE, `${modulePath}:${moduleId}\n`);
        }
        return moduleId;
      };
    },
  },
};

/*
# Packaging platform: android
# Package configuration file: metro.common.config.js
# Package entry file: common.js
# Output path: bundle/common.android.bundle

npx react-native bundle \
  --platform android \
  --config metro.common.config.js \
  --dev false --entry-file common.js \
  --bundle-output bundle/common.android.bundle
*/