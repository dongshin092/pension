import Image from "next/image";
import Link from "next/link";
import { heroImages, pension } from "@/lib/data";

/** 로그인 / 회원가입 공용 화면 틀 (왼쪽 숲 이미지 + 오른쪽 폼) */
export default function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <section className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* 왼쪽 숲 패널 */}
      <div className="relative isolate hidden overflow-hidden bg-forest-900 lg:block">
        <Image
          src={heroImages.auth}
          alt="숲속 펜션 전경"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/45 to-forest-900/55" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="font-display text-xl font-bold text-white">
            {pension.name}
          </Link>
          <div>
            <p className="font-display text-3xl font-bold leading-snug text-white">
              여섯 개뿐인 방,
              <br />
              놓치지 않으시려면
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-forest-200">
              회원으로 예약하면 예약 내역을 한곳에서 확인하고, 다음 예약 때 정보를 다시 입력하지
              않아도 됩니다.
            </p>
            <p className="mt-8 text-xs text-forest-300">
              {pension.address} · {pension.phone}
            </p>
          </div>
        </div>
      </div>

      {/* 오른쪽 폼 */}
      <div className="flex items-center justify-center px-5 py-14 md:px-10">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold text-forest-800">{title}</h1>
          <p className="mt-2.5 text-sm leading-relaxed text-forest-500">{description}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-7 text-center text-sm text-forest-500">{footer}</div>
        </div>
      </div>
    </section>
  );
}
