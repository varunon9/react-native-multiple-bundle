# react-native-multiple-bundle
A naive approach towards code splitting and loading multiple JS bundles in react-native

## Objective

- Consider a scenario where an app has three React Activities for 3 different businesses. Each React Activity when invoked, load its own react-native app(module) to it.
- Let's assume that JS bundle size of each module is 800 KB out of which library (react & react-native) size is 700 KB. Total JS bundle size = 2400 KB.
- Since Each JS bundle will contain transpiled React & react-native libraries, so let's extract this 700 KB common code and put in a separate bundle.
- New JS bundle size = 700 KB (common.bundle) + 100 KB (business1.bundle) + 100 KB (business2.bundle) + 100 KB (business3.bundle) = 1000 KB
- Pre-load this common code when app is still in native flow
- Load respective business code (react-native flow) on demand 
- Save app size as well as react-native startup time with this process

## Proof of Concept

In this POC I am starting two react-native apps, one with complete bundle (what we do normally) and another with common + business bundle. I am then comparing startup time for both RN apps.

<image src="./screenshots/flow-chart.jpg" alt="flow-chart" width="420" />

<image src="./screenshots/react-native-multiple-bundle.gif" alt="react-native-multiple-bundle-demo" />

## Tasks breakdow

1. Split react-native single bundle into common + business bundles. `common.android.bundle` will contain only React & react-native libraries whereas `business.android.bundle` will contain only business JS files.
2. Pre-load `common.android.bundle` while app is still in native flow i.e. in MainActivity
3. On-demand load `business.android.bundle` from ReactActivity

## Code splitting in react-native

React native uses [Metro](https://github.com/facebook/metro) for bundling Javascript files. As of now there is no official way to generate multiple bundles but this can be achieved using custom metro config files.

We want to divide out Javascript bundles into two parts - common (react & react-native) + business (business JS files + 3rd party libraries)

1. Create a [common.js](https://github.com/varunon9/react-native-multiple-bundle/blob/master/RNCodeSplitting/common.js) file with below contents

```
import * as React from 'react';
import { AppRegistry } from 'react-native';

const App = () => {
  return null;
}
AppRegistry.registerComponent('COMMON', () => App);
```

2. Create [metro.common.config.js](https://github.com/varunon9/react-native-multiple-bundle/blob/master/RNCodeSplitting/metro.common.config.js) with below contents

```
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
```

3. Use this command to generate common.android.bundle

```
npx react-native bundle \
--platform android \
--config metro.common.config.js \
--dev false --entry-file common.js \
--bundle-output ../app/src/main/assets/common.android.bundle \
--assets-dest=../app/src/main/res
```

4. You will observe that [fileToIdMap.txt](https://github.com/varunon9/react-native-multiple-bundle/blob/master/RNCodeSplitting/fileToIdMap.txt) has been create with contents something like below-

```
common.js:0
node_modules/react/index.js:1
node_modules/react/cjs/react.production.min.js:2
node_modules/object-assign/index.js:3
node_modules/@babel/runtime/helpers/extends.js:4
node_modules/react-native/index.js:5

```

5. Now create [metro.business.config.js](https://github.com/varunon9/react-native-multiple-bundle/blob/master/RNCodeSplitting/metro.business.config.js) with below content-

```
const fs = require('fs');

const MAP_FILE = 'fileToIdMap.txt';
const commonFileToIdMap = {};

// Read MAP_FILE & populate commonFileToIdMap
fs.readFileSync(MAP_FILE, 'utf8').toString().split('\n').forEach((content) => {
  const contentArr = content.split(':');
  commonFileToIdMap[contentArr[0]] = parseInt(contentArr[1]);
});

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
```

6. Use below command to generate business.android.bundle

```
npx react-native bundle \n
--platform android \n
--config metro.business.config.js \n
--dev false --entry-file business.js \n
--bundle-output ../app/src/main/assets/business.android.bundle \n
--assets-dest=../app/src/main/res
```

Once this file is generated, you manually have to remove init/polyfill functions since those have already been taken care in common.android.bundle

Reference: https://segmentfault.com/a/1190000039834087/en

## Pre-loading common.android.bundle

```
private void bootCommonRnBundle() {
    ReactInstanceManager reactInstanceManager = SingletonReactInstanceManager.getReactInstanceManager(this);
    reactInstanceManager.createReactContextInBackground();
}
```

[SingletonReactInstanceManager](https://github.com/varunon9/react-native-multiple-bundle/blob/master/app/src/main/java/varunon9/me/reactnativemultiplebundle/SingletonReactInstanceManager.java)

```
public class SingletonReactInstanceManager {
    private static ReactInstanceManager reactInstanceManager;

    private SingletonReactInstanceManager() { }

    public static ReactInstanceManager getReactInstanceManager(Activity activity) {
        if (reactInstanceManager == null) {
            reactInstanceManager = ReactInstanceManager.builder()
                    .setApplication(activity.getApplication())
                    .setCurrentActivity(activity)
                    .setJSBundleFile("assets://common.android.bundle")
                    .addPackages(Arrays.<ReactPackage>asList(
                            new MainReactPackage()
                    ))
                    .setUseDeveloperSupport(BuildConfig.DEBUG)
                    .setInitialLifecycleState(LifecycleState.RESUMED)
                    .build();
        }
        return reactInstanceManager;
    }
}
```

Reference: https://programmersought.com/article/10554560541/

## On-demand loading business.android.bundle

```
private void loadReactNativeApp() {
    SoLoader.init(this, false);

    System.out.println("loading Multi Bundle RN app");

    mReactRootView = new ReactRootView(this);

    // Boot business Javascript bundle
    mReactInstanceManager = SingletonReactInstanceManager.getReactInstanceManager(this);
    if (mReactInstanceManager.hasStartedCreatingInitialContext()) {
        ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
        try {
            CatalystInstance catalyst = reactContext.getCatalystInstance();
            ((CatalystInstanceImpl)catalyst).loadScriptFromAssets(reactContext.getAssets(), "assets://business.android.bundle",true);

            // The string here (e.g. "MultiBundleRnApp") has to match
            // the string in AppRegistry.registerComponent() in business.js
            mReactRootView.startReactApplication(mReactInstanceManager, "MultiBundleRnApp", null);

            setContentView(mReactRootView);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

## Startup time observation (in milliseconds)

SingleBundleRnApp | MultipleBundleRnApp
------------------|--------------------
648               |176
673               |127
609               |148
743               |124
606               |160

To calculate startup time, I printed timestamps at two places-

1. [MainActivity](https://github.com/varunon9/react-native-multiple-bundle/blob/master/app/src/main/java/varunon9/me/reactnativemultiplebundle/MainActivity.java)-

```
public void onSingleBundleClick(View v) {
    Intent intent = new Intent(this, SingleBundleRnAppActivity.class);
    System.out.println("onSingleBundleClick called, time: " + System.currentTimeMillis());
    startActivity(intent);
}

public void onMultiBundleClick(View v) {
    Intent intent = new Intent(this, MultiBundleRnAppActivity.class);
    System.out.println("onMultiBundleClick called, time: " + System.currentTimeMillis());
    startActivity(intent);
}
```

2. [App.js](https://github.com/varunon9/react-native-multiple-bundle/blob/master/RNCodeSplitting/App.js)

```
useEffect(() => {
  console.log('App.useEffect', Date.now());
}, []);
```

I then took difference of two.
 
