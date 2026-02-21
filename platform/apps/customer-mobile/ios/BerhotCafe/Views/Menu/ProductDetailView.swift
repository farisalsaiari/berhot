import SwiftUI

struct ProductDetailView: View {
    let product: Product
    @EnvironmentObject var cartManager: CartManager
    @Environment(\.dismiss) private var dismiss
    @State private var quantity = 1
    @State private var notes = ""
    @State private var addedToCart = false
    @State private var modifierGroups: [ModifierGroup] = []
    @State private var selectedModifiers: [String: Set<String>] = [:] // groupId -> set of itemIds
    @State private var isLoadingModifiers = false
    @State private var modifierError: String?

    private let brandGreen = Color(hex: "00B14F")

    private var modifierPriceTotal: Double {
        var total = 0.0
        for group in modifierGroups {
            if let selectedIds = selectedModifiers[group.id] {
                for item in group.items where selectedIds.contains(item.id) {
                    total += item.priceAdjustment
                }
            }
        }
        return total
    }

    private var unitPrice: Double {
        product.price + modifierPriceTotal
    }

    private var totalPrice: Double {
        unitPrice * Double(quantity)
    }

    private var allRequiredSelected: Bool {
        for group in modifierGroups where group.isRequired {
            let selected = selectedModifiers[group.id] ?? []
            if selected.isEmpty { return false }
        }
        return true
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Product Image
                ZStack(alignment: .topTrailing) {
                    CachedAsyncImage(url: product.resolvedImageUrl) {
                        Rectangle().fill(Color(hex: "F5F5F5"))
                            .overlay(
                                Image(systemName: "cup.and.saucer.fill")
                                    .font(.system(size: 50))
                                    .foregroundColor(.textTertiary)
                            )
                    }
                    .frame(height: 260)
                    .clipped()

                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.textPrimary)
                            .frame(width: 32, height: 32)
                            .background(.ultraThinMaterial)
                            .clipShape(Circle())
                    }
                    .padding(16)
                }

                    // Name + Price + Description
                    VStack(alignment: .leading, spacing: 8) {
                        Text(product.localizedName)
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.textPrimary)

                        Text("SAR \(String(format: "%.0f", product.price))")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(brandGreen)

                        if let desc = product.localizedDescription, !desc.isEmpty {
                            Text(desc)
                                .font(.system(size: 14))
                                .foregroundColor(.textSecondary)
                                .padding(.top, 2)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)

                    // Modifier Sections
                    if isLoadingModifiers {
                        ProgressView()
                            .padding()
                    } else if let error = modifierError {
                        VStack(spacing: 10) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 24))
                                .foregroundColor(.orange)
                            Text(error)
                                .font(.system(size: 13))
                                .foregroundColor(.textSecondary)
                                .multilineTextAlignment(.center)
                            Button {
                                Task { await loadModifiers() }
                            } label: {
                                Text(L.tryAgain)
                                    .font(.system(size: 14, weight: .bold))
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 10)
                                    .background(Color.brand)
                                    .foregroundColor(.white)
                                    .cornerRadius(10)
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity)
                        .background(Color(hex: "FAFAFA"))
                    } else {
                        ForEach(modifierGroups) { group in
                            modifierSection(group: group)
                        }
                    }

                    // Special Instructions
                    VStack(alignment: .leading, spacing: 8) {
                        Text(L.specialInstructions)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.textPrimary)

                        TextField(L.anySpecialRequests, text: $notes, axis: .vertical)
                            .lineLimit(2...4)
                            .padding(12)
                            .background(Color(hex: "F5F5F5"))
                            .cornerRadius(12)
                    }
                    .padding(16)

                    // Quantity
                    HStack {
                        Text(L.quantity)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.textPrimary)

                        Spacer()

                        HStack(spacing: 16) {
                            Button {
                                if quantity > 1 { quantity -= 1 }
                            } label: {
                                Image(systemName: "minus.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(quantity > 1 ? brandGreen : .gray.opacity(0.3))
                            }

                            Text("\(quantity)")
                                .font(.system(size: 18, weight: .bold))
                                .frame(minWidth: 30)

                            Button { quantity += 1 } label: {
                                Image(systemName: "plus.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(brandGreen)
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 100)
                }
            }
            .overlay(alignment: .bottom) {
                // Add to Cart Button
                Button {
                    addToCart()
                } label: {
                    HStack {
                        Image(systemName: addedToCart ? "checkmark" : "cart.badge.plus")
                        Text(addedToCart
                             ? L.added
                             : L.addToCartPrice(String(format: "%.0f", totalPrice)))
                            .font(.body.bold())
                    }
                    .frame(maxWidth: .infinity)
                    .padding(16)
                    .background(addedToCart ? Color.green : (allRequiredSelected ? brandGreen : Color.gray))
                    .foregroundColor(.white)
                    .cornerRadius(14)
                }
                .disabled(!allRequiredSelected || addedToCart)
                .padding(.horizontal, 16)
                .padding(.bottom, 16)
                .background(
                    LinearGradient(
                        colors: [Color.surfacePrimary.opacity(0), Color.surfacePrimary],
                        startPoint: .top, endPoint: .bottom
                    )
                    .frame(height: 60).offset(y: -30).allowsHitTesting(false)
                )
            }
        .task {
            await loadModifiers()
        }
    }

    // MARK: - Modifier Section
    @ViewBuilder
    private func modifierSection(group: ModifierGroup) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header
            HStack {
                Text(group.headerText)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.textPrimary)

                if group.isRequired {
                    Text(L.required)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.red)
                        .cornerRadius(6)
                }

                Spacer()
            }

            // Items
            ForEach(group.items) { item in
                let isSelected = selectedModifiers[group.id]?.contains(item.id) ?? false

                Button {
                    toggleModifier(group: group, item: item)
                } label: {
                    HStack(spacing: 12) {
                        // Radio / Checkbox
                        Image(systemName: group.isSingleSelect
                              ? (isSelected ? "circle.inset.filled" : "circle")
                              : (isSelected ? "checkmark.square.fill" : "square"))
                            .font(.system(size: 20))
                            .foregroundColor(isSelected ? brandGreen : Color(hex: "CCCCCC"))

                        Text(item.localizedName)
                            .font(.system(size: 14))
                            .foregroundColor(.textPrimary)

                        Spacer()

                        if let priceText = item.priceText {
                            Text(priceText)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(.textSecondary)
                        }

                        if item.isDefault {
                            Text(L.popular)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(brandGreen)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(brandGreen.opacity(0.1))
                                .cornerRadius(4)
                        }
                    }
                    .padding(.vertical, 6)
                }
            }
        }
        .padding(16)
        .background(Color(hex: "FAFAFA"))
    }

    // MARK: - Helpers

    private func toggleModifier(group: ModifierGroup, item: ModifierItem) {
        var selected = selectedModifiers[group.id] ?? []

        if group.isSingleSelect {
            selected = [item.id]
        } else {
            if selected.contains(item.id) {
                selected.remove(item.id)
            } else {
                if let max = group.maxSelections, selected.count >= max { return }
                selected.insert(item.id)
            }
        }

        selectedModifiers[group.id] = selected
    }

    private func addToCart() {
        // Build selected modifiers list
        var mods: [SelectedModifier] = []
        for group in modifierGroups {
            if let selectedIds = selectedModifiers[group.id] {
                for item in group.items where selectedIds.contains(item.id) {
                    mods.append(SelectedModifier(
                        groupId: group.id,
                        groupName: group.localizedName,
                        itemId: item.id,
                        itemName: item.localizedName,
                        priceAdjustment: item.priceAdjustment
                    ))
                }
            }
        }

        cartManager.addItem(
            product: product,
            quantity: quantity,
            notes: notes.isEmpty ? nil : notes,
            modifiers: mods
        )

        addedToCart = true
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            dismiss()
        }
    }

    private func loadModifiers() async {
        isLoadingModifiers = true
        modifierError = nil
        do {
            let groups = try await ModifierService.fetchProductModifiers(productId: product.id)
            modifierGroups = groups

            // Pre-select defaults
            for group in groups {
                var defaults = Set<String>()
                for item in group.items where item.isDefault {
                    defaults.insert(item.id)
                }
                if !defaults.isEmpty {
                    selectedModifiers[group.id] = defaults
                }
            }
        } catch {
            modifierError = L.failedLoadOptions
        }
        isLoadingModifiers = false
    }
}
