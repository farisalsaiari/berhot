import SwiftUI

struct LocationPermissionView: View {
    @ObservedObject var locationManager: LocationManager
    @Binding var showMap: Bool
    @Binding var showManualEntry: Bool

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Illustration area
            VStack(spacing: 16) {
                ZStack {
                    // Map illustration
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            LinearGradient(
                                colors: [Color(hex: "E8F5E9"), Color(hex: "FFF9C4"), Color(hex: "E3F2FD")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 180, height: 140)
                        .rotationEffect(.degrees(-5))

                    // Pin icon
                    VStack(spacing: 0) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 64))
                            .foregroundColor(Color(hex: "E91E63"))
                            .shadow(color: .black.opacity(0.2), radius: 4, y: 2)

                        // Shadow dot
                        Ellipse()
                            .fill(Color.black.opacity(0.15))
                            .frame(width: 30, height: 8)
                            .offset(y: -2)
                    }
                }
            }

            Spacer().frame(height: 40)

            // Title
            Text(L.findCafesNearYou)
                .font(.system(size: 24, weight: .bold))
                .multilineTextAlignment(.center)
                .foregroundColor(.textPrimary)

            Spacer().frame(height: 14)

            // Description
            Text(L.locationExplanation)
                .font(.system(size: 15))
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .lineSpacing(3)

            Spacer()

            // Buttons
            VStack(spacing: 12) {
                // Primary: Share location
                Button {
                    locationManager.requestPermission()
                    // After permission, transition to map
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        showMap = true
                    }
                } label: {
                    Text(L.shareMyLocation)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color(hex: "E91E63"))
                        .cornerRadius(14)
                }

                // Secondary: Enter manually
                Button {
                    showManualEntry = true
                } label: {
                    Text(L.enterAddressManually)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(hex: "E91E63"))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.clear)
                        .cornerRadius(14)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color(hex: "E91E63"), lineWidth: 1.5)
                        )
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 30)
        }
        .background(Color.white.ignoresSafeArea())
    }
}
