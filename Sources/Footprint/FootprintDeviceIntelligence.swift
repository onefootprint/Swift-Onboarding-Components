import Foundation

/// Implemented by the opt-in `FootprintDeviceIntelligence` product and registered via
/// `Footprint.shared.setDeviceIntelligenceProvider`. Without a registered provider, onboarding
/// completes without the device-intelligence signal — apps already bundling FingerprintPro can
/// omit ours to avoid a duplicate native framework.
public protocol FootprintDeviceIntelligenceProvider: Sendable {
    func getDeviceIntelligenceCredentials(apiKey: String) async throws -> (visitorId: String, requestId: String)
}

internal actor DeviceIntelligenceProviderStore {
    private var provider: FootprintDeviceIntelligenceProvider?
    func set(_ provider: FootprintDeviceIntelligenceProvider) { self.provider = provider }
    func get() -> FootprintDeviceIntelligenceProvider? { provider }
}

private let deviceIntelligenceProviderStore = DeviceIntelligenceProviderStore()

extension Footprint {
    /// Registered by the opt-in `FootprintDeviceIntelligence` product to enable device intelligence.
    public func setDeviceIntelligenceProvider(_ provider: FootprintDeviceIntelligenceProvider) {
        Task { await deviceIntelligenceProviderStore.set(provider) }
    }

    public func hasDeviceIntelligence() async -> Bool {
        await deviceIntelligenceProviderStore.get() != nil
    }

    /// Device-intelligence credentials from the registered provider, or nil when none is
    /// registered so callers skip the signal instead of failing onboarding.
    internal func deviceIntelligenceCredentials(apiKey: String) async throws -> (visitorId: String, requestId: String)? {
        guard let provider = await deviceIntelligenceProviderStore.get() else { return nil }
        return try await provider.getDeviceIntelligenceCredentials(apiKey: apiKey)
    }
}
