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
    dependencies: [
        .package(url: "https://github.com/fingerprintjs/fingerprintjs-pro-ios", from: "2.7.0"),
        .package(url: "https://github.com/moneykit/moneykit-ios", from: "1.9.4")
    ],
    targets: [
        // Define the binary target for the shared framework.
    .binaryTarget(
        name: "SwiftOnboardingComponentsShared",
        url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/1.0.3-beta/SwiftOnboardingComponentsShared.xcframework.zip",
        checksum: "1d3a5faaeef792ac1451a6e25b9afc92cbe2bb5d46c2f5f0f1032b60315b8c62"
    ),        // Define the internal target that depends on the binary target.
        .target(
            name: "Footprint",
            dependencies: [
                "SwiftOnboardingComponentsShared",
                .product(name: "FingerprintPro", package: "fingerprintjs-pro-ios"),
                .product(name: "MoneyKit", package: "moneykit-ios")
            ]
        )
    ]
)
