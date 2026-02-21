import SwiftUI

struct RateOrderView: View {
    let orderId: String
    let orderItems: [OrderItem]?
    @Environment(\.dismiss) private var dismiss
    @State private var overallRating = 0
    @State private var comment = ""
    @State private var selectedTags: Set<String> = []
    @State private var itemRatings: [String: Int] = [:]  // productId -> rating
    @State private var isSubmitting = false
    @State private var submitted = false
    @State private var currentStep: ReviewStep = .items
    @State private var showThankYou = false

    private let brandGreen = Color(hex: "00B14F")

    enum ReviewStep {
        case items, overall, tags
    }

    private var quickTags: [String] {[
        L.tagGreatFood, L.tagFastDelivery, L.tagFriendlyStaff,
        L.tagGoodPackaging, L.tagFreshHot, L.tagValueForMoney
    ]}

    // Get unique items by productId
    private var uniqueItems: [OrderItem] {
        guard let items = orderItems else { return [] }
        var seen = Set<String>()
        return items.filter { item in
            let key = item.productId
            if seen.contains(key) { return false }
            seen.insert(key)
            return true
        }
    }

    private var hasItems: Bool {
        !uniqueItems.isEmpty
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color(hex: "FAFAFA").ignoresSafeArea()

                if showThankYou {
                    thankYouView
                } else {
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 0) {
                            // Progress bar
                            progressBar
                                .padding(.top, 8)
                                .padding(.horizontal, 16)

                            if hasItems && currentStep == .items {
                                itemRatingSection
                            } else if currentStep == .overall || !hasItems {
                                overallRatingSection
                            } else if currentStep == .tags {
                                tagsAndCommentSection
                            }
                        }
                        .padding(.bottom, 120)
                    }

