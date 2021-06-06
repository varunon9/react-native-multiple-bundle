package varunon9.me.reactnativemultiplebundle;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;

public class MultiBundleRnAppActivity extends AppCompatActivity implements DefaultHardwareBackBtnHandler {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void invokeDefaultOnBackPressed() {

    }
}