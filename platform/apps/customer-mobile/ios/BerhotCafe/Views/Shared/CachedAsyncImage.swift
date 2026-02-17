import SwiftUI
import UIKit

// MARK: - In-Memory Image Cache (singleton, thread-safe)

final class ImageCacheManager {
    static let shared = ImageCacheManager()

    private let cache = NSCache<NSString, UIImage>()
    private let session: URLSession

    private init() {
        cache.countLimit = 150           // max 150 images in memory
        cache.totalCostLimit = 80 * 1024 * 1024  // ~80 MB

        // URLSession with disk cache for network layer
        let config = URLSessionConfiguration.default
        config.urlCache = URLCache(
            memoryCapacity: 30 * 1024 * 1024,   // 30 MB memory
            diskCapacity: 150 * 1024 * 1024,     // 150 MB disk
            diskPath: "berhot_image_cache"
        )
        config.requestCachePolicy = .returnCacheDataElseLoad
        session = URLSession(configuration: config)
    }

    func image(for url: URL) -> UIImage? {
        cache.object(forKey: url.absoluteString as NSString)
    }

    func store(_ image: UIImage, for url: URL) {
        let cost = image.pngData()?.count ?? 0
        cache.setObject(image, forKey: url.absoluteString as NSString, cost: cost)
    }

    func load(url: URL) async -> UIImage? {
        // 1. Check in-memory cache first
        if let cached = image(for: url) {
            return cached
        }

        // 2. Fetch from network (URLSession disk cache kicks in too)
        do {
            let (data, response) = try await session.data(from: url)
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode),
                  let uiImage = UIImage(data: data) else {
                return nil
            }

            // 3. Store in memory cache
            store(uiImage, for: url)
            return uiImage
        } catch {
            return nil
        }
    }
}

// MARK: - CachedAsyncImage View

/// Drop-in replacement for AsyncImage with:
/// - Shimmer skeleton placeholder while loading
/// - In-memory + disk caching — scroll back = instant, no refetch
struct CachedAsyncImage<Placeholder: View>: View {
    let url: URL?
    let contentMode: ContentMode
    let placeholder: () -> Placeholder

    @State private var image: UIImage?
    @State private var isLoading = true

    init(
        url: URL?,
        contentMode: ContentMode = .fill,
        @ViewBuilder placeholder: @escaping () -> Placeholder
    ) {
        self.url = url
        self.contentMode = contentMode
        self.placeholder = placeholder
    }

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
            } else if isLoading {
                ShimmerView()
            } else {
                placeholder()
            }
        }
        .onAppear { loadImage() }
    }

    private func loadImage() {
        guard let url else {
            isLoading = false
            return
        }

        // Instant hit from memory cache — no async needed
        if let cached = ImageCacheManager.shared.image(for: url) {
            self.image = cached
            self.isLoading = false
            return
        }

        // Async fetch
        Task {
            let loaded = await ImageCacheManager.shared.load(url: url)
            await MainActor.run {
                self.image = loaded
                self.isLoading = false
            }
        }
    }
}

// Convenience init with no custom placeholder (uses default icon)
extension CachedAsyncImage where Placeholder == DefaultImagePlaceholder {
    init(url: URL?, contentMode: ContentMode = .fill) {
        self.init(url: url, contentMode: contentMode) {
            DefaultImagePlaceholder()
        }
    }
}

struct DefaultImagePlaceholder: View {
    var body: some View {
        Rectangle()
            .fill(Color(hex: "F0F0F0"))
            .overlay(
                Image(systemName: "cup.and.saucer")
                    .font(.title3)
                    .foregroundColor(.textTertiary)
            )
    }
}

// MARK: - Shimmer Skeleton View

struct ShimmerView: View {
    @State private var phase: CGFloat = -1

    var body: some View {
        Rectangle()
            .fill(Color(hex: "E8E8E8"))
            .overlay(
                GeometryReader { geo in
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0),
                                    Color.white.opacity(0.4),
                                    Color.white.opacity(0),
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geo.size.width * 0.6)
                        .offset(x: phase * (geo.size.width * 1.6))
                        .onAppear {
                            withAnimation(
                                .linear(duration: 1.2)
                                .repeatForever(autoreverses: false)
                            ) {
                                phase = 1
                            }
                        }
                }
            )
            .clipped()
    }
}
