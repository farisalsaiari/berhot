import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case httpError(Int, String?)
    case decodingError(Error)
    case networkError(Error)
    case unauthorized
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .httpError(let code, let msg): return msg ?? "Request failed (\(code))"
        case .decodingError: return "Failed to process response"
        case .networkError(let err): return err.localizedDescription
        case .unauthorized: return "Session expired. Please sign in again."
        case .unknown: return "An unknown error occurred"
        }
    }
}

actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let decoder: JSONDecoder
    private var isRefreshing = false

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)
        self.decoder = JSONDecoder()
    }

    // MARK: - Identity API (auth, users)

    func identityRequest<T: Decodable>(
        _ method: String,
        path: String,
        body: Encodable? = nil,
        authenticated: Bool = false
    ) async throws -> T {
        return try await request(method, baseURL: AppConfig.identityBaseURL, path: path, body: body, authenticated: authenticated, includeTenantId: false)
    }

    // MARK: - POS API (products, orders, payments)

    func posRequest<T: Decodable>(
        _ method: String,
        path: String,
        body: Encodable? = nil,
        authenticated: Bool = true
    ) async throws -> T {
        return try await request(method, baseURL: AppConfig.posBaseURL, path: path, body: body, authenticated: authenticated, includeTenantId: true)
    }

    // MARK: - Core Request

    private func request<T: Decodable>(
        _ method: String,
        baseURL: String,
        path: String,
        body: Encodable?,
        authenticated: Bool,
        includeTenantId: Bool,
        isRetry: Bool = false
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if authenticated, let token = KeychainHelper.readString(forKey: "access_token") {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if includeTenantId {
            let tenantId = AppConfig.tenantId
            if !tenantId.isEmpty {
                urlRequest.setValue(tenantId, forHTTPHeaderField: "X-Tenant-ID")
            }
        }

        if let body = body {
            urlRequest.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: urlRequest)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.unknown
        }

        // Handle 401 — attempt token refresh
        if httpResponse.statusCode == 401 && authenticated && !isRetry {
            let refreshed = await refreshToken()
            if refreshed {
                return try await request(method, baseURL: baseURL, path: path, body: body, authenticated: authenticated, includeTenantId: includeTenantId, isRetry: true)
            }
            await AuthManager.shared.signOut()
            throw APIError.unauthorized
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMsg = try? decoder.decode(ErrorResponse.self, from: data)
            throw APIError.httpError(httpResponse.statusCode, errorMsg?.error)
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    // MARK: - Token Refresh

    private func refreshToken() async -> Bool {
        guard !isRefreshing else { return false }
        isRefreshing = true
        defer { isRefreshing = false }

        guard let refreshToken = KeychainHelper.readString(forKey: "refresh_token") else {
            return false
        }

        guard let url = URL(string: "\(AppConfig.identityBaseURL)/api/v1/auth/refresh") else {
            return false
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONEncoder().encode(["refreshToken": refreshToken])

        guard let (data, response) = try? await session.data(for: request),
              let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            return false
        }

        guard let result = try? decoder.decode(RefreshResponse.self, from: data) else {
            return false
        }

        KeychainHelper.save(result.accessToken, forKey: "access_token")
        if let newRefresh = result.refreshToken {
            KeychainHelper.save(newRefresh, forKey: "refresh_token")
        }
        return true
    }
}

// MARK: - Error response helper
private struct ErrorResponse: Codable {
    let error: String?
}
