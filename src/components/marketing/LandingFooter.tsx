"use client";

import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { Twitter, Instagram, Linkedin, Heart, Globe } from "lucide-react";

export function LandingFooter() {
  const t = useTranslations("Landing");

  const footerLinks = {
    product: [
      { label: t("footer.features"), href: "#solution" },
      { label: t("footer.pricing"), href: "#pricing" },
      { label: t("footer.security"), href: "#security" },
    ],
    company: [
      { label: t("footer.about"), href: "#" },
      { label: t("footer.blog"), href: "#" },
      { label: t("footer.careers"), href: "#" },
    ],
    legal: [
      { label: t("footer.privacy"), href: "/privacy" },
      { label: t("footer.terms"), href: "/terms" },
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
    <footer className="w-full bg-[#0B1121]/90 backdrop-blur-xl border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Nestera
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>

            {/* Language Selector (Visual) */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium border border-white/5 rounded-full px-3 py-1.5 w-fit hover:border-white/10 hover:text-slate-300 transition-colors cursor-pointer">
              <Globe className="h-3 w-3" />
              <span>Español (México)</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-80">
              {t("footer.productTitle")}
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200 block w-fit">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-80">
              {t("footer.companyTitle")}
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200 block w-fit">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-80">
              {t("footer.legalTitle")}
            </h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200 block w-fit">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} Nestera.</p>
            <span className="hidden md:inline text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span>Developed with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>by</span>
              <a
                href="https://noctra.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity">
                {/* Light Mode Logo */}
                <img
                  src="images/noctra-logo-dark.png"
                  alt="Noctra Studio"
                  className="h-5 w-auto dark:hidden"
                />
                {/* Dark Mode Logo */}
                <img
                  src="images/noctra-logo-light.png"
                  alt="Noctra Studio"
                  className="h-5 w-auto hidden dark:block"
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
                className="text-slate-500 hover:text-white transition-all transform hover:scale-110"
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
