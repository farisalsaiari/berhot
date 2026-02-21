import SwiftUI
import MapKit

struct AddressSearchView: View {
    @ObservedObject var locationManager: LocationManager
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @FocusState private var isFocused: Bool
    let onSelect: (CLLocationCoordinate2D) -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search bar
                HStack(spacing: 12) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "arrow.left")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.textPrimary)
                    }

                    HStack(spacing: 8) {
                        TextField(L.enterYourAddress, text: $searchText)
                            .font(.system(size: 16))
                            .focused($isFocused)
                            .onChange(of: searchText) { query in
                                locationManager.searchAddress(query)
                            }

                        if !searchText.isEmpty {
                            Button {
                                searchText = ""
                                locationManager.searchResults = []
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 18))
                                    .foregroundColor(Color(hex: "CCCCCC"))
                            }
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(Color(hex: "F5F5F5"))
                    .cornerRadius(10)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)

                Divider()

                if searchText.isEmpty {
                    // What's your address?
                    VStack(spacing: 16) {
                        Spacer().frame(height: 40)

                        Text(L.whatIsYourAddress)
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.textPrimary)

                        // Search hint
                        HStack(spacing: 10) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 16))
                                .foregroundColor(Color(hex: "999999"))
                            Text(L.enterYourAddress)
                                .font(.system(size: 15))
                                .foregroundColor(Color(hex: "999999"))
                            Spacer()
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 12)
                        .background(Color(hex: "F5F5F5"))
                        .cornerRadius(10)
                        .padding(.horizontal, 20)
                        .onTapGesture {
                            isFocused = true
                        }

                        Spacer()
                    }
                } else {
                    // Search results
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(Array(locationManager.searchResults.enumerated()), id: \.offset) { index, result in
                                Button {
                                    Task {
                                        if let coord = await locationManager.geocodeSearchResult(result) {
                                            locationManager.userLocation = coord
                                            onSelect(coord)
                                        }
                                    }
                                } label: {
                                    HStack(spacing: 14) {
                                        Image(systemName: "mappin.circle")
                                            .font(.system(size: 20))
                                            .foregroundColor(Color(hex: "999999"))
                                            .frame(width: 28)

                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(result.title)
                                                .font(.system(size: 15, weight: .medium))
                                                .foregroundColor(.textPrimary)
                                                .lineLimit(1)

                                            if !result.subtitle.isEmpty {
                                                Text(result.subtitle)
                                                    .font(.system(size: 13))
                                                    .foregroundColor(.textSecondary)
                                                    .lineLimit(1)
                                            }
                                        }

                                        Spacer()
                                    }
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 14)
                                }

                                Divider().padding(.leading, 62)
                            }
                        }
                    }
                }

                Spacer()

                // Confirm button at bottom
                Divider()
                Button {
                    dismiss()
                } label: {
                    Text(L.confirmLocation)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color(hex: "E91E63"))
                        .cornerRadius(14)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 14)
            }
            .navigationBarHidden(true)
            .onAppear {
                isFocused = true
            }
        }
    }
}

