// The Swift Programming Language
// https://docs.swift.org/swift-book
import SwiftOnboardingComponentsShared


@_exported import SwiftOnboardingComponentsShared

public func printPlatformInfo() {
    let package = IOSPackage();
    
    print("Package name: \(package.name)")
    print("Package version: \(package.version)")
}
