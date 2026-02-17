import SwiftUI
import MapKit

struct LocationMapView: View {
    @ObservedObject var locationManager: LocationManager
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss
    @Binding var isComplete: Bool

    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 24.7136, longitude: 46.6753), // Riyadh default
        span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
    )
    @State private var showAddressSearch = false
    @State private var isSaving = false
    @State private var pinCoordinate = CLLocationCoordinate2D(latitude: 24.7136, longitude: 46.6753)

    var body: some View {
        ZStack(alignment: .top) {
            // Map
            Map(coordinateRegion: $region, annotationItems: [PinLocation(coordinate: pinCoordinate)]) { pin in
                MapAnnotation(coordinate: pin.coordinate) {
                    VStack(spacing: 0) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(Color(hex: "E91E63"))
                            .shadow(radius: 3)

                        Image(systemName: "arrowtriangle.down.fill")
                            .font(.system(size: 10))
                            .foregroundColor(Color(hex: "E91E63"))
                            .offset(y: -4)
                    }
                }
            }
            .ignoresSafeArea(edges: .top)

            // Close button
            HStack {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(Color(hex: "E91E63"))
                        .frame(width: 36, height: 36)
                        .background(Color.white)
                        .clipShape(Circle())
                        .shadow(color: .black.opacity(0.1), radius: 4, y: 2)
                }
                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)

            // My location button
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Button {
                        if let loc = locationManager.userLocation {
                            withAnimation {
                                region.center = loc
                                pinCoordinate = loc
                            }
                            Task {
                                await locationManager.geocodeCoordinate(loc)
                            }
                        }
                    } label: {
                        Image(systemName: "location.circle.fill")
                            .font(.system(size: 22))
                            .foregroundColor(Color(hex: "E91E63"))
                            .frame(width: 48, height: 48)
                            .background(Color.white)
                            .clipShape(Circle())
                            .shadow(color: .black.opacity(0.15), radius: 6, y: 3)
                    }
                    .padding(.trailing, 16)
                }
                .padding(.bottom, 16)

                // Bottom card
                bottomCard
            }
        }
        .sheet(isPresented: $showAddressSearch) {
            AddressSearchView(locationManager: locationManager) { coordinate in
                withAnimation {
                    region.center = coordinate
                    pinCoordinate = coordinate
                    locationManager.userLocation = coordinate
                }
                showAddressSearch = false
            }
        }
        .onAppear {
            if let loc = locationManager.userLocation {
                region.center = loc
                pinCoordinate = loc
            }
        }
        .onChange(of: locationManager.userLocation) { newLoc in
            if let loc = newLoc {
                withAnimation {
                    region.center = loc
                    pinCoordinate = loc
                }
            }
        }
    }

    private var bottomCard: some View {
        VStack(spacing: 14) {
            // Address info
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "mappin.and.ellipse")
                    .font(.system(size: 20))
                    .foregroundColor(Color(hex: "E91E63"))
                    .frame(width: 24)
                    .padding(.top, 2)

                VStack(alignment: .leading, spacing: 4) {
                    if locationManager.isGeocoding {
                        Text("Getting address...")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.textSecondary)
                    } else if locationManager.address.isEmpty {
                        Text("Move the map to set location")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.textSecondary)
                    } else {
                        Text(locationManager.address)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.textPrimary)
                            .lineLimit(2)

                        if !locationManager.city.isEmpty || !locationManager.postalCode.isEmpty {
                            Text([locationManager.city, locationManager.postalCode].filter { !$0.isEmpty }.joined(separator: ", "))
                                .font(.system(size: 13))
                                .foregroundColor(.textSecondary)
                        }
                    }
                }

                Spacer()

                // Edit button
                Button {
                    showAddressSearch = true
                } label: {
                    Image(systemName: "pencil")
                        .font(.system(size: 16))
                        .foregroundColor(Color(hex: "E91E63"))
                        .frame(width: 36, height: 36)
                        .background(Color(hex: "FCE4EC"))
                        .cornerRadius(8)
                }
            }

            // Info banner
            HStack(spacing: 10) {
                Image(systemName: "info.circle.fill")
                    .font(.system(size: 14))
                    .foregroundColor(Color(hex: "666666"))

                Text("Your rider will deliver to the pinned location. You can edit your written address on the next page.")
                    .font(.system(size: 13))
                    .foregroundColor(Color(hex: "666666"))
                    .lineSpacing(2)
            }
            .padding(12)
            .background(Color(hex: "F5F5F5"))
            .cornerRadius(10)

            Divider()

            // Confirm button
            Button {
                Task {
                    isSaving = true
                    locationManager.userLocation = pinCoordinate
                    let customerId = authManager.currentUser?.id
                    let _ = await locationManager.saveAddress(customerId: customerId)
                    isSaving = false
                    isComplete = true
                }
            } label: {
                HStack {
                    if isSaving {
                        ProgressView().tint(.white)
                    }
                    Text("Confirm")
                        .font(.system(size: 16, weight: .bold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color(hex: "E91E63"))
                .cornerRadius(14)
            }
            .disabled(locationManager.address.isEmpty || isSaving)
            .opacity(locationManager.address.isEmpty ? 0.5 : 1)
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20, corners: [.topLeft, .topRight])
        .shadow(color: .black.opacity(0.1), radius: 10, y: -5)
    }
}

// Helper for map annotation
struct PinLocation: Identifiable {
    let id = UUID()
    let coordinate: CLLocationCoordinate2D
}

// Custom corner radius
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

// CLLocationCoordinate2D Equatable for onChange
extension CLLocationCoordinate2D: @retroactive Equatable {
    public static func == (lhs: CLLocationCoordinate2D, rhs: CLLocationCoordinate2D) -> Bool {
        lhs.latitude == rhs.latitude && lhs.longitude == rhs.longitude
    }
}
