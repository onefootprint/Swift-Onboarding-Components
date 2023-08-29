import Foundation
import React

@objc(DeviceSignals)
class DeviceSignals: NSObject {
    
    @objc func getSignals(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        let signals: [String: Any] = ["signal1": "value1", "signal2": "value2"]
        resolver(signals)
    }
    
    // This is required to be exported and to work
    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
