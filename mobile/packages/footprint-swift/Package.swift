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
    dependencies: [],
    targets: [
        .target(
            name: "FootprintSwift",
            dependencies: [],
            plugins: []),
        .testTarget(
            name: "FootprintSwiftTests",
            dependencies: ["FootprintSwift"]),
    ]
)
