"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export function TechStack() {
  const t = useTranslations("LandingPage.TechStack");

  const logos = [
    {
      name: "Stripe",
      label: t("stripe"),
      src: "/images/stripe-logo-blurple.svg",
      width: 80,
      height: 32,
      className: "scale-110",
    },
    {
      name: "Supabase",
      label: t("supabase"),
      src: "/images/supabase-logo-light.svg",
      width: 130, // Supabase is usually wider
      height: 30,
      className: "scale-90",
    },
    {
      name: "Next.js",
      label: "Next.js",
      src: "/images/nextjs-logo.svg",
      width: 100,
      height: 30,
      className: "scale-100",
    },
    {
      name: "Vercel",
      label: "Vercel",
      src: "/images/vercel-logo.svg",
      width: 100,
      height: 25,
      className: "scale-100",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="mb-12 space-y-2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {t("label")}
          </h3>
          <p className="text-slate-500 max-w-lg mx-auto text-sm">
            {t("title")}
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="group flex flex-col items-center gap-4 cursor-default">
              <div
                className={`flex items-center justify-center opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 relative h-12 w-32 ${logo.className || ""}`}>
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="object-contain"
                />
              </div>
              <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                {logo.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
