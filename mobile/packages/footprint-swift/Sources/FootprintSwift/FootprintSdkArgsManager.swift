import Foundation

@available(iOS 13.0, *)
public class FootprintSdkArgsManager {
    private var configuration: FootprintConfiguration
    private var errorManager: FootprintErrorManager?
    
    init(configuration: FootprintConfiguration, errorManager: FootprintErrorManager?) {
        self.configuration = configuration
        self.errorManager = errorManager
    }
    
    public func sendArgs() async throws -> String {
        let SDK_VERSION = "1.0.0"
        let apiUrl = "https://api.onefootprint.com/org/sdk_args"
        
        let token = Task { () -> String? in
            do {
                var request = URLRequest(url: URL(string: apiUrl)!)
                request.httpMethod = "POST"
                request.setValue("footprint-swift verify \(SDK_VERSION)", forHTTPHeaderField: "x-fp-client-version")
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                
                let encoder = JSONEncoder()
                encoder.keyEncodingStrategy = .convertToSnakeCase
                let encodedConfiguration = try encoder.encode(self.configuration)
                guard let configurationJSON = try? JSONSerialization.jsonObject(with: encodedConfiguration, options: []) else {
                    self.errorManager?.log(error: "Converting configuration object to JSON failed.")
                    return nil
                }
                let body = try! JSONSerialization.data(withJSONObject: [
                    "kind": "verify_v1",
                    "data": configurationJSON
                ])
                request.httpBody = body
                
                guard let (data, _) = try? await URLSession.shared.data(for: request) else {
                    self.errorManager?.log(error: "Encountered network error while saving SDK args.")
                    return nil
                }
                guard let jsonResponse = try JSONSerialization.jsonObject(with: data, options: []) as? [String: String] else {
                    self.errorManager?.log(error: "Received invalid JSON response when saving sdk args.")
                    return nil
                }
                guard let token = jsonResponse["token"] as? String else {
                    self.errorManager?.log(error: "Missing string token from SDK args.")
                    return nil
                }
                return token
            } catch {
                self.errorManager?.log(error: "Encountered error while sending SDK args: \(error)")
                return nil
            }
        }

        return try await token.value!
    }
}
