import SwiftUI

// MARK: - Skeleton content (below real header — no header, no tabs)
// ONE TimelineView drives the pulse. No @State, no withAnimation.

struct HomeSkeletonContent: View {
    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 15.0)) { timeline in
            let t = timeline.date.timeIntervalSinceReferenceDate
            let phase = CGFloat((sin(t * 2.5) + 1.0) / 2.0)

            VStack(spacing: 0) {
                // Banner
                skeletonBanner(phase: phase)
                    .padding(.bottom, 12)

                // Category tabs
                skeletonCategoryTabs(phase: phase)
                    .padding(.bottom, 10)

                // Product rows
                skeletonProductList(phase: phase)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 100)
            }
        }
    }

    // MARK: - Banner
    private func skeletonBanner(phase: CGFloat) -> some View {
        VStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 14)
                .fill(Color(white: 0.91 + 0.06 * Double(phase)))
                .frame(height: 130)
                .padding(.horizontal, 20)

            HStack(spacing: 5) {
                Capsule().fill(Color(white: 0.82 + 0.06 * Double(phase))).frame(width: 16, height: 6)
                Capsule().fill(Color(white: 0.88 + 0.06 * Double(phase))).frame(width: 6, height: 6)
                Capsule().fill(Color(white: 0.88 + 0.06 * Double(phase))).frame(width: 6, height: 6)
            }
        }
        .padding(.top, 12)
    }

    // MARK: - Category Tabs
    private func skeletonCategoryTabs(phase: CGFloat) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(0..<5, id: \.self) { i in
                    SkeletonBox(
                        width: CGFloat([40, 75, 60, 65, 55][i]),
                        height: 32, cornerRadius: 20, phase: phase
                    )
                }
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Product List
    private func skeletonProductList(phase: CGFloat) -> some View {
        VStack(spacing: 12) {
            HStack {
                SkeletonBox(width: 100, height: 18, cornerRadius: 6, phase: phase)
                Spacer()
            }
            .padding(.top, 8)

            ForEach(0..<3, id: \.self) { _ in
                skeletonProductRow(phase: phase)
            }

            HStack {
                SkeletonBox(width: 80, height: 18, cornerRadius: 6, phase: phase)
                Spacer()
            }
            .padding(.top, 8)

            ForEach(0..<2, id: \.self) { _ in
                skeletonProductRow(phase: phase)
            }
        }
    }

    // MARK: - Product Row
    private func skeletonProductRow(phase: CGFloat) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 8) {
                SkeletonBox(width: 130, height: 14, cornerRadius: 4, phase: phase)
                SkeletonBox(height: 11, cornerRadius: 4, phase: phase)
                SkeletonBox(width: 80, height: 11, cornerRadius: 4, phase: phase)
                SkeletonBox(width: 60, height: 14, cornerRadius: 4, phase: phase)
                    .padding(.top, 2)
            }
            Spacer()

            RoundedRectangle(cornerRadius: 12)
                .fill(Color(white: 0.91 + 0.06 * Double(phase)))
                .frame(width: 100, height: 100)
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(14)
        .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
    }
}
