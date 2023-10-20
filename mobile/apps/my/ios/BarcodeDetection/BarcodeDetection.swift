import VisionCamera
import AVFoundation
import CoreImage
import CoreVideo
import Vision
import CoreMotion

@objc(BarcodeDetectionPlugin)
public class BarcodeDetectionPlugin: FrameProcessorPlugin {
  public override init(options: [AnyHashable: Any]! = [:]) {
    super.init(options: options)
  }
  
  @available(iOS 13.0, *)
  public static func detectBarcodes(_ pixelBuffer: CVPixelBuffer) -> [[String: String]]? {
    let imageRequestHandler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
    let barcodeRequest = VNDetectBarcodesRequest()

    do {
      try imageRequestHandler.perform([barcodeRequest])
    } catch {
      print("Failed to perform the request: \(error)")
      return nil
    }

    guard let results = barcodeRequest.results else { return nil }

    var barcodes = [[String: String]]()
    for observation in results {
      if let barcodeObservation = observation as? VNBarcodeObservation {
        var barcodeInfo = [String: String]()
        barcodeInfo["kind"] = barcodeObservation.symbology.rawValue
        barcodeInfo["content"] = barcodeObservation.payloadStringValue ?? ""
        barcodes.append(barcodeInfo)
      }
    }
    return barcodes
  }

  @objc override public func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any {
    let buffer = frame.buffer
    var barcodes: [[String: Any]]? = nil
        
    if #available(iOS 13.0, *) {
      guard let pixelBuffer = CMSampleBufferGetImageBuffer(buffer) else {
        return [
          "barcodes": []
        ]
      }
      barcodes = BarcodeDetectionPlugin.detectBarcodes(pixelBuffer)
    }
    return [
      "barcodes": barcodes
    ]
  }
}
