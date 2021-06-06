package varunon9.me.reactnativemultiplebundle;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    public void onSingleBundleClick(View v) {
        Intent intent = new Intent(this, SingleBundleRnAppActivity.class);
        startActivity(intent);
    }

    public void onMultiBundleClick(View v) {
        Intent intent = new Intent(this, MultiBundleRnAppActivity.class);
        startActivity(intent);
    }
}