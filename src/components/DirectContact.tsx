"use client";

import type { ComponentType, CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { siteConfig } from "@/content/site";
import { InstagramIcon, WhatsAppIcon } from "./SocialIcons";

type Channel = "whatsapp" | "instagram";

const CHANNELS: Record<
  Channel,
  {
    name: string;
    url: string;
    Icon: ComponentType<{ className?: string }>;
    badge: CSSProperties;
    scanColor: string;
  }
> = {
  whatsapp: {
    name: "WhatsApp",
    url: siteConfig.whatsapp,
    Icon: WhatsAppIcon,
    badge: { background: "var(--color-whatsapp)" },
    scanColor: "var(--color-whatsapp)",
  },
  instagram: {
    name: "Instagram",
    url: siteConfig.instagram,
    Icon: InstagramIcon,
    badge: { background: "var(--gradient-instagram)" },
    scanColor: "var(--color-instagram)",
  },
};

const CORNERS = [
  "left-0 top-0 border-l-2 border-t-2",
  "right-0 top-0 border-r-2 border-t-2",
  "left-0 bottom-0 border-b-2 border-l-2",
  "right-0 bottom-0 border-b-2 border-r-2",
];

function QrChannel({ channel }: { channel: Channel }) {
  const t = useTranslations("contact.direct");
  const { name, url, Icon, badge, scanColor } = CHANNELS[channel];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t(`${channel}.label`)}
      data-cursor-hover
      className="qr-link group flex flex-col items-center"
      style={{ "--scan-color": scanColor } as CSSProperties}
    >
      <span className="relative block aspect-square w-full max-w-[12.5rem] p-2 sm:p-3">
        {CORNERS.map((corner) => (
          <span
            key={corner}
            aria-hidden="true"
            className={`absolute h-5 w-5 border-text-muted/50 transition duration-300 group-hover:border-text ${corner}`}
          />
        ))}
        <span className="relative block aspect-square overflow-hidden bg-qr-bg p-1.5 text-qr-fg ring-1 ring-border transition duration-300 group-hover:shadow-[0_12px_32px_-16px_var(--scan-color)] group-active:scale-[0.98]">
          {/* Level H tolerates the centre badge covering part of the modules. */}
          <QRCodeSVG
            value={url}
            level="H"
            marginSize={2}
            size={256}
            fgColor="currentColor"
            bgColor="transparent"
            className="block h-full w-full"
            aria-hidden="true"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex h-[20%] w-[20%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md p-[3.5%] text-white shadow-[0_0_0_3px_var(--color-qr-bg)]"
            style={badge}
          >
            <Icon className="h-full w-full" />
          </span>
          <span
            aria-hidden="true"
            className="qr-scan pointer-events-none absolute inset-0"
          />
        </span>
      </span>
      <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted transition-colors group-hover:text-text">
        {name}
      </span>
    </a>
  );
}

export function DirectContact() {
  const t = useTranslations("contact.direct");
  const tContact = useTranslations("contact");

  const classics = [
    { label: siteConfig.email, href: `mailto:${siteConfig.email}`, external: false },
    { label: "GitHub", href: siteConfig.github, external: true },
    { label: "LinkedIn", href: siteConfig.linkedin, external: true },
  ];

  return (
    <div className="flex h-full flex-col rounded-md border border-border bg-bg px-4 py-6 text-center sm:p-8 lg:text-left">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-text-muted">
        {t("eyebrow")}
      </p>
      <h3 className="font-display mt-4 text-2xl font-medium italic tracking-tight text-text sm:text-3xl">
        {t("title")}
      </h3>
      <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-text-muted lg:mx-0">
        {t("description")}
      </p>

      <div className="mt-8 grid flex-1 grid-cols-2 place-items-center gap-2 sm:gap-8">
        <QrChannel channel="whatsapp" />
        <QrChannel channel="instagram" />
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-5 lg:flex-row lg:flex-wrap lg:justify-between lg:gap-x-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-text-muted">
          {t("others")}
        </span>
        <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-xs">
          {classics.map((link, index) => (
            <span key={link.href} className="flex items-center gap-3">
              {index > 0 && (
                <span aria-hidden="true" className="text-text-muted">
                  ·
                </span>
              )}
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                data-cursor-hover
                aria-label={
                  link.external ? undefined : `${tContact("email")}: ${link.label}`
                }
                className="text-text transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
