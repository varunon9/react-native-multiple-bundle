package varunon9.me.reactnativemultiplebundle;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.facebook.react.ReactInstanceManager;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        bootCommonRnBundle();
    }

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

    private void bootCommonRnBundle() {
        ReactInstanceManager reactInstanceManager = SingletonReactInstanceManager.getReactInstanceManager(this);
        reactInstanceManager.createReactContextInBackground();
    }
}