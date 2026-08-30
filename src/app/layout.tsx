import type { Metadata } from "next";
import { Noto_Sans_KR, Gowun_Dodum } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { pension } from "@/lib/data";

const notoKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const gowun = Gowun_Dodum({
  variable: "--font-gowun",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${pension.name} | 가평 숲속 펜션`,
    template: `%s | ${pension.name}`,
  },
  description: `${pension.tagline} · 경기도 가평 상면, 세 동에 여섯 개 객실만 있는 조용한 숲속 펜션.`,
  keywords: ["가평펜션", "숲속펜션", "마음속쉼터", "가평 숙소", "커플펜션"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoKr.variable} ${gowun.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
