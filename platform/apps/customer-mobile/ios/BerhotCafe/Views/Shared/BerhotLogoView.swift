import SwiftUI

/// The Berhot brand logo shape — a leaf/quarter-circle form
/// Converted from the SVG path in the landing page Header.tsx
struct BerhotLogoShape: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width
        let h = rect.height
        // Scale from original viewBox 0 0 89 90
        let sx = w / 89.0
        let sy = h / 90.0

        var path = Path()

        // The Berhot logo path (translated and flipped from SVG)
        // Original: translate(44.165915, 45) scale(1, -1) translate(-44.165915, -45)
        // This creates a leaf/quarter-arc shape with flat left and bottom edges

        // Simplified control points from the SVG path
        path.move(to: CGPoint(x: 0.05 * w, y: 0.48 * h))

        // Left edge going up
        path.addLine(to: CGPoint(x: 0.05 * w, y: 0.063 * h))

        // Bottom-left corner curve
        path.addCurve(
            to: CGPoint(x: 0.065 * w, y: 0.0 * h),
            control1: CGPoint(x: 0.05 * w, y: 0.029 * h),
            control2: CGPoint(x: 0.045 * w, y: 0.0 * h)
        )

        // Bottom edge going right
        path.addLine(to: CGPoint(x: 0.065 * w, y: 0.007 * h))

        // The main curve — bottom to right
        path.addCurve(
            to: CGPoint(x: 0.78 * w, y: 0.248 * h),
            control1: CGPoint(x: 0.358 * w, y: 0.003 * h),
            control2: CGPoint(x: 0.614 * w, y: 0.073 * h)
        )

        // Continue curve up to top-right
        path.addCurve(
            to: CGPoint(x: 0.99 * w, y: 0.94 * h),
            control1: CGPoint(x: 0.946 * w, y: 0.423 * h),
            control2: CGPoint(x: 1.0 * w, y: 0.666 * h)
        )

        // Top-right corner
        path.addCurve(
            to: CGPoint(x: 0.97 * w, y: 0.997 * h),
            control1: CGPoint(x: 0.99 * w, y: 0.974 * h),
            control2: CGPoint(x: 0.99 * w, y: 0.993 * h)
        )

        // Top edge going left
        path.addLine(to: CGPoint(x: 0.487 * w, y: 0.997 * h))

        // Back down via left side curve
        path.addCurve(
            to: CGPoint(x: 0.462 * w, y: 0.933 * h),
            control1: CGPoint(x: 0.468 * w, y: 0.997 * h),
            control2: CGPoint(x: 0.46 * w, y: 0.973 * h)
        )

        // Down the left inner curve
        path.addCurve(
            to: CGPoint(x: 0.372 * w, y: 0.628 * h),
            control1: CGPoint(x: 0.465 * w, y: 0.786 * h),
            control2: CGPoint(x: 0.441 * w, y: 0.694 * h)
        )

        path.addCurve(
            to: CGPoint(x: 0.062 * w, y: 0.533 * h),
            control1: CGPoint(x: 0.302 * w, y: 0.561 * h),
            control2: CGPoint(x: 0.211 * w, y: 0.538 * h)
        )

        path.addCurve(
            to: CGPoint(x: 0.05 * w, y: 0.48 * h),
            control1: CGPoint(x: 0.0 * w, y: 0.53 * h),
            control2: CGPoint(x: 0.05 * w, y: 0.503 * h)
        )

        path.closeSubpath()
        return path
    }
}

/// Berhot logo with blue background and white shape
struct BerhotLogoView: View {
    var size: CGFloat = 40

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.22)
                .fill(Color(hex: "2563eb"))
                .frame(width: size, height: size)

            BerhotLogoShape()
                .fill(Color.white)
                .frame(width: size * 0.62, height: size * 0.62)
                .offset(x: -size * 0.01, y: size * 0.01)
        }
    }
}

/// Berhot logo icon only (no background)
struct BerhotLogoIcon: View {
    var size: CGFloat = 30
    var color: Color = Color(hex: "1a1a1a")

    var body: some View {
        BerhotLogoShape()
            .fill(color)
            .frame(width: size, height: size)
    }
}
