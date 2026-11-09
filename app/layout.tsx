import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Lá số Tử Vi · Tử Vi Đẩu Số chính tông Nghê Hải Hạ',
  description: 'Dựa trên hệ Tử Vi Đẩu Số chính tông Nghê Hải Hạ, AI đọc sâu cục diện lá số, đại hạn lưu niên, phân tích toàn diện tình cảm, sự nghiệp, tài vận, sức khỏe của bạn',
  keywords: 'Tử Vi Đẩu Số, Nghê Hải Hạ, Tử Vi Đẩu Số Toàn Tập, Tử Vi Đẩu Số Toàn Thư, Cốt Tủy Phú, lá số, mệnh lý, 14 sao chính, 12 cung',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lá số Tử Vi · Tử Vi Đẩu Số chính tông Nghê Hải Hạ',
    description: 'Dựa trên hệ Tử Vi Đẩu Số chính tông Nghê Hải Hạ, AI đọc sâu cục diện lá số, đại hạn lưu niên, phân tích toàn diện tình cảm, sự nghiệp, tài vận, sức khỏe của bạn',
    url: SITE_URL,
    siteName: 'Nghiên cứu Tử Vi',
    locale: 'vi_VN',
    type: 'website',
  },
  // Xác minh nền tảng quản trị trang web (nhận verification code rồi điền vào trường tương ứng, triển khai lại là xong)
  verification: {
    // Google Search Console: thêm trang vào https://search.google.com/search-console rồi lấy mã
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('ziwei-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
