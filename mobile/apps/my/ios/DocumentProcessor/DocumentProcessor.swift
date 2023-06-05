import AVFoundation
import CoreImage
import CoreVideo
import Vision

@objc(DocumentProcessorPlugin)
public class DocumentProcessorPlugin: NSObject, FrameProcessorPluginBase {

  private static let MINIMUM_DOCUMENT_ASPECT_RATIO: CGFloat = 1.3
  private static let MAXIMUM_DOCUMENT_ASPECT_RATIO: CGFloat = 1.8

  private static func isSizeValid(_ observation: VNRectangleObservation, size: CGSize, minimumSizeRatio: CGFloat) -> Bool {
    let minimumSize = CGFloat(min(size.width, size.height)) * minimumSizeRatio
    let observationWidth = observation.boundingBox.width * size.width
    let observationHeight = observation.boundingBox.height * size.height
    return observationWidth > minimumSize && observationHeight > minimumSize
  }

   private static func isAspectRatioValid(_ observation: VNRectangleObservation, size: CGSize) -> Bool {
    let observationWidth = observation.boundingBox.width * size.width
    let observationHeight = observation.boundingBox.height * size.height
    let aspectRatio = observationWidth / observationHeight
    return aspectRatio >= MINIMUM_DOCUMENT_ASPECT_RATIO && aspectRatio <= MAXIMUM_DOCUMENT_ASPECT_RATIO
  }

  public static func isValidDocument(_ observation: VNRectangleObservation, size: CGSize, minimumSizeRatio: CGFloat) -> Bool {
    return isSizeValid(observation, size: size, minimumSizeRatio: minimumSizeRatio) && isAspectRatioValid(observation, size: size)
  }

  public static func detectDocument(_ pixelBuffer: CVPixelBuffer, minimumSizeRatio: CGFloat = 0.55) -> VNRectangleObservation? {
    let imageRequestHandler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
    let rectangleRequest = VNDetectRectanglesRequest()

    rectangleRequest.minimumAspectRatio = VNAspectRatio(MINIMUM_DOCUMENT_ASPECT_RATIO)
    rectangleRequest.maximumAspectRatio = VNAspectRatio(MAXIMUM_DOCUMENT_ASPECT_RATIO)
    rectangleRequest.minimumSize = Float(minimumSizeRatio)
    rectangleRequest.quadratureTolerance = 20.0

    do {
        try imageRequestHandler.perform([rectangleRequest])
    } catch {
        print("Failed to perform the request: \(error)")
        return nil
    }

    guard let results = rectangleRequest.results else { return nil }
    for observation in results {
        if let rectangleObservation = observation as? VNRectangleObservation {
            let size = CGSize(width: CVPixelBufferGetWidth(pixelBuffer), height: CVPixelBufferGetHeight(pixelBuffer))
            if isValidDocument(rectangleObservation, size: size, minimumSizeRatio: minimumSizeRatio) {
                return rectangleObservation
            }
        }
    }

    return nil
  }
  
  public static func calculateBrightness(_ pixelBuffer: CVPixelBuffer) -> Double? {
    let ciImage = CIImage(cvPixelBuffer: pixelBuffer)

    // Create brightness filter
    let brightnessFilter = CIFilter(name: "CIAreaAverage", parameters: [kCIInputImageKey: ciImage])

    // Get output image from brightness filter
    guard let outputImage = brightnessFilter?.outputImage else {
        return nil
    }

    // Create context to draw output image
    let context = CIContext(options: nil)

    // Create CGImage from output image
    guard let cgImage = context.createCGImage(outputImage, from: outputImage.extent) else {
        return nil
    }

    // Get pixel data from CGImage
    guard let pixelData = cgImage.dataProvider?.data else {
        return nil
    }

    // Get brightness value
    let data: UnsafePointer<UInt8> = CFDataGetBytePtr(pixelData)
    let brightnessValue = (Double(data[0]) + Double(data[1]) + Double(data[2])) / 3.0 / 255.0

    return brightnessValue
  }

  public static func calculateFrameAccuracy(_ observation: VNRectangleObservation, size: CGSize, frame: CGRect) -> Double {
    let boundingBox = CGRect(x: observation.boundingBox.origin.x * size.width, y: (1 - observation.boundingBox.origin.y - observation.boundingBox.height) * size.height, width: observation.boundingBox.width * size.width, height: observation.boundingBox.height * size.height)
    let intersection = boundingBox.intersection(frame)
    let intersectionArea = intersection.size.width * intersection.size.height
    let boundingBoxArea = boundingBox.size.width * boundingBox.size.height

    // Calculate frame accuracy as the proportion of the bounding box that is within the frame
    let frameAccuracy = boundingBoxArea > 0 ? intersectionArea / boundingBoxArea : 0.0
    return frameAccuracy
  }

  @objc public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      return nil
    }

    guard let frameOptions = args[0] as? [String: Any],
          let frameDictionary = frameOptions["frame"] as? [String: CGFloat],
          let x = frameDictionary["x"],
          let y = frameDictionary["y"],
          let width = frameDictionary["width"],
          let height = frameDictionary["height"] else {
      return nil
    }
    let brightness = DocumentProcessorPlugin.calculateBrightness(pixelBuffer)
    let size = CGSize(width: CVPixelBufferGetWidth(pixelBuffer), height: CVPixelBufferGetHeight(pixelBuffer))

    let cgFrame = CGRect(x: x, y: y, width: width, height: height)

    let rectangleObservation = DocumentProcessorPlugin.detectDocument(pixelBuffer)
    let isValidDocument = rectangleObservation != nil
    let frameAccuracy = rectangleObservation != nil ? calculateFrameAccuracy(rectangleObservation!, size: size, frame: cgFrame) : 0.0

    return [
      "brightness": brightness ?? 0.0,
      "is_document": isValidDocument,
      "frame_accuracy": frameAccuracy,
    ] 
  }
}
