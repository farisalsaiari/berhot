import SwiftUI
import UIKit

// MARK: - In-Memory Image Cache (singleton, thread-safe)

final class ImageCacheManager {
    static let shared = ImageCacheManager()

    private let cache = NSCache<NSString, UIImage>()
    private let bgCache = NSCache<NSString, UIImage>() // Gray-bg processed images
    private let session: URLSession

    private init() {
        cache.countLimit = 150
        cache.totalCostLimit = 80 * 1024 * 1024
        bgCache.countLimit = 150
        bgCache.totalCostLimit = 80 * 1024 * 1024

        let config = URLSessionConfiguration.default
        config.urlCache = URLCache(
            memoryCapacity: 30 * 1024 * 1024,
            diskCapacity: 150 * 1024 * 1024,
            diskPath: "berhot_image_cache"
        )
        config.requestCachePolicy = .returnCacheDataElseLoad
        session = URLSession(configuration: config)
    }

    func image(for url: URL) -> UIImage? {
        cache.object(forKey: url.absoluteString as NSString)
    }

    func bgImage(for url: URL) -> UIImage? {
        bgCache.object(forKey: url.absoluteString as NSString)
    }

    func store(_ image: UIImage, for url: URL) {
        let cost = image.pngData()?.count ?? 0
        cache.setObject(image, forKey: url.absoluteString as NSString, cost: cost)
    }

    func storeBg(_ image: UIImage, for url: URL) {
        let cost = image.pngData()?.count ?? 0
        bgCache.setObject(image, forKey: url.absoluteString as NSString, cost: cost)
    }

    func load(url: URL) async -> UIImage? {
        if let cached = image(for: url) { return cached }

        do {
            let (data, response) = try await session.data(from: url)
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode),
                  let uiImage = UIImage(data: data) else { return nil }
            store(uiImage, for: url)
            return uiImage
        } catch {
            return nil
        }
    }

    /// Replaces white/near-white pixels with a gray gradient color
    /// Image stays full size — no shrinking
    func replaceWhiteWithGray(_ image: UIImage) -> UIImage {
        guard let cgImage = image.cgImage else { return image }

        let width = cgImage.width
        let height = cgImage.height
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let bytesPerPixel = 4
        let bytesPerRow = bytesPerPixel * width
        let bitmapInfo = CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue

        guard let context = CGContext(
            data: nil, width: width, height: height,
            bitsPerComponent: 8, bytesPerRow: bytesPerRow,
            space: colorSpace, bitmapInfo: bitmapInfo
        ), let _ = context.data else { return image }

        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        guard let pixelData = context.data else { return image }

        let pixels = pixelData.bindMemory(to: UInt8.self, capacity: width * height * bytesPerPixel)

        // Gray gradient target colors (top to bottom) — lighter
        // Top: RGB(245,245,245)  Bottom: RGB(235,235,235)
        let grayTop: CGFloat = 245
        let grayBottom: CGFloat = 235

        for y in 0..<height {
            // Gradient gray value for this row
            let progress = CGFloat(y) / CGFloat(max(height - 1, 1))
            let grayValue = UInt8(grayTop + (grayBottom - grayTop) * progress)

            for x in 0..<width {
                let offset = (y * width + x) * bytesPerPixel
                let r = pixels[offset]
                let g = pixels[offset + 1]
                let b = pixels[offset + 2]

                // Check if pixel is white or near-white
                if r >= 240 && g >= 240 && b >= 240 {
                    // Pure white → replace with gray
                    pixels[offset] = grayValue
                    pixels[offset + 1] = grayValue
                    pixels[offset + 2] = grayValue
                    pixels[offset + 3] = 255
                } else if r >= 220 && g >= 220 && b >= 220 {
                    // Near-white → blend toward gray for smooth transition
                    let brightness = CGFloat(max(r, g, b))
                    let blendFactor = (brightness - 220.0) / (255.0 - 220.0) // 0 at 220, 1 at 255
                    pixels[offset] = UInt8(CGFloat(r) * (1 - blendFactor) + CGFloat(grayValue) * blendFactor)
                    pixels[offset + 1] = UInt8(CGFloat(g) * (1 - blendFactor) + CGFloat(grayValue) * blendFactor)
                    pixels[offset + 2] = UInt8(CGFloat(b) * (1 - blendFactor) + CGFloat(grayValue) * blendFactor)
                }
            }
        }

        guard let result = context.makeImage() else { return image }
        return UIImage(cgImage: result, scale: image.scale, orientation: image.imageOrientation)
    }
}

// MARK: - CachedAsyncImage View

struct CachedAsyncImage<Placeholder: View>: View {
    let url: URL?
    let contentMode: ContentMode
    let placeholder: () -> Placeholder

    @State private var displayImage: UIImage?
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
            if let displayImage {
                Image(uiImage: displayImage)
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
        guard let url else { isLoading = false; return }
        let manager = ImageCacheManager.shared

        // Check processed bg cache
        if let cached = manager.bgImage(for: url) {
            displayImage = cached
            isLoading = false
            return
        }

        // Check raw cache
        if let raw = manager.image(for: url) {
            processInBackground(raw, url: url)
            return
        }

        // Fetch from network
        Task {
            guard let loaded = await manager.load(url: url) else {
                await MainActor.run { isLoading = false }
                return
            }
            await MainActor.run { processInBackground(loaded, url: url) }
        }
    }

    private func processInBackground(_ raw: UIImage, url: URL) {
        Task.detached(priority: .userInitiated) {
            let processed = ImageCacheManager.shared.replaceWhiteWithGray(raw)
            await MainActor.run {
                ImageCacheManager.shared.storeBg(processed, for: url)
                displayImage = processed
                isLoading = false
            }
        }
    }
}

// Convenience init
extension CachedAsyncImage where Placeholder == DefaultImagePlaceholder {
    init(url: URL?, contentMode: ContentMode = .fill) {
        self.init(url: url, contentMode: contentMode) { DefaultImagePlaceholder() }
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
