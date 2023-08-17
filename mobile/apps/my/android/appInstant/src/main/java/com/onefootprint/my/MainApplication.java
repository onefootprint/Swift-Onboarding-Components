package com.onefootprint.my;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import java.util.List;
import com.google.android.gms.instantapps.InstantApps;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = 
    new DefaultReactNativeHost(this) {
      @Override
      public boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
      }

      @Override
      protected List<ReactPackage> getPackages() {
        // Packages need to be linked manually due to requirements of instant app
        // If the dependency is needed in an instant application - import and append it with the property path in PackageListSyntheticFull class and include the package in build.gradle file

        return new PackageListInstant(this).getPackages();
      }

      @Override
      protected String getJSMainModuleName() {
        return "index";
      }

      @Override
      protected String getBundleAssetName() {
          return "index.instantapp.bundle";
      }

      @Override
      protected boolean isNewArchEnabled() {
        return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      }

      @Override
      protected Boolean isHermesEnabled() {
        return BuildConfig.IS_HERMES_ENABLED;
      }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  private boolean isInstant() {
      return InstantApps.getPackageManagerCompat(MainApplication.this).isInstantApp();
  }
}