                    // Bottom action
                    VStack {
                        Spacer()
                        bottomButton
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    if currentStep != .items || !hasItems {
                        Button {
                            withAnimation(.easeInOut(duration: 0.25)) {
                                goBack()
                            }
                        } label: {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.textPrimary)
                        }
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 22))
                            .foregroundColor(Color(hex: "D0D0D0"))
                    }
                }
            }
        }
    }

    // MARK: - Progress Bar

    private var progressBar: some View {
        let totalSteps = hasItems ? 3 : 2
        let currentIndex: Int = {
            switch currentStep {
            case .items: return 0
            case .overall: return hasItems ? 1 : 0
            case .tags: return hasItems ? 2 : 1
            }
        }()

        return HStack(spacing: 6) {
            ForEach(0..<totalSteps, id: \.self) { i in
                Capsule()
                    .fill(i <= currentIndex ? brandGreen : Color(hex: "E0E0E0"))
                    .frame(height: 4)
                    .animation(.easeInOut(duration: 0.3), value: currentIndex)
            }
        }
    }

    // MARK: - Item Rating Section

    private var itemRatingSection: some View {
        VStack(spacing: 20) {
            // Header
            VStack(spacing: 6) {
                Text(L.rateYourItems)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.textPrimary)
                Text(L.howDidEachItemTaste)
                    .font(.system(size: 15))
                    .foregroundColor(.textSecondary)
            }
            .padding(.top, 24)

            // Item cards
            VStack(spacing: 12) {
                ForEach(Array(uniqueItems.enumerated()), id: \.offset) { index, item in
                    ItemRatingCard(
                        item: item,
                        rating: itemRatings[item.productId] ?? 0,
                        onRate: { stars in
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                                itemRatings[item.productId] = stars
                            }
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }
                    )
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
                }
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Overall Rating Section

    private var overallRatingSection: some View {
        VStack(spacing: 24) {
            Spacer().frame(height: 40)

            // Cafe icon
            ZStack {
                Circle()
                    .fill(brandGreen.opacity(0.1))
                    .frame(width: 80, height: 80)
                Image(systemName: "cup.and.saucer.fill")
                    .font(.system(size: 36))
                    .foregroundColor(brandGreen)
            }

            VStack(spacing: 6) {
                Text(L.overallExperience)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.textPrimary)
                Text(L.howWasOverallOrder)
                    .font(.system(size: 15))
                    .foregroundColor(.textSecondary)
            }

            // Star Rating
            HStack(spacing: 14) {
                ForEach(1...5, id: \.self) { star in
                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                            overallRating = star
                        }
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: star <= overallRating ? "star.fill" : "star")
                                .font(.system(size: 40))
                                .foregroundColor(star <= overallRating ? .orange : Color(hex: "D0D0D0"))
                                .scaleEffect(star <= overallRating ? 1.15 : 1.0)
                                .shadow(
                                    color: star <= overallRating ? .orange.opacity(0.3) : .clear,
                                    radius: 4, y: 2
                                )
                        }
                    }
                }
            }

            if overallRating > 0 {
                Text(ratingLabel)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(ratingColor)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 8)
                    .background(ratingColor.opacity(0.1))
                    .cornerRadius(20)
                    .transition(.scale.combined(with: .opacity))
            }

            // Item ratings summary (if items were rated)
            if !itemRatings.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text(L.itemRatings)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.textTertiary)
                        .textCase(.uppercase)

                    ForEach(uniqueItems, id: \.productId) { item in
                        if let rating = itemRatings[item.productId], rating > 0 {
                            HStack(spacing: 8) {
                                Text(item.displayName)
                                    .font(.system(size: 14))
                                    .foregroundColor(.textSecondary)
                                    .lineLimit(1)
                                Spacer()
                                HStack(spacing: 2) {
                                    ForEach(1...5, id: \.self) { s in
                                        Image(systemName: s <= rating ? "star.fill" : "star")
                                            .font(.system(size: 10))
                                            .foregroundColor(s <= rating ? .orange : Color(hex: "D0D0D0"))
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(14)
                .background(Color(hex: "F5F5F5"))
                .cornerRadius(12)
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Tags & Comment Section

    private var tagsAndCommentSection: some View {
        VStack(spacing: 24) {
            Spacer().frame(height: 24)

            // Overall rating recap
            HStack(spacing: 8) {
                ForEach(1...5, id: \.self) { s in
                    Image(systemName: s <= overallRating ? "star.fill" : "star")
                        .font(.system(size: 16))
                        .foregroundColor(s <= overallRating ? .orange : Color(hex: "D0D0D0"))
                }
                Text(ratingLabel)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.textSecondary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(Color(hex: "FFF8EE"))
            .cornerRadius(12)

            VStack(spacing: 6) {
                Text(L.whatStoodOut)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.textPrimary)
                Text(L.pickTagsDescribe)
                    .font(.system(size: 15))
                    .foregroundColor(.textSecondary)
            }

            // Quick Tags
            FlowLayout(spacing: 8) {
                ForEach(quickTags, id: \.self) { tag in
                    Button {
                        withAnimation(.spring(response: 0.25)) {
                            if selectedTags.contains(tag) {
                                selectedTags.remove(tag)
                            } else {
                                selectedTags.insert(tag)
                            }
                        }
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    } label: {
                        HStack(spacing: 4) {
                            if selectedTags.contains(tag) {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 10, weight: .bold))
                            }
                            Text(tag)
                                .font(.system(size: 14, weight: .medium))
                        }
                        .foregroundColor(selectedTags.contains(tag) ? .white : .textPrimary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(selectedTags.contains(tag) ? brandGreen : Color(hex: "F0F0F0"))
                        .cornerRadius(24)
                    }
                }
            }
            .padding(.horizontal, 16)

            // Comment
            VStack(alignment: .leading, spacing: 8) {
                Text(L.additionalComments)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.textTertiary)
                    .textCase(.uppercase)

                TextField(L.shareYourThoughts, text: $comment, axis: .vertical)
                    .lineLimit(3...6)
                    .padding(14)
                    .background(Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color(hex: "E0E0E0"), lineWidth: 1)
                    )
                    .cornerRadius(12)
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Thank You View

    private var thankYouView: some View {
        VStack(spacing: 20) {
            Spacer()

            ZStack {
                Circle()
                    .fill(brandGreen.opacity(0.1))
                    .frame(width: 120, height: 120)
                    .scaleEffect(showThankYou ? 1 : 0.3)

                Circle()
                    .fill(brandGreen)
                    .frame(width: 80, height: 80)
                    .scaleEffect(showThankYou ? 1 : 0)

                Image(systemName: "heart.fill")
                    .font(.system(size: 36))
                    .foregroundColor(.white)
                    .scaleEffect(showThankYou ? 1 : 0)
            }
            .animation(.spring(response: 0.6, dampingFraction: 0.6), value: showThankYou)

            Text(L.thankYou)
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.textPrimary)

            Text(L.feedbackHelpsImprove)
                .font(.system(size: 16))
                .foregroundColor(.textSecondary)

            // Show what was rated
            if overallRating > 0 {
                HStack(spacing: 4) {
                    ForEach(1...5, id: \.self) { s in
                        Image(systemName: s <= overallRating ? "star.fill" : "star")
                            .font(.system(size: 22))
                            .foregroundColor(s <= overallRating ? .orange : Color(hex: "D0D0D0"))
                    }
                }
                .padding(.top, 4)
            }

            Spacer()
        }
        .onAppear {
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                dismiss()
            }
        }
    }

    // MARK: - Bottom Button

    private var bottomButton: some View {
        VStack(spacing: 10) {
            // Main action button
            Button {
                handleAction()
            } label: {
                HStack(spacing: 8) {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    }
                    Text(actionButtonTitle)
                        .font(.system(size: 16, weight: .bold))
                    if !isSubmitting && currentStep != .tags {
                        Image(systemName: "arrow.right")
                            .font(.system(size: 14, weight: .bold))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(16)
                .background(actionButtonEnabled ? brandGreen : Color.gray.opacity(0.3))
                .foregroundColor(.white)
                .cornerRadius(14)
            }
            .disabled(!actionButtonEnabled || isSubmitting)

            // Skip button
            if currentStep == .items || (currentStep == .tags) {
                Button {
                    if currentStep == .items {
                        withAnimation(.easeInOut(duration: 0.25)) { currentStep = .overall }
                    } else {
                        Task { await submitReview() }
                    }
                } label: {
                    Text(currentStep == .items ? L.skipItemRatings : L.skipAndSubmit)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.textTertiary)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 20)
        .padding(.top, 10)
        .background(
            LinearGradient(
                colors: [Color(hex: "FAFAFA").opacity(0), Color(hex: "FAFAFA")],
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(height: 30)
            .offset(y: -30),
            alignment: .top
        )
        .background(Color(hex: "FAFAFA"))
    }

    // MARK: - Helpers

    private var actionButtonTitle: String {
        switch currentStep {
        case .items: return L.continueToOverall
        case .overall: return L.continueBtn
        case .tags: return isSubmitting ? L.submitting : L.submitReview
        }
    }

    private var actionButtonEnabled: Bool {
        switch currentStep {
        case .items: return !itemRatings.isEmpty
        case .overall: return overallRating > 0
        case .tags: return true
        }
    }

    private func handleAction() {
        switch currentStep {
        case .items:
            withAnimation(.easeInOut(duration: 0.25)) { currentStep = .overall }
        case .overall:
            withAnimation(.easeInOut(duration: 0.25)) { currentStep = .tags }
        case .tags:
            Task { await submitReview() }
        }
    }

    private func goBack() {
        switch currentStep {
        case .items: break
        case .overall:
            if hasItems { currentStep = .items } else { break }
        case .tags:
            currentStep = .overall
        }
    }

    private var ratingLabel: String {
        switch overallRating {
        case 1: return L.ratingPoor
        case 2: return L.ratingFair
        case 3: return L.ratingGood
        case 4: return L.ratingVeryGood
        case 5: return L.ratingExcellent
        default: return ""
        }
    }

    private var ratingColor: Color {
        switch overallRating {
        case 1: return .red
        case 2: return .orange
        case 3: return Color(hex: "FFB300")
        case 4: return Color(hex: "7CB342")
        case 5: return brandGreen
        default: return .gray
        }
    }

    // MARK: - Submit

    private func submitReview() async {
        isSubmitting = true

        let tagText = selectedTags.joined(separator: ", ")
        let fullComment = [tagText, comment].filter { !$0.isEmpty }.joined(separator: ". ")

        // Build item-level ratings
        let itemRatingsList: [CreateItemRating] = uniqueItems.compactMap { item in
            guard let rating = itemRatings[item.productId], rating > 0 else { return nil }
            return CreateItemRating(
                productId: item.productId,
                productName: item.displayName,
                rating: rating,
                comment: nil
            )
        }

        let request = CreateReviewRequest(
            orderId: orderId,
            customerId: AuthManager.shared.currentUser?.id ?? "",
            rating: overallRating,
            comment: fullComment.isEmpty ? nil : fullComment,
            itemRatings: itemRatingsList.isEmpty ? nil : itemRatingsList
        )

        do {
            _ = try await ReviewService.createReview(request: request)
            withAnimation(.spring(response: 0.6, dampingFraction: 0.6)) {
                showThankYou = true
            }
        } catch {
            print("Failed to submit review: \(error)")
        }

        isSubmitting = false
    }
}

// MARK: - Item Rating Card

struct ItemRatingCard: View {
    let item: OrderItem
    let rating: Int
    let onRate: (Int) -> Void

    private let brandGreen = Color(hex: "00B14F")

    var body: some View {
        VStack(spacing: 12) {
            // Item info
            HStack(spacing: 10) {
                // Item emoji/icon
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color(hex: "F5F5F5"))
                        .frame(width: 44, height: 44)
                    Text(itemEmoji(item.displayName))
                        .font(.system(size: 22))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(item.displayName)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.textPrimary)
                        .lineLimit(1)

                    HStack(spacing: 4) {
                        Text("x\(item.quantity)")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(brandGreen)
                        if let mods = item.modifiers, !mods.isEmpty {
                            let modNames = mods.compactMap(\.name).joined(separator: ", ")
                            if !modNames.isEmpty {
                                Text("·")
                                    .foregroundColor(.textTertiary)
                                Text(modNames)
                                    .font(.system(size: 12))
                                    .foregroundColor(.textTertiary)
                                    .lineLimit(1)
                            }
                        }
                    }
                }

                Spacer()
            }

            // Stars
            HStack(spacing: 10) {
                ForEach(1...5, id: \.self) { star in
                    Button {
                        onRate(star)
                    } label: {
                        Image(systemName: star <= rating ? "star.fill" : "star")
                            .font(.system(size: 26))
                            .foregroundColor(star <= rating ? .orange : Color(hex: "D0D0D0"))
                            .scaleEffect(star <= rating ? 1.1 : 1.0)
                    }
                }
            }

            // Rating label
            if rating > 0 {
                Text(itemRatingLabel(rating))
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.textSecondary)
                    .transition(.opacity)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
    }

    private func itemRatingLabel(_ r: Int) -> String {
        switch r {
        case 1: return L.itemRatingNotGood
        case 2: return L.itemRatingCouldBeBetter
        case 3: return L.itemRatingOkay
        case 4: return L.itemRatingLikedIt
        case 5: return L.itemRatingLovedIt
        default: return ""
        }
    }

    private func itemEmoji(_ name: String) -> String {
        let lower = name.lowercased()
        if lower.contains("espresso") || lower.contains("coffee") || lower.contains("latte") ||
           lower.contains("cappuccino") || lower.contains("brew") || lower.contains("mocha") ||
           lower.contains("flat white") || lower.contains("arabic") {
            return "☕️"
        }
        if lower.contains("chocolate") || lower.contains("brownie") { return "🍫" }
        if lower.contains("croissant") { return "🥐" }
        if lower.contains("muffin") { return "🧁" }
        if lower.contains("cinnamon") { return "🍩" }
        if lower.contains("cheesecake") || lower.contains("cake") { return "🍰" }
        if lower.contains("tiramisu") { return "🍮" }
        if lower.contains("matcha") { return "🍵" }
        if lower.contains("frappe") || lower.contains("iced") { return "🧊" }
        if lower.contains("granola") || lower.contains("bowl") { return "🥣" }
        if lower.contains("avocado") || lower.contains("toast") { return "🥑" }
        if lower.contains("lavender") { return "💜" }
        if lower.contains("tea") { return "🫖" }
        return "🍽️"
    }
}
