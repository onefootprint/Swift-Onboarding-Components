package com.example.documentdetection

import android.content.Context
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.mrousavy.camera.frameprocessor.FrameProcessorPluginRegistry

class DocumentDetectionPluginPackage (context: Context) : ReactPackage {
    init {
      FrameProcessorPluginRegistry.addFrameProcessorPlugin("detectDocument") { proxy, options ->
        DocumentDetectionPlugin(context, proxy, options)
      }
    }


  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return emptyList()
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}