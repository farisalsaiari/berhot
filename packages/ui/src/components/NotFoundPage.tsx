interface NotFoundPageProps {
  homeHref?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
}

export function NotFoundPage({
  homeHref,
  title = 'Page not found',
  description = "Sorry, the page you're looking for doesn't exist or has been moved.",
  actionLabel = 'Go to Home',
}: NotFoundPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="text-8xl font-bold text-gray-200 mb-4 select-none">404</div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-md">{description}</p>
      {homeHref && (
        <a
          href={homeHref}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}
