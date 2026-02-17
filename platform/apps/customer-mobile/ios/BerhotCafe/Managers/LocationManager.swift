import Foundation
import CoreLocation
import MapKit

@MainActor
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    static let shared = LocationManager()

    private let manager = CLLocationManager()
    @Published var userLocation: CLLocationCoordinate2D?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var address: String = ""
    @Published var city: String = ""
    @Published var country: String = ""
    @Published var postalCode: String = ""
    @Published var isGeocoding = false
    @Published var searchResults: [MKLocalSearchCompletion] = []

    private var searchCompleter = MKLocalSearchCompleter()
    private var searchDelegate: SearchCompleterDelegate?

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        authorizationStatus = manager.authorizationStatus

        searchDelegate = SearchCompleterDelegate { [weak self] results in
            Task { @MainActor in
                self?.searchResults = results
            }
        }
        searchCompleter.delegate = searchDelegate
        searchCompleter.resultTypes = .address
    }

    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    func requestLocation() {
        manager.requestLocation()
    }

    func searchAddress(_ query: String) {
        if query.isEmpty {
            searchResults = []
            return
        }
        searchCompleter.queryFragment = query
    }

    func geocodeCoordinate(_ coordinate: CLLocationCoordinate2D) async {
        isGeocoding = true
        let geocoder = CLGeocoder()
        let location = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)

        do {
            let placemarks = try await geocoder.reverseGeocodeLocation(location)
            if let pm = placemarks.first {
                let parts = [pm.subThoroughfare, pm.thoroughfare, pm.locality].compactMap { $0 }
                address = parts.joined(separator: " ")
                if address.isEmpty {
                    address = pm.name ?? "Unknown location"
                }
                city = pm.locality ?? pm.administrativeArea ?? ""
                country = pm.country ?? ""
                postalCode = pm.postalCode ?? ""

                // Auto-persist address locally so HomeView always has it
                UserDefaults.standard.set(address, forKey: "berhot_saved_address")
                UserDefaults.standard.set(coordinate.latitude, forKey: "berhot_saved_lat")
                UserDefaults.standard.set(coordinate.longitude, forKey: "berhot_saved_lng")
            }
        } catch {
            address = "Unable to get address"
        }
        isGeocoding = false
    }

    func geocodeSearchResult(_ completion: MKLocalSearchCompletion) async -> CLLocationCoordinate2D? {
        let request = MKLocalSearch.Request(completion: completion)
        let search = MKLocalSearch(request: request)
        do {
            let response = try await search.start()
            if let item = response.mapItems.first {
                let coord = item.placemark.coordinate
                address = completion.title
                city = item.placemark.locality ?? ""
                country = item.placemark.country ?? ""
                postalCode = item.placemark.postalCode ?? ""
                return coord
            }
        } catch {}
        return nil
    }

    func saveAddress(customerId: String?) async -> Bool {
        guard !address.isEmpty, let location = userLocation else { return false }

        guard let url = URL(string: "\(AppConfig.posBaseURL)/api/v1/pos/addresses") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(AppConfig.demoTenantId, forHTTPHeaderField: "X-Tenant-ID")

        var body: [String: Any] = [
            "address": address,
            "city": city,
            "country": country,
            "postalCode": postalCode,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "label": "home",
            "isDefault": true
        ]
        if let cid = customerId, !cid.isEmpty {
            body["customerId"] = cid
        }

        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        guard let (_, response) = try? await URLSession.shared.data(for: req),
              let http = response as? HTTPURLResponse,
              (200...299).contains(http.statusCode) else { return false }

        // Save locally
        UserDefaults.standard.set(address, forKey: "berhot_saved_address")
        UserDefaults.standard.set(location.latitude, forKey: "berhot_saved_lat")
        UserDefaults.standard.set(location.longitude, forKey: "berhot_saved_lng")
        return true
    }

    var hasSavedAddress: Bool {
        UserDefaults.standard.string(forKey: "berhot_saved_address") != nil
    }

    // MARK: - CLLocationManagerDelegate

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        Task { @MainActor in
            self.userLocation = location.coordinate
            await self.geocodeCoordinate(location.coordinate)
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error)")
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            self.authorizationStatus = manager.authorizationStatus
            if manager.authorizationStatus == .authorizedWhenInUse || manager.authorizationStatus == .authorizedAlways {
                self.manager.requestLocation()
            }
        }
    }
}

// MARK: - Search Completer Delegate
class SearchCompleterDelegate: NSObject, MKLocalSearchCompleterDelegate {
    let onResults: ([MKLocalSearchCompletion]) -> Void

    init(onResults: @escaping ([MKLocalSearchCompletion]) -> Void) {
        self.onResults = onResults
    }

    func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
        onResults(completer.results)
    }

    func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {}
}
