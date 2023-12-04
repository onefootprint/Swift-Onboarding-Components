// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "FootprintSwift",
    products: [
        .library(
            name: "FootprintSwift",
            targets: ["FootprintSwift"]),
    ],
    targets: [
        .target(
            name: "FootprintSwift"),
        .testTarget(
            name: "FootprintSwiftTests",
            dependencies: ["FootprintSwift"]),
    ]
)
