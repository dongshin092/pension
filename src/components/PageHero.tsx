import Image from "next/image";
import ForestScene from "./ForestScene";

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** public/images 아래 사진 경로. 없으면 SVG 숲 배경을 쓴다 */
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-forest-900">
      {image ? (
        <Image
          src={image}
          alt={imageAlt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <ForestScene className="absolute inset-0 h-full w-full opacity-45" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-900/80 via-forest-900/60 to-forest-900/85" />
      <div className="container-x relative py-16 md:py-24">
        <p className="text-sm font-semibold tracking-[0.2em] text-forest-200">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white drop-shadow md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-forest-100 md:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
