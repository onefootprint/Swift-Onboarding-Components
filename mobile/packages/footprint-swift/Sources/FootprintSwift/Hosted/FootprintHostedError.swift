public struct FootprintHostedError: Error {
    public enum ErrorKind {
        case presentationError
        case authError
        case httpRequestError
        case exceptionError
    }
    
    public let kind: ErrorKind
    public let message: String
}
