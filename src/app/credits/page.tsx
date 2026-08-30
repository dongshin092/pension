import Image from "next/image";
import Link from "next/link";
import { photoCredits } from "@/lib/photoCredits";

export const metadata = { title: "사진 출처" };

export default function CreditsPage() {
  return (
    <section className="container-x max-w-4xl py-16 md:py-20">
      <Link href="/" className="text-sm text-forest-500 hover:text-forest-700">
        ← 홈으로
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-forest-800">사진 출처</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest-600">
        이 사이트는 MVP 데모입니다. 실제 펜션 사진 대신 Wikimedia Commons와 Openverse에서 상업적
        이용이 가능한 라이선스(CC0 · Public Domain · CC BY · CC BY-SA)의 사진을 사용했습니다. 실제
        운영 시에는 펜션에서 촬영한 사진으로 교체하고 이 페이지는 삭제하면 됩니다.
      </p>

      <ul className="mt-10 space-y-3">
        {photoCredits.map((c) => (
          <li
            key={c.file}
            className="flex items-center gap-4 rounded-2xl border border-forest-100 bg-white p-3"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
              <Image src={c.file} alt={c.title} fill sizes="120px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium text-forest-800">{c.title}</p>
              <p className="mt-0.5 text-xs text-forest-500">
                {c.creator} ·{" "}
                {c.licenseUrl ? (
                  <a
                    href={c.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-forest-700"
                  >
                    {c.license}
                  </a>
                ) : (
                  c.license
                )}
              </p>
              <p className="mt-0.5 truncate text-xs text-forest-400">{c.file}</p>
            </div>
            {c.source && (
              <a
                href={c.source}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full border border-forest-200 px-4 py-2 text-xs font-semibold text-forest-600 hover:bg-forest-50"
              >
                원본
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
