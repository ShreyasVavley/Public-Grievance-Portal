import Navbar from '../components/Navbar';
import './globals.css';

export const metadata = {
  title: 'Bengaluru Sahaya Portal',
  description: 'GIGW 3.0 Compliant Public Grievance Portal for Bengaluru',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700;900&family=Noto+Sans+Kannada:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        <main className="min-h-[calc(100vh-80px)] bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
