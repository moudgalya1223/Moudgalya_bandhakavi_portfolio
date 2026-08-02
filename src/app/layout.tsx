import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Moudgalya Bandhakavi — Full-Stack Developer & AI Engineer',
  description:
    'Senior Full-Stack Developer & AI Engineer with 4+ years experience in React, Python, AWS, and Machine Learning. Available for freelance consulting, MVP development, and AI integration.',
  keywords: [
    'Full-Stack Developer',
    'AI Engineer',
    'Python Developer',
    'React Developer',
    'AWS Lambda',
    'Machine Learning',
    'Freelance Developer',
    'Hyderabad',
    'TCS',
  ],
  authors: [{ name: 'Moudgalya Bandhakavi' }],
  openGraph: {
    title: 'Moudgalya Bandhakavi — Full-Stack Developer & AI Engineer',
    description:
      'Building scalable full-stack apps and intelligent AI systems. 4+ years at TCS. AWS Certified. GCP Certified.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
