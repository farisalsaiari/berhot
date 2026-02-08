export const metadata = {
  title: 'Berhot Customer Support',
  description: 'Internal customer support portal for Berhot platform',
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
