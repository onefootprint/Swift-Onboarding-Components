import VisionCamera
import CoreMotion
import AVFoundation
import CoreImage
import CoreVideo
import Vision

@objc(FaceDetectionPlugin)
public class FaceDetectionPlugin: FrameProcessorPlugin {
  private static let motionManager = CMMotionManager()
  private static let motionThreshold: Double = 0.05
  
  public override init(options: [AnyHashable: Any]! = [:]) {
    super.init(options: options)
  }
  
  public static func isDeviceStable() -> Bool {
    if motionManager.isDeviceMotionAvailable {
      if !motionManager.isDeviceMotionActive {
        motionManager.startDeviceMotionUpdates()
      }
      if let data = motionManager.deviceMotion {
        let userAcceleration = data.userAcceleration
        let magnitude = sqrt(userAcceleration.x * userAcceleration.x +
                             userAcceleration.y * userAcceleration.y +
                             userAcceleration.z * userAcceleration.z)
        if magnitude < motionThreshold {
          return true
        }
      }
    }
    return false
  }
  
  public static func detectFace(_ pixelBuffer: CVPixelBuffer) -> VNFaceObservation? {
    let imageRequestHandler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
    let faceDetectionRequest = VNDetectFaceLandmarksRequest()
    do {
      try imageRequestHandler.perform([faceDetectionRequest])
    } catch {
      print("Failed to perform the request: \(error)")
      return nil
    }
    guard let results = faceDetectionRequest.results else { return nil }
    if results.count == 1, let faceObservation = results[0] as? VNFaceObservation {
      return faceObservation
    }
    return nil
  }
  
  public static func isFaceInCenter(_ observation: VNFaceObservation, frameSize: CGSize) -> Bool {
    let centerFaceX = observation.boundingBox.midX * frameSize.width
    let centerFaceY = observation.boundingBox.midY * frameSize.height
    let frameCenter = CGPoint(x: frameSize.width / 2.0, y: frameSize.height / 2.0)
    let tolerance: CGFloat = 0.2
    let diffX = abs(centerFaceX - frameCenter.x)
    let diffY = abs(centerFaceY - frameCenter.y)
    return diffX <= frameSize.width * tolerance && diffY <= frameSize.height * tolerance
  }
  
  @available(iOS 12.0, *)
  public static func isFaceStraight(_ faceObservation: VNFaceObservation) -> Bool {
    guard let yaw = faceObservation.yaw, let roll = faceObservation.roll else { return false }
    let yawThreshold = CGFloat(0.15)
    let rollThreshold = CGFloat(0.15)
    // Check if the absolute values for yaw and roll are within the defined thresholds
    // If they are, the face is considered straight
    return abs(yaw.floatValue) < Float(yawThreshold) && abs(roll.floatValue) < Float(rollThreshold)
  }

  @objc override public func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any {
    let isStable = FaceDetectionPlugin.isDeviceStable()
    let buffer = frame.buffer
    
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      return [
        "hasFace": false,
        "isFaceInCenter": false,
        "isFaceStraight": false,
         "isStable": isStable
      ]
    }
    
    guard let arguments = arguments,
         let frameOptions = arguments as? [String: Any],
         let frameSizeWidth = frameOptions["width"] as? CGFloat,
         let frameSizeHeight = frameOptions["height"] as? CGFloat else {
       return [
           "hasFace": false,
           "isFaceInCenter": false,
           "isFaceStraight": false,
           "isStable": isStable
       ]
   }
    
    let frameSize = CGSize(width: frameSizeWidth, height: frameSizeHeight)
    if let faceObservation = FaceDetectionPlugin.detectFace(pixelBuffer) {
      let isFaceInCenter = FaceDetectionPlugin.isFaceInCenter(faceObservation, frameSize: frameSize)
      var isFaceStraight = false
      if #available(iOS 12.0, *) {
        isFaceStraight = FaceDetectionPlugin.isFaceStraight(faceObservation)
      }

      return [
        "hasFace": true,
        "isFaceInCenter": isFaceInCenter,
        "isFaceStraight": isFaceStraight,
        "isStable": isStable
      ]
    }
    
    return [
      "hasFace": false,
      "isFaceInCenter": false,
      "isFaceStraight": false,
      "isStable": isStable
    ]
  }
}
