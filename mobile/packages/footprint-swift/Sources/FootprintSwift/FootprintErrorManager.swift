import Foundation

public class FootprintErrorManager {
    private var configuration: FootprintConfiguration?
    public let messagePrefix =  "@onefootprint/footprint-swift: "
    private let debugMode = false // Enable this for local development
    
    init(configuration: FootprintConfiguration?) {
        self.configuration = configuration
    }
    
    private func getErrorMsg(error: String) -> String {
        return "\(self.messagePrefix)\(error)"
    }
    
    public func log(error: String, shouldCancel: Bool? = nil) {
        let errorMsg = self.getErrorMsg(error: error)
        if debugMode {
            print(errorMsg)
        }
        if let onError = self.configuration?.onError {
            onError(errorMsg)
        }
        if let onCancel = self.configuration?.onCancel, (shouldCancel ?? false) {
            onCancel()
        }
    }
}
