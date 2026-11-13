import './globals.css';

export const metadata = {
  title: 'Dashboard Agenda Pimpinan',
  description: 'Aplikasi Agenda Harian dan Mingguan Pimpinan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

