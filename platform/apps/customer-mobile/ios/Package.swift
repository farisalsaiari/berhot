// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BerhotCafe",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "BerhotCafe", targets: ["BerhotCafe"]),
    ],
    targets: [
        .target(
            name: "BerhotCafe",
            path: "BerhotCafe"
        ),
    ]
)
