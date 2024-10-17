// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "FootprintSwift",
    platforms: [
        .iOS(.v14),
    ],
    products: [
        .library(
            name: "FootprintSwift",
            targets: ["FootprintSwift"]),
    ],
    dependencies: [
                .package(url: "https://github.com/Open-Bytes/SwiftUIFormValidator.git", .upToNextMajor(from: "1.0.0"))
            ],
    targets: [
        .target(
            name: "FootprintSwift",
            dependencies: [
                            .product(name: "FormValidator", package: "SwiftUIFormValidator"),
                        ],
            plugins: []),
        .testTarget(
            name: "FootprintSwiftTests",
            dependencies: ["FootprintSwift"]),
    ]
)
