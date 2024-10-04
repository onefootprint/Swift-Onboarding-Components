import Foundation

public enum FootprintErrorDomain: String {
    case general = "com.footprint.error"
    case process = "com.footprint.error.process"
    case vault = "com.footprint.error.vault"
    case onboarding = "com.footprint.error.onboarding"
    case auth = "com.footprint.error.auth"
    
}

public class FootprintError: NSError {
    
    public var underlyingError: Error?
    public var debug: String?
    public var supportId: String?
    public var context: Any?
    
    public init(message: String, debug: String? = nil, supportId: String? = nil, code: String? = nil, domain: FootprintErrorDomain = .general, underlyingError: Error? = nil, context: Any? = nil) {
        var userInfo: [String: Any] = [
            NSLocalizedDescriptionKey: message,
            NSLocalizedFailureReasonErrorKey: message
        ]
        if let debug = debug {
            userInfo["debug"] = debug
        }
        if let supportId = supportId {
            userInfo["supportId"] = supportId
        }
        let errorCode = Int(code ?? "") ?? 1000
        super.init(domain: domain.rawValue, code: errorCode, userInfo: userInfo)
        self.underlyingError = underlyingError
        self.debug = debug
        self.supportId = supportId
        self.context = context
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }
    
    public static func error(domain: FootprintErrorDomain, message: String, debug: String? = nil, supportId: String? = nil, code: String? = nil, underlyingError: Error? = nil, context: Any? = nil) -> FootprintError {
        FootprintError(message: message, debug: debug, supportId: supportId, code: code, domain: domain, underlyingError: underlyingError, context: context)
    }
   
}
