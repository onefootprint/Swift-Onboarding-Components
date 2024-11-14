// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "SwiftOnboardingComponentsInternal",
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "SwiftOnboardingComponentsInternal",
            targets: ["SwiftOnboardingComponentsInternal"]),
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .binaryTarget(
            name: "SwiftOnboardingComponentsShared",
            url: "https://github.com/onefootprint/SwiftOnboardingComponentsShared/releases/download/0.0.3/SwiftOnboardingComponentsShared.xcframework.zip",
            checksum: "9774566e11c1f7afe4b7d765e725a4e2d1349b912ae0d08b05af976b266aa281"
        ),
        .target(
            name: "SwiftOnboardingComponentsInternal",
            dependencies: ["SwiftOnboardingComponentsShared"]
        ),
        .testTarget(
            name: "SwiftOnboardingComponentsInternalTests",
            dependencies: ["SwiftOnboardingComponentsInternal"]
        ),
    ]
)
