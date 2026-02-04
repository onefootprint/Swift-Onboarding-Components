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
        .package(url: "https://github.com/moneykit/moneykit-ios", from: "1.10.7"),
        .package(url: "https://github.com/plaid/plaid-link-ios", from: "6.4.2")
    ],
    targets: [
        // Define the binary target for the shared framework.
        .binaryTarget(
            name: "SwiftOnboardingComponentsShared",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/1.5.1/SwiftOnboardingComponentsShared.xcframework.zip",
            checksum: "bb65551c7b89a982d1705bdb3a7c179ff028fb3f305be962bf14aad4586a7dca"
        ),
        .target(
            name: "Footprint",
            dependencies: [
                "SwiftOnboardingComponentsShared",
                .product(name: "FingerprintPro", package: "fingerprintjs-pro-ios"),
                .product(name: "MoneyKit", package: "moneykit-ios"),
                .product(name: "LinkKit", package: "plaid-link-ios")
            ]
        )
    ]
)
