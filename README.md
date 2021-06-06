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

### Tasks to complete POC

1. Split react-native single bundle into common + business bundles. `common.android.bundle` will contain only React & react-native libraries whereas `business.android.bundle` will contain only business JS files.
2. Pre-load `common.android.bundle` while app is still in native flow i.e. in MainActivity
3. On-demand load `business.android.bundle` from ReactActivity
