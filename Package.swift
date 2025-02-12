// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "Footprint",
    platforms: [
        .iOS(.v14) // Specify the minimum platform version
    ],
    products: [
        // Expose the library as "Footprint" to consumers.
        .library(
            name: "Footprint", // Consumers will import "Footprint"
            targets: ["Footprint"]
        ),
    ],
    targets: [
        // Define the binary target for the shared framework.
    .binaryTarget(
        name: "SwiftOnboardingComponentsShared",
        url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/1.0.0-beta/SwiftOnboardingComponentsShared.xcframework.zip",
        checksum: "7068a2e50652d3af53ee3b317cdd1f65849dffc4f047d42e8bed604acfc01774"
    ),        // Define the internal target that depends on the binary target.
        .target(
            name: "Footprint",
            dependencies: ["SwiftOnboardingComponentsShared"]
        )
    ]
)
