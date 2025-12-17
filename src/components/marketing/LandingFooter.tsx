"use client";

import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { Twitter, Instagram, Linkedin, Heart, Globe } from "lucide-react";

export function LandingFooter() {
  const t = useTranslations("Landing.footer");
  const tGlobal = useTranslations("Footer"); // Use the new generic translations

  const footerLinks = {
    product: [
      { label: t("features"), href: "#solution" },
      { label: t("pricing"), href: "#pricing" },
      { label: t("security"), href: "#security" },
    ],
    support: [
      // New Support Column logic
      { label: t("contact"), href: "mailto:hola@nestera.com" }, // Placeholder mailto
      // { label: "Help Center", href: "#" }, // Removed per instructions if not needed, but "Centro de Ayuda" was mentioned.
      // User said "Centro de Ayuda (Help Center - can link to email mailto for now)".
      { label: "Centro de Ayuda", href: "mailto:ayuda@nestera.com" },
    ],
    legal: [
      { label: t("privacy"), href: "/privacy" },
      { label: t("terms"), href: "/terms" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/nestera", label: "Twitter" },
    {
      icon: Instagram,
      href: "https://instagram.com/nestera",
      label: "Instagram",
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com/company/nestera",
      label: "LinkedIn",
    },
  ];

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 pt-20 pb-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Col 1: Brand & Language */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-100 group-hover:text-emerald-400 transition-colors">
                Nestera
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-slate-500">
              {t("tagline")}
            </p>

            {/* Language Selector */}
            <div className="inline-flex items-center gap-2 text-xs font-medium border border-slate-800 rounded-full px-3 py-1.5 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-pointer text-slate-500">
              <Globe className="h-3 w-3" />
              <span>Español (México)</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-6 uppercase tracking-wider">
              {tGlobal("product")}
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-emerald-400 transition-colors duration-200 block w-fit">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Support (New) */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-6 uppercase tracking-wider">
              {tGlobal("support")}
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-emerald-400 transition-colors duration-200 block w-fit">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-6 uppercase tracking-wider">
              {tGlobal("legal")}
            </h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-emerald-400 transition-colors duration-200 block w-fit">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright & Credit */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-medium text-slate-600">
            <p>{tGlobal("copyright")}</p>
            <span className="hidden md:inline">|</span>
            <div className="flex items-center gap-1.5">
              <span>Developed with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>by</span>
              <a
                href="https://noctra.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-100 opacity-70 transition-opacity">
                <img
                  src="/images/noctra-logo-light.png"
                  alt="Noctra Studio"
                  className="h-4 w-auto"
                />
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-emerald-400 transition-all transform hover:scale-110"
                aria-label={social.label}>
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
