import Foundation
import UIKit
import React

@objc(DeviceAttestation)
class DeviceAttestation: NSObject {

  @objc func attest(_ webauthnPublicKey: String?, withChallenge challenge: String, callback: @escaping RCTResponseSenderBlock) -> Void {
    Task {
      do {
        let attester = try await Attester.initOrCreate()
        let attestation = try await attester.attestDevice(metadata: DataToAttest(
          model: UIDevice.current.model,
          os: UIDevice.current.systemVersion,
          webauthnPublicKey: webauthnPublicKey,
          footprintAttestationChallenge: challenge,
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

  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }

}
