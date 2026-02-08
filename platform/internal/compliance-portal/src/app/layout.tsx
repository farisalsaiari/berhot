export const metadata = {
  title: 'Berhot Compliance Portal',
  description: 'Internal compliance portal for Berhot platform',
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
