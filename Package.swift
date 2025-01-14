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
        url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/0.2.24/SwiftOnboardingComponentsShared.xcframework.zip",
        checksum: "052a66119d296e0222871ab31555047625f5a474ba9d9f6434ca02ea2b16214f"
    ),        .target(
            name: "Footprint",
            dependencies: ["SwiftOnboardingComponentsShared"]
        )
    ]
)
