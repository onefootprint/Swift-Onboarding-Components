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
        .package(url: "https://github.com/moneykit/moneykit-ios", exact: "1.11.2"),
        .package(url: "https://github.com/plaid/plaid-link-ios", from: "6.4.2")
    ],
    targets: [
        // Define the binary target for the shared framework.
        .binaryTarget(
            name: "SwiftOnboardingComponentsShared",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/1.5.4/SwiftOnboardingComponentsShared.xcframework.zip",
            checksum: "df88fce761148933a642a9a6d4f4296ffa0af57313665efbf5e06b4f549a9bdc"
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
