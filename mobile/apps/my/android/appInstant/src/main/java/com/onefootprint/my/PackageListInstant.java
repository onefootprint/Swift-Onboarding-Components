package com.onefootprint.my;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainPackageConfig;
import com.facebook.react.shell.MainReactPackage;
import java.util.ArrayList;
import java.util.Arrays;

// Manual package linking
import com.mrousavy.camera.CameraPackage;
import com.visioncameraplugindocument.VisionCameraPluginDocumentPackage;
import com.visioncamerapluginfacedetection.VisionCameraPluginFaceDetectionPackage;
import com.shopify.reactnative.flash_list.ReactNativeFlashListPackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.horcrux.svg.SvgPackage;
import com.reactnativepasskey.PasskeyPackage;
import org.reactnative.maskedview.RNCMaskedViewPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.swmansion.reanimated.ReanimatedPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;

public class PackageListInstant {
    private Application application;
    private ReactNativeHost reactNativeHost;
    private MainPackageConfig mConfig;

    public PackageListInstant(ReactNativeHost reactNativeHost) {
        this(reactNativeHost, null);
    }

    public PackageListInstant(Application application) {
        this(application, null);
    }

    public PackageListInstant(ReactNativeHost reactNativeHost, MainPackageConfig config) {
        this.reactNativeHost = reactNativeHost;
        mConfig = config;
    }

    public PackageListInstant(Application application, MainPackageConfig config) {
        this.reactNativeHost = null;
        this.application = application;
        mConfig = config;
    }

    private ReactNativeHost getReactNativeHost() {
        return this.reactNativeHost;
    }

    private Resources getResources() {
        return this.getApplication().getResources();
    }

    private Application getApplication() {
        return this.application;
    }

    private Context getApplicationContext() {
        return this.getApplication().getApplicationContext();
    }

    public ArrayList<ReactPackage> getPackages() {
        return new ArrayList<>(Arrays.<ReactPackage>asList(
                new MainReactPackage(mConfig),
                new CameraPackage(),
                new VisionCameraPluginDocumentPackage(),
                new VisionCameraPluginFaceDetectionPackage(),
                new ReactNativeFlashListPackage(),
                new SafeAreaContextPackage(),
                new RNScreensPackage(),
                new SvgPackage(),
                new PasskeyPackage(),
                new RNCMaskedViewPackage(),
                new AsyncStoragePackage(),
                new ReanimatedPackage(),
                new SplashScreenReactPackage()
        ));
    }
}