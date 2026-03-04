import SwiftUI

struct SaisonLogo: View {
    var size: CGFloat = 56

    var body: some View {
        ZStack {
            // Background rounded square
            RoundedRectangle(cornerRadius: size * 0.286)
                .fill(Theme.accent)
                .frame(width: size, height: size)

            // Leaf shape
            LeafShape()
                .fill(Color.white.opacity(0.95))
                .frame(width: size * 0.43, height: size * 0.56)
                .offset(y: size * 0.02)

            // Center vein
            Path { path in
                let cx = size / 2
                let topY = size * 0.23
                let botY = size * 0.73
                path.move(to: CGPoint(x: cx, y: botY))
                path.addLine(to: CGPoint(x: cx, y: topY))
            }
            .stroke(Theme.accent, style: StrokeStyle(lineWidth: 1.4, lineCap: .round))

            // Left vein
            Path { path in
                let cx = size / 2
                path.move(to: CGPoint(x: cx, y: size * 0.57))
                path.addCurve(
                    to: CGPoint(x: size * 0.355, y: size * 0.46),
                    control1: CGPoint(x: cx - size * 0.055, y: size * 0.52),
                    control2: CGPoint(x: size * 0.39, y: size * 0.49)
                )
            }
            .stroke(Theme.accent.opacity(0.45), style: StrokeStyle(lineWidth: 1, lineCap: .round))

            // Right vein
            Path { path in
                let cx = size / 2
                path.move(to: CGPoint(x: cx, y: size * 0.57))
                path.addCurve(
                    to: CGPoint(x: size * 0.645, y: size * 0.46),
                    control1: CGPoint(x: cx + size * 0.055, y: size * 0.52),
                    control2: CGPoint(x: size * 0.61, y: size * 0.49)
                )
            }
            .stroke(Theme.accent.opacity(0.45), style: StrokeStyle(lineWidth: 1, lineCap: .round))
        }
        .frame(width: size, height: size)
    }
}

private struct LeafShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width
        let h = rect.height
        let cx = rect.midX

        // Start at bottom tip
        path.move(to: CGPoint(x: cx, y: h))
        // Left side up to top
        path.addCurve(
            to: CGPoint(x: cx, y: 0),
            control1: CGPoint(x: cx - w * 0.85, y: h * 0.75),
            control2: CGPoint(x: cx - w * 0.6, y: h * 0.1)
        )
        // Right side down to bottom
        path.addCurve(
            to: CGPoint(x: cx, y: h),
            control1: CGPoint(x: cx + w * 0.6, y: h * 0.1),
            control2: CGPoint(x: cx + w * 0.85, y: h * 0.75)
        )
        path.closeSubpath()
        return path
    }
}
