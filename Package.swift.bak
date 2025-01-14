// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.
// test 44

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
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/0.5.0/SwiftOnboardingComponentsShared.xcframework.zip",
            checksum: "e1179a6037c43cbc857e9346e2a38e91b8b43499773255ed5f503ad202bd7376"
        ),        // Define the internal target that depends on the binary target.
        .target(
            name: "Footprint",
            dependencies: ["SwiftOnboardingComponentsShared"]
        )
    ]
)
