import Foundation

public enum PackageInstallationType {
    case spm
    case cocoapods
    case unknown
}

public final class PackageInfo: NSObject {
    /// Get the version and installation type for the current package
    public static func getCurrentPackageInfo() -> (version: String?, installationType: PackageInstallationType) {
        // For the current package/framework
        let frameworkBundle = Bundle(for: PackageInfo.self)
        
        // Try getting version from the main bundle first (SPM case)
        if let version = frameworkBundle.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String {
            // Check if it's CocoaPods by looking for CocoaPods-specific files
            let isCocoaPods = frameworkBundle.path(forResource: "Pods-Environment", ofType: "plist") != nil
            return (version, isCocoaPods ? .cocoapods : .spm)
        }
        
        // Fallback to checking Info.plist in the framework bundle (CocoaPods case)
        if let path = frameworkBundle.path(forResource: "Info", ofType: "plist"),
           let infoDict = NSDictionary(contentsOfFile: path) as? [String: Any],
           let version = infoDict["CFBundleShortVersionString"] as? String {
            return (version, .cocoapods)
        }
        
        return (nil, .unknown)
    }
}
