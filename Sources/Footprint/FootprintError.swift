public struct FootprintError {
    public enum ErrorKind {
        case initializationError
        case authError
        case userError
        case decryptionError
        case vaultingError(context: [String: String]?)
        case onboardingError
        case inlineProcessNotSupported
        case inlineOtpNotSupported
        case notAllowed
        case webviewError
        case uiError
    }
    
    public let kind: ErrorKind
    public let message: String
}
