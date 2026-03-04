// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Saison",
    platforms: [.iOS(.v16)],
    targets: [
        .executableTarget(
            name: "Saison",
            path: "Sources/Saison",
            resources: [
                .process("en.lproj"),
                .process("fr.lproj"),
                .process("GoogleService-Info.plist"),
            ]
        )
    ]
)
