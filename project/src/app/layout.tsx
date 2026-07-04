import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LearnSmart AI Classroom',
  description: 'Personalized AI study platform for authenticated students, uploaded materials, and practice support',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
