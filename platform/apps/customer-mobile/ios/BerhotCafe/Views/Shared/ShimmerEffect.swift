import SwiftUI

// MARK: - Skeleton Shapes
// Pure views — receive phase from parent. No @State, no animation, no TimelineView.

struct SkeletonBox: View {
    var width: CGFloat? = nil
    var height: CGFloat = 16
    var cornerRadius: CGFloat = 8
    var phase: CGFloat = 0

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius)
            .fill(Color(white: 0.91 + 0.06 * Double(phase)))
            .frame(width: width, height: height)
    }
}

struct SkeletonCircle: View {
    var size: CGFloat = 44
    var phase: CGFloat = 0

    var body: some View {
        Circle()
            .fill(Color(white: 0.91 + 0.06 * Double(phase)))
            .frame(width: size, height: size)
    }
}

// No-op so any leftover .shimmer() calls compile
extension View {
    func shimmer(active: Bool = true) -> some View { self }
}
