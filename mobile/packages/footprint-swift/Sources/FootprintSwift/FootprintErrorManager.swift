import Foundation

@available(iOS 13.0, *)
public class FootprintErrorManager {
    private var configuration: FootprintConfiguration?
    private let debugMode = false // Enable this for local development
    
    init(configuration: FootprintConfiguration?) {
        self.configuration = configuration
    }
    
    private func getErrorMsg(error: String) -> String {
        return "@onefootprint/footprint-swift: \(error)"
    }
    
    public func log(error: String, shouldCancel: Bool? = nil) {
        let errorMsg = self.getErrorMsg(error: error)
        if debugMode {
            print(errorMsg)
        } else {
            sendErrorLog(error: error)
        }
        if let onError = self.configuration?.onError {
            onError(errorMsg)
        }
        if let onCancel = self.configuration?.onCancel, (shouldCancel ?? false) {
            onCancel()
        }
    }
    
    public func sendErrorLog(error: String) {
        Task { () in
            do {
                var request = URLRequest(url: URL(string: "\(FootprintSdkMetadata.apiBaseUrl)/org/sdk_telemetry")!)
                request.httpMethod = "POST"
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                let encoder = JSONEncoder()
                encoder.keyEncodingStrategy = .convertToSnakeCase
                let telemetry = FootprintSdkTelemetry(
                    tenantDomain: configuration?.scheme,
                    sdkKind: FootprintSdkMetadata.kind,
                    sdkName: FootprintSdkMetadata.name,
                    sdkVersion: FootprintSdkMetadata.version,
                    logLevel: "error",
                    logMessage: error
                )
                let encodedConfiguration = try encoder.encode(telemetry)
                let configurationJSON = try? JSONSerialization.jsonObject(with: encodedConfiguration, options: [])
                let body = try JSONSerialization.data(withJSONObject: configurationJSON)
                request.httpBody = body
                try? await URLSession.shared.data(for: request)
            } catch { /* Fire and forget */ }
        }
    }
}
