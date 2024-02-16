package com.onefootprint.facedetection

import com.mrousavy.camera.frameprocessor.Frame
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessor.VisionCameraProxy

class FaceDetectionPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?): FrameProcessorPlugin() {
  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
    return mapOf(
      "hasFace" to false,
      "isFaceInCenter" to false,
      "isFaceStraight" to false,
      "isStable" to false
    )
  }
}