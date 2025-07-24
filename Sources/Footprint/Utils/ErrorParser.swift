import Foundation

public func isFootprintException(_ error: Any) -> Bool {
    if let nsError = error as? NSError,
       nsError.domain == "KotlinException",
       let footprintException = nsError.userInfo["KotlinException"] as? FootprintException {
        return true
    }
    return false
}

public func extractFootprintException(_ error: Any) -> FootprintException? {
    if let nsError = error as? NSError,
       nsError.domain == "KotlinException",
       let footprintException = nsError.userInfo["KotlinException"] as? FootprintException {
        return footprintException
    }
    return nil
}
