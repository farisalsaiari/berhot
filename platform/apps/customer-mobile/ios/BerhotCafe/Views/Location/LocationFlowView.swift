import SwiftUI

struct LocationFlowView: View {
    @StateObject private var locationManager = LocationManager()
    @Binding var isComplete: Bool

    @State private var showMap = false
    @State private var showManualEntry = false

    var body: some View {
        ZStack {
            if showMap || showManualEntry {
                LocationMapView(
                    locationManager: locationManager,
                    isComplete: $isComplete
                )
                .transition(.move(edge: .trailing))
            } else {
                LocationPermissionView(
                    locationManager: locationManager,
                    showMap: $showMap,
                    showManualEntry: $showManualEntry
                )
                .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: showMap)
        .animation(.easeInOut(duration: 0.3), value: showManualEntry)
        .onChange(of: locationManager.authorizationStatus) { status in
            if status == .authorizedWhenInUse || status == .authorizedAlways {
                withAnimation {
                    showMap = true
                }
            }
        }
    }
}
