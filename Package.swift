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
        url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/0.2.23/SwiftOnboardingComponentsShared.xcframework.zip",
        checksum: "294982a6a9a26da333d708cc5f40d62fa2e42f0a312096e4ebb1dd4f2594795d"
    ),        .target(
            name: "Footprint",
            dependencies: ["SwiftOnboardingComponentsShared"]
        )
    ]
)
