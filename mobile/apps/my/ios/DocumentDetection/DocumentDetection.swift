import VisionCamera
import AVFoundation
import CoreImage
import CoreVideo
import Vision
import CoreMotion

@objc(DocumentDetectionPlugin)
public class DocumentDetectionPlugin: FrameProcessorPlugin {
  private static let MINIMUM_DOCUMENT_ASPECT_RATIO: CGFloat = 1.3
  private static let MAXIMUM_DOCUMENT_ASPECT_RATIO: CGFloat = 1.8
  
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public static func isDocumentCentered(_ imageSize: CGSize, documentBoundingBox: CGRect, margin: CGFloat = 0.1) -> Bool {
    let imageCenter = CGPoint(x: imageSize.width / 2, y: imageSize.height / 2)
    let documentCenter = CGPoint(x: documentBoundingBox.midX * imageSize.width,
                                  y: documentBoundingBox.midY * imageSize.height)
    let dx = abs(documentCenter.x - imageCenter.x)
    let dy = abs(documentCenter.y - imageCenter.y)
    return dx <= margin * imageSize.width && dy <= margin * imageSize.height
  }

  @available(iOS 13.0, *)
  public static func doesContainText(_ pixelBuffer: CVPixelBuffer, in region: CGRect) -> Bool {
    let imageRequestHandler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
    let textRequest = VNRecognizeTextRequest()
    textRequest.regionOfInterest = region
    textRequest.recognitionLevel = .fast
    textRequest.usesLanguageCorrection = false

    do {
       try imageRequestHandler.perform([textRequest])
    } catch {
       print("Failed to perform the request: \(error)")
       return false
    }

    guard let results = textRequest.results else { return false }
    return !results.isEmpty
  }

  @available(iOS 15.0, *)
  public static func detectIsDocument(_ pixelBuffer: CVPixelBuffer, minimumSizeRatio: CGFloat = 0.55) -> Bool {
    let imageRequestHandler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
    let rectangleRequest = VNDetectRectanglesRequest()

    rectangleRequest.minimumAspectRatio = VNAspectRatio(MINIMUM_DOCUMENT_ASPECT_RATIO)
    rectangleRequest.maximumAspectRatio = VNAspectRatio(MAXIMUM_DOCUMENT_ASPECT_RATIO)
    rectangleRequest.quadratureTolerance = 20.0

    do {
       try imageRequestHandler.perform([rectangleRequest])
    } catch {
       print("Failed to perform the request: \(error)")
       return false
    }

    guard let results = rectangleRequest.results else { return false }
    let imageSize = CGSize(width: CVPixelBufferGetWidth(pixelBuffer), height: CVPixelBufferGetHeight(pixelBuffer))

    for observation in results {
       if let rectangleObservation = observation as? VNRectangleObservation {
           if #available(iOS 13.0, *) {
               let containsText = doesContainText(pixelBuffer, in: rectangleObservation.boundingBox)
               let isCentered = isDocumentCentered(imageSize, documentBoundingBox: rectangleObservation.boundingBox)
               if containsText && isCentered {
                   return true
               }
           }
       }
    }
    return false
  }

  @objc override public func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any {
    let buffer = frame.buffer
    var isDocument = false
    
    if #available(iOS 15.0, *) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(buffer) else {
            return [
                "isDocument": false,
            ]
        }
        return [
          "isDocument": DocumentDetectionPlugin.detectIsDocument(pixelBuffer)
        ]
    }
    return [
        "isDocument": false,
    ]
  }
}
