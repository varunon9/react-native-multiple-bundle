package varunon9.me.reactnativemultiplebundle;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.CatalystInstanceImpl;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.soloader.SoLoader;

public class MultiBundleRnAppActivity extends AppCompatActivity implements DefaultHardwareBackBtnHandler {

    private ReactRootView mReactRootView;

    // from SingletonReactInstanceManager
    private ReactInstanceManager mReactInstanceManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loadReactNativeApp();
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostPause(this);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostResume(this, this);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostDestroy(this);
        }
        if (mReactRootView != null) {
            mReactRootView.unmountReactApplication();
        }
    }

    @Override
    public void onBackPressed() {
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onBackPressed();
        } else {
            super.onBackPressed();
        }
    }

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
}