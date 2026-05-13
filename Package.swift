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
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/1.5.5/SwiftOnboardingComponentsShared.xcframework.zip",
            checksum: "6a041246b00e5b3fca452cdb13dcd8e3a8f4a7aafd84752ac4ac7169d6bc7b5a"
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
