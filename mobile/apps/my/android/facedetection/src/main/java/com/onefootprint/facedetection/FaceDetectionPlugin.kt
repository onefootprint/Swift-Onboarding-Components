package com.onefootprint.facedetection

import android.util.Log
import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.Face
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetector
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.mrousavy.camera.frameprocessor.Frame
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessor.VisionCameraProxy
import kotlin.math.abs


class FaceDetectionPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?): FrameProcessorPlugin() {
  private val defaultDetection = mapOf(
    "hasFace" to false,
    "isFaceInCenter" to false,
    "isFaceStraight" to false,
    "isStable" to false
  )
  private val TAG = "face-detection"

  // Constants - we can fine tune these later if needed
  private final val MIN_FACE_SIZE = 0.35f // trade-off between speed and accuracy
  private final val MAX_YAW_ANGLE_ROTATION = 20
  private final val MAX_ROLL_ANGLE_ROTATION = 20
  private final val MAX_PITCH_ANGLE_ROTATION = 15

  private val frameImageRotation = 270 // This is because of a bug in RN https://github.com/mrousavy/react-native-vision-camera/issues/960
  private val outlineHorizontalPadding = 32 // This is coming from the DOM specification of the frame outline
  private val outlineAspectRatio = 0.9 // This is coming from the DOM specification of the frame outline

  private val faceDetectorOptions: FaceDetectorOptions = FaceDetectorOptions.Builder()
    .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
    .setMinFaceSize(MIN_FACE_SIZE)
    .build()
  private val faceDetector: FaceDetector = FaceDetection.getClient(faceDetectorOptions)

  private fun getInputImage(frame: Frame): InputImage? {
    val image = frame.image
    if(image != null) {
      return InputImage.fromMediaImage(image, frameImageRotation)
    }
    return null
  }

  private fun isFaceStraight(face: Face): Boolean{
    val rollAngle = abs(face.headEulerAngleZ)
    val pitchAngle = abs(face.headEulerAngleX)
    val yawAngle = abs(face.headEulerAngleY)

    return rollAngle <= MAX_ROLL_ANGLE_ROTATION &&
            pitchAngle <= MAX_PITCH_ANGLE_ROTATION &&
            yawAngle <= MAX_YAW_ANGLE_ROTATION
  }

  private fun isFaceInsideOutline(face: Face, image: InputImage): Boolean {
    val boundingBox = face.boundingBox

    // Note we treat image height as the width here. Again this is because of this RN bug: https://github.com/mrousavy/react-native-vision-camera/issues/960
    val frameOutlineLeft = outlineHorizontalPadding
    val frameOutlineRight = image.height - outlineHorizontalPadding
    val frameOutlineHeight = image.height * outlineAspectRatio
    val frameOutlineCenterY = image.width / 2f
    val frameOutlineTop = frameOutlineCenterY - (frameOutlineHeight / 2f)
    val frameOutlineBottom = frameOutlineCenterY + (frameOutlineHeight / 2f)

    val faceBoundingBoxLeft = boundingBox.left
    val faceBoundingBoxRight = boundingBox.right
    val faceBoundingBoxTop = boundingBox.top
    val faceBoundingBoxBottom = boundingBox.bottom

    return faceBoundingBoxLeft >= frameOutlineLeft &&
            faceBoundingBoxRight <= frameOutlineRight &&
            faceBoundingBoxTop >= frameOutlineTop &&
            faceBoundingBoxBottom <= frameOutlineBottom
  }

  private fun detectFaces (image: InputImage): Map<String, Boolean> {
    try {
      val task: Task<List<Face>> = faceDetector.process(image)
      val faces: List<Face> = Tasks.await<List<Face>>(task)

      // We don't accept multiple faces or no faces
      if (faces.size != 1){
        return defaultDetection
      }

      val face = faces[0]
      val isFaceStraight = isFaceStraight(face)
      val isFaceCenter = isFaceInsideOutline(face, image)
      return mapOf(
        "hasFace" to true,
        "isFaceInCenter" to isFaceCenter,
        "isFaceStraight" to isFaceStraight,
        "isStable" to true
      )
    } catch (e: Exception) {
      e.printStackTrace()
      return defaultDetection
    }
  }

  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
    var inputImage: InputImage? = null
    try {
      inputImage = getInputImage(frame)
    }catch (e: Exception){
      Log.e(TAG, "Error converting frame image to MLkit InputImage $e", )
      e.printStackTrace()
    }
    inputImage?.let {
      return detectFaces(it)
    }
    return defaultDetection
  }
}