// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "Footprint",
    platforms: [
        .iOS(.v14)
    ],
    products: [
        // Core onboarding/KYC. Consumers who only need onboarding link this.
        .library(
            name: "Footprint", // Consumers will import "Footprint"
            targets: ["Footprint"]
        ),
        // Opt-in bank account linking. Pulls in MoneyKit; only link this if you use bank linking.
        .library(
            name: "FootprintBankLinking",
            targets: ["FootprintBankLinking"]
        ),
        // Opt-in native document capture. Pulls in the camera module; only link this if you
        // collect ID documents inline (otherwise document collection uses the hosted flow).
        .library(
            name: "FootprintDocumentCapture",
            targets: ["FootprintDocumentCapture"]
        ),
        .library(
            name: "FootprintDeviceIntelligence",
            targets: ["FootprintDeviceIntelligence"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/fingerprintjs/fingerprint-ios", from: "4.2.0"),
        .package(url: "https://github.com/moneykit/moneykit-ios", exact: "1.11.2"),
        // FootprintDocumentCapture's camera layer bridges KMM suspend/Flow to Swift via KMP-NativeCoroutines.
        .package(url: "https://github.com/rickclephas/KMP-NativeCoroutines.git", exact: "1.0.2")
    ],
    targets: [
        // Define the binary target for the shared framework.
        .binaryTarget(
            name: "SwiftOnboardingComponentsShared",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/2.4.0/SwiftOnboardingComponentsShared.xcframework.zip",
            checksum: "a9be11e88c09cdda076e3f5e38a0fff8bd976b1f9cfb3323f9d542412067824b"
        ),
        // Camera binaries for FootprintDocumentCapture. url + checksum are rewritten per release
        // by update-shared-swift-binary.sh.
        .binaryTarget(
            name: "FootprintNativeCamera",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/2.4.0/FootprintNativeCamera.xcframework.zip",
            checksum: "bcaae398c6c84891a6824b4258089b5fc18ca9454ec3798b8c02a2bd23c45e77"
        ),
        .binaryTarget(
            name: "FootprintNativeCameraSwift",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/2.4.0/FootprintNativeCameraSwift.xcframework.zip",
            checksum: "8d8af11113c7956d8d159edb40786c78ce508245ef3b06532d26dea59f5b79d8"
        ),
        .target(
            name: "Footprint",
            dependencies: [
                "SwiftOnboardingComponentsShared"
            ]
        ),
        .target(
            name: "FootprintDeviceIntelligence",
            dependencies: [
                "Footprint",
                .product(name: "Fingerprint", package: "fingerprint-ios")
            ]
        ),
        .target(
            name: "FootprintBankLinking",
            dependencies: [
                "Footprint",
                "SwiftOnboardingComponentsShared",
                .product(name: "MoneyKit", package: "moneykit-ios")
            ]
        ),
        .target(
            name: "FootprintDocumentCapture",
            dependencies: [
                "Footprint",
                "SwiftOnboardingComponentsShared",
                "FootprintNativeCameraSwift",
                "FootprintNativeCamera",
                .product(name: "KMPNativeCoroutinesCore", package: "KMP-NativeCoroutines"),
                .product(name: "KMPNativeCoroutinesAsync", package: "KMP-NativeCoroutines"),
                .product(name: "KMPNativeCoroutinesCombine", package: "KMP-NativeCoroutines")
            ]
        )
    ]
)
