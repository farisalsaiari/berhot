export const metadata = {
  title: 'Berhot Developer Portal',
  description: 'Developer portal for the Berhot platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
