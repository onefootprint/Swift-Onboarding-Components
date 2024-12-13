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
        let package = IOSPackage();
        
        #if COCOAPODS
        if var version = frameworkBundle.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String {
            return (version, .cocoapods)
        }
        #else
            return (package.version, .spm)
        #endif
    
        return (nil, .unknown)
    }
}
