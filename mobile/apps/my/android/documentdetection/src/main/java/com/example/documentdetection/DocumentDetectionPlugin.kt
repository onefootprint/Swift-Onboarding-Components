package com.example.documentdetection

import android.content.Context
import android.graphics.RectF
import android.media.Image
import android.util.Log
import com.google.android.gms.tflite.client.TfLiteInitializationOptions
import com.google.firebase.ml.modeldownloader.CustomModel
import com.google.firebase.ml.modeldownloader.CustomModelDownloadConditions
import com.google.firebase.ml.modeldownloader.DownloadType
import com.google.firebase.ml.modeldownloader.FirebaseModelDownloader
import com.mrousavy.camera.frameprocessor.Frame
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessor.VisionCameraProxy
import org.tensorflow.lite.support.image.ImageProcessor
import org.tensorflow.lite.support.image.TensorImage
import org.tensorflow.lite.task.gms.vision.TfLiteVision
import org.tensorflow.lite.task.gms.vision.detector.ObjectDetector
import java.io.File
import kotlin.math.abs

class DocumentDetectionPlugin(
  context: Context,
  proxy: VisionCameraProxy,
  options: Map<String, Any>?): FrameProcessorPlugin() {
  private val TAG = "doc-detection"
  private var objectDetector:  ObjectDetector? = null
  private final val firebaseModelName = "document-detection"
  private final val detectionAccuracyThreshold = 0.25f
  private final val numDetectionResults = 5
  private final val outlineHorizontalPadding = 32 // This is coming from the DOM specification of the frame outline
  private final val outlineAspectRatio = 1.586 // This is coming from the DOM specification of the frame outline
  private final val docHeightAllowedErrorMargin = 0.3
  private final val docWidthAllowedErrorMargin = 0.3
  private final val numAllowedFails = 2
  private var numFailedDetection = numAllowedFails

  init{
    val conditions = CustomModelDownloadConditions.Builder().build()
    FirebaseModelDownloader.getInstance()
      .getModel(firebaseModelName, DownloadType.LATEST_MODEL,
        conditions)
      .addOnSuccessListener { model: CustomModel? ->
        // Download complete.
        val modelFile = model?.file
        if(modelFile != null){
          buildObjectDetector(context, modelFile)
        }
      }
      .addOnFailureListener { e ->
        Log.e(TAG, "error: $e")
        e.printStackTrace()
      }
  }

  private fun buildObjectDetector(context: Context, modelFile: File){
    val tfLiteInitOptions = TfLiteInitializationOptions.builder()
      .setEnableGpuDelegateSupport(true)
      .build()

    val optionsBuilder: ObjectDetector.ObjectDetectorOptions.Builder =
      ObjectDetector.ObjectDetectorOptions.builder()
        .setScoreThreshold(detectionAccuracyThreshold)
        .setMaxResults(numDetectionResults)

    TfLiteVision.initialize(context, tfLiteInitOptions).addOnSuccessListener {
      objectDetector =
        ObjectDetector.createFromFileAndOptions(modelFile, optionsBuilder.build())
    }.addOnFailureListener {
      // Called if the GPU Delegate is not supported on the device
      TfLiteVision.initialize(context).addOnSuccessListener {
        objectDetector =
          ObjectDetector.createFromFileAndOptions(modelFile, optionsBuilder.build())
        Log.e(TAG, "buildObjectDetector: GPU delegate not supported; using fallback detector build")
      }.addOnFailureListener{
        it.printStackTrace()
      }
    }
  }


  private fun isPossibleIdCard(boundingBox: RectF, image: Image): Boolean {
    /**
     * All of the calculations below may seem a little counter-intuitive
     * In order to make sense of the calculations below, consider the image to be rotated 90 degrees counter-clockwise first
     * that is the height as you see on your phone screen becomes width, and width becomes height
     * then the calculations will make sense
     * This is because of a bug in RN https://github.com/mrousavy/react-native-vision-camera/issues/960
     */
    val frameOutlineTop = outlineHorizontalPadding / 2
    val frameOutlineBottom = image.height - (outlineHorizontalPadding / 2)

    val frameOutlineHeight = frameOutlineBottom - frameOutlineTop
    val frameOutlineWidth = frameOutlineHeight / outlineAspectRatio

    val imageCenterX = image.width / 2
    val frameOutlineLeft = imageCenterX - (frameOutlineWidth / 2)
    val frameOutlineRight = frameOutlineLeft + frameOutlineWidth

    val boundingBoxLeft = boundingBox.left
    val boundingBoxRight = boundingBox.right
    val boundingBoxTop = boundingBox.top
    val boundingBoxBottom = boundingBox.bottom

    val isBoundingBoxLeftInBounds = boundingBoxLeft >= frameOutlineLeft && abs(
      boundingBoxLeft - frameOutlineLeft
    ) <= (frameOutlineWidth * docHeightAllowedErrorMargin)
    val isBoundingBoxRightInBounds = boundingBoxRight <= frameOutlineRight && abs(
      boundingBoxRight - frameOutlineRight
    ) <= (frameOutlineWidth * docHeightAllowedErrorMargin)
    val isBoundingBoxTopInBounds = boundingBoxTop >= frameOutlineTop && abs(
      boundingBoxTop - frameOutlineTop
    ) <= (frameOutlineHeight * docWidthAllowedErrorMargin)
    val isBoundingBoxBottomInBounds = boundingBoxBottom <= frameOutlineBottom && abs(
      boundingBoxBottom - frameOutlineBottom
    ) <= (frameOutlineHeight * docWidthAllowedErrorMargin)

    return isBoundingBoxLeftInBounds &&
            isBoundingBoxRightInBounds &&
            isBoundingBoxTopInBounds &&
            isBoundingBoxBottomInBounds
  }

  override fun callback(frame: Frame, arguments: Map<String, Any>?): Map<String, Boolean> {
    if(objectDetector != null && frame.isValid && frame.image != null){
      try {
        val imageProcessor = ImageProcessor.Builder().build()
        val ti = TensorImage()
        ti.load(frame.image)
        val tensorImage = imageProcessor.process(ti)
        val results = objectDetector?.detect(tensorImage)

        var possibleIdCards = 0
        results?.forEach {
          val boundingBox = it.boundingBox
          if (boundingBox != null) {
            if (isPossibleIdCard(boundingBox, frame.image)) possibleIdCards += 1
          }
        }
        if (possibleIdCards == 1) {
          numFailedDetection = 0
        }else{
          numFailedDetection += 1
        }
        return if(numFailedDetection >= numAllowedFails){
          mapOf("isDocument" to false)
        }else {
          mapOf("isDocument" to true)
        }
      }catch (error: Exception){
        Log.e(TAG, "callback: error with frame image")
        error.printStackTrace()
      }
    }
    return mapOf("isDocument" to false);
  }
}