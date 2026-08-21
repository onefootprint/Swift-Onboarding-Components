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
    ],
    dependencies: [
        .package(url: "https://github.com/fingerprintjs/fingerprintjs-pro-ios", from: "2.10.0"),
        .package(url: "https://github.com/moneykit/moneykit-ios", exact: "1.11.2"),
        // FootprintDocumentCapture's camera layer bridges KMM suspend/Flow to Swift via KMP-NativeCoroutines.
        .package(url: "https://github.com/rickclephas/KMP-NativeCoroutines.git", exact: "1.0.2")
    ],
    targets: [
        // Define the binary target for the shared framework.
        .binaryTarget(
            name: "SwiftOnboardingComponentsShared",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/2.1.0/SwiftOnboardingComponentsShared.xcframework.zip",
            checksum: "f2a85e65d6fd9f3b555b69dc27893fc8a92bdae858ac3f7a528adeeccc2be5ca"
        ),
        // Camera binaries for FootprintDocumentCapture. url + checksum are rewritten per release
        // by update-shared-swift-binary.sh.
        .binaryTarget(
            name: "FootprintNativeCamera",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/2.1.0/FootprintNativeCamera.xcframework.zip",
            checksum: "f7a94cebf72c793977749594fd627113849ff1e4f66a27770269dd893cbdb530"
        ),
        .binaryTarget(
            name: "FootprintNativeCameraSwift",
            url: "https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/2.1.0/FootprintNativeCameraSwift.xcframework.zip",
            checksum: "6d6dbbb9440df192ec105926ee8590243c729677b444759cf7c1537781f646d1"
        ),
        .target(
            name: "Footprint",
            dependencies: [
                "SwiftOnboardingComponentsShared",
                .product(name: "FingerprintPro", package: "fingerprintjs-pro-ios")
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
