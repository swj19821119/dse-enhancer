import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastContainer } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DSE Enhancer - 香港DSE英语AI自适应学习平台',
  description: '每天40分钟，精准提高DSE英语成绩',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-HK">
      <body className={inter.className}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
