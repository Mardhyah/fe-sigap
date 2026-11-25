import './globals.css';

export const metadata = {
  title: 'Dashboard Agenda',
  description: 'Aplikasi Agenda Harian',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

