"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SafeImage } from "@/components/site/SafeImage";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  href: string;
  imageUrl: string | null;
};

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div className="hero-slide" key={s.id} aria-hidden={i !== index} role="group" aria-roledescription="slide">
            {s.imageUrl ? (
              <div className="hero-bg">
                <SafeImage src={s.imageUrl} alt="" sizes="100vw" priority={i === 0} />
              </div>
            ) : null}
            <div className="container">
              <div className="hero-content">
                {i === 0 ? <h1>{s.title}</h1> : <h2>{s.title}</h2>}
                {s.subtitle ? <p>{s.subtitle}</p> : null}
                {s.href && s.buttonText ? (
                  <Link href={s.href} className="btn btn-red" tabIndex={i === index ? 0 : -1}>
                    {s.buttonText}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      {count > 1 ? (
        <div className="hero-dots">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`${i + 1} / ${count}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
