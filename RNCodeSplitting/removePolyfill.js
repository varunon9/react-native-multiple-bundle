/**
* require.js polyfill function initializes a variable `modules` and
* use it to cache resolved modules
    modules = {}
    ...
    var mod = {
      dependencyMap: dependencyMap,
      factory: factory,
      hasError: false,
      importedAll: EMPTY,
      importedDefault: EMPTY,
      isInitialized: false,
      publicModule: {
        exports: {}
      }
    };
    modules[moduleId] = mod;

* We have to remove require.js polyfill function from business.android.bundle 
* since that is already part of common.android.bundle and we want to use 
* same initialized variable `modules`
* Failing to do so will cause error `com.facebook.jni.CppException: Requiring unknown module`
*/

const bundlePath = '../app/src/main/assets/business.android.bundle';
