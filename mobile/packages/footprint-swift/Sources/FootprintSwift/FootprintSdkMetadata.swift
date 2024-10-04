import Foundation

internal struct FootprintSdkMetadata {
#if DEBUG
    static let bifrostBaseUrl: String = "https://id.preview.onefootprint.com"
    static let apiBaseUrl: String = "https://api.dev.onefootprint.com"
#else
    static let bifrostBaseUrl: String = "https://id.onefootprint.com"
    static let apiBaseUrl: String = "https://api.onefootprint.com"
#endif
    static let name: String = "footprint-swift"
    static let kind: String = "verify_v1"
    static let version: String = "1.0.6"
}
