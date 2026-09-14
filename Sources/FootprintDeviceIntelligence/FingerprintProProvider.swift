import FingerprintPro
#if SWIFT_PACKAGE
import Footprint
#endif

/// Device-intelligence provider backed by FingerprintPro. This is the only source that links
/// FingerprintPro, so apps that omit the `FootprintDeviceIntelligence` product never bundle it.
public final class FingerprintProProvider: FootprintDeviceIntelligenceProvider {
    public init() {}

    public func getDeviceIntelligenceCredentials(apiKey: String) async throws -> (visitorId: String, requestId: String) {
        let configuration = Configuration(apiKey: apiKey)
        let client = FingerprintProFactory.getInstance(configuration)
        let visitorIdResponse = try await client.getVisitorIdResponse()
        return (visitorIdResponse.visitorId, visitorIdResponse.requestId)
    }
}

/// One-line opt-in: registers FingerprintPro-backed device intelligence with the Footprint SDK.
public func registerFootprintDeviceIntelligence() {
    Footprint.shared.setDeviceIntelligenceProvider(FingerprintProProvider())
}
