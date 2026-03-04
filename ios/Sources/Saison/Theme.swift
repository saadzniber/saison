import SwiftUI

enum Theme {
    static let bg = Color(hex: 0xFAFAF8)
    static let surface = Color.white
    static let surfaceRaised = Color(hex: 0xF5F3EF)
    static let ink = Color(hex: 0x1C1A14)
    static let inkMuted = Color(hex: 0x6B6454)
    static let inkFaint = Color(hex: 0xA8A090)
    static let border = Color(hex: 0xE5E3DD)
    static let accent = Color(hex: 0x2D5016)
    static let accentLight = Color(hex: 0x4A7A25)
    static let accentBg = Color(hex: 0xEEF4E8)
    static let warm = Color(hex: 0xD4A843)
    static let error = Color(hex: 0xB91C1C)

    static func display(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom("Fraunces", size: size).weight(weight)
    }

    static func ui(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom("DM Sans", size: size).weight(weight)
    }

    static let pagePadding: CGFloat = 20
    static let navHeight: CGFloat = 64
    static let radiusMD: CGFloat = 12
    static let radiusLG: CGFloat = 16
}

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}
