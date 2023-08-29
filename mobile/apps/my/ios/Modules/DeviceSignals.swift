import Foundation
import React

@objc(DeviceSignals)
class DeviceSignals: NSObject {
  
  func getSignals(webauthnPublicKey: String, footprintAttestationChallenge: String,_ callback: @escaping RCTResponseSenderBlock) {
      Task {
        do {
          let attester = try await Attester.initOrCreate()
          let attestation = try await attester.attestDevice(metadata: DataToAttest(
            model: UIDevice.current.model,
            os: UIDevice.current.systemVersion,
            webauthnPublicKey: nil, // TODO: pass in the public key from passkey registration
            footprintAttestationChallenge: "", // TODO: get from server and pass in here
            uploadedDocumentTypes: [],
            deviceCheckToken: attester.deviceToken?.base64EncodedString())
          )

          let json = JSONEncoder()
          json.keyEncodingStrategy = .convertToSnakeCase
          json.dataEncodingStrategy = .base64
          let attestationJson = try json.encode(attestation).base64EncodedString()

          let signals: [String: Any] = ["attestation": attestationJson]
          callback([NSNull(), signals])
        } catch {
          let error: [String: Any] = ["error": "\(error)"]
          callback([NSNull(), error])
        }
      }
    }
        
    // This is required to be exported and to work
    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
