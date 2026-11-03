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
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/2.3.0/SwiftOnboardingComponentsShared.xcframework.zip",
            checksum: "d02b02a6692b14cacc16e56bd0a1d010cde3851414cf940fc95a4fd65ce38579"
        ),
        // Camera binaries for FootprintDocumentCapture. url + checksum are rewritten per release
        // by update-shared-swift-binary.sh.
        .binaryTarget(
            name: "FootprintNativeCamera",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/2.3.0/FootprintNativeCamera.xcframework.zip",
            checksum: "1bf8b41673b7ec408948ec59f0b155530da665e5712c9311a177f17c82b77b1b"
        ),
        .binaryTarget(
            name: "FootprintNativeCameraSwift",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/2.3.0/FootprintNativeCameraSwift.xcframework.zip",
            checksum: "55489ffcb81d28c5462d9f382a433e3b7f6100df5041e94c4b5b54b2b50e9fd8"
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
