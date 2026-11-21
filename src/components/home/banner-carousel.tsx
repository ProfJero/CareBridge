import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const SLIDES = [
  {
    src: "/brand/banner-care.webp",
    alt: "SamBee Son and Daughter Home Care Services — personal care, meals, housekeeping, companionship and care for the elderly in Assin Foso",
    to: "/" as const,
    hash: "services",
    cta: "Explore home care",
  },
  {
    src: "/brand/banner-shop.webp",
    alt: "SamBee Son and Daughter Online Trading Center — online shopping, mobile accessories, electronics, fashion, home essentials and gifts in Assin Foso",
    to: "/shop" as const,
    hash: undefined,
    cta: "Shop online",
  },
];

export function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(id);
  }, [paused]);

  const go = (next: number) => setIndex((next + SLIDES.length) % SLIDES.length);

  return (
    <>
      {/* Desktop and tablet: both banners in full, side by side. */}
      <section className="mx-auto hidden max-w-7xl grid-cols-2 gap-5 px-5 pt-5 md:grid" aria-label="Featured">
        {SLIDES.map((slide) => (
          <Link
            key={slide.src}
            to={slide.to}
            hash={slide.hash}
            className="group block overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-14px_rgba(11,31,143,0.3)] ring-1 ring-line"
          >
            <img
              src={slide.src}
              alt={slide.alt}
              width={1280}
              height={853}
              srcSet={`${slide.src.replace(".webp", "-720.webp")} 720w, ${slide.src} 1280w`}
              sizes="(min-width: 1280px) 620px, 50vw"
              className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <span className="flex items-center justify-between border-t border-line px-5 py-3 text-base font-bold text-navy">
              {slide.cta}
              <ChevronRight className="size-5 text-sea" aria-hidden />
            </span>
          </Link>
        ))}
      </section>
      {/* Phones: swipeable carousel. */}
    <section
      className="relative mx-auto max-w-7xl px-3 pt-3 sm:px-5 sm:pt-5 md:hidden"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_-12px_rgba(11,31,143,0.25)] ring-1 ring-line sm:rounded-3xl">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map((slide, i) => (
            <Link
              key={slide.src}
              to={slide.to}
              hash={slide.hash}
              className="block w-full shrink-0"
              aria-hidden={i !== index}
              tabIndex={i === index ? 0 : -1}
              aria-label={slide.cta}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                width={1280}
                height={853}
                srcSet={`${slide.src.replace(".webp", "-720.webp")} 720w, ${slide.src} 1280w`}
                sizes="100vw"
                className="aspect-[3/2] w-full object-cover"
                fetchPriority={i === 0 ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(index - 1)}
          className="absolute top-1/2 left-2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow sm:left-4 sm:size-12"
          aria-label="Previous banner"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow sm:right-4 sm:size-12"
          aria-label="Next banner"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => go(i)}
            className={cn("h-2.5 rounded-full transition-all", i === index ? "w-8 bg-sea" : "w-2.5 bg-line")}
            aria-label={`Show banner ${i + 1}: ${slide.cta}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </section>
    </>
  );
}
