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
        .package(url: "https://github.com/fingerprintjs/fingerprintjs-pro-ios", from: "2.10.0"),
        .package(url: "https://github.com/moneykit/moneykit-ios", from: "1.9.4")
    ],
    targets: [
        // Define the binary target for the shared framework.
        .binaryTarget(
            name: "SwiftOnboardingComponentsShared",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/1.3.7/SwiftOnboardingComponentsShared.xcframework.zip",
            checksum: "871c0416f1bff74e3907fba94c71cad8e9024b19a28929286ad00a117b737b10"
        ),
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
