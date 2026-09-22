"use client";

import { useEffect, useRef, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import type { ProjectMedia } from "@/lib/content/schema";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

interface ProjectMediaLightboxProps {
  media: ProjectMedia[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  projectTitle: string;
}

export function ProjectMediaLightbox({
  media,
  index,
  onIndexChange,
  onClose,
  projectTitle,
}: ProjectMediaLightboxProps) {
  const t = useTranslations("media");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const current = media[index];

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function goNext() {
      onIndexChange((index + 1) % media.length);
    }
    function goPrev() {
      onIndexChange((index - 1 + media.length) % media.length);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        goNext();
        return;
      }
      if (event.key === "ArrowLeft") {
        goPrev();
        return;
      }
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], video, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index, media.length, onClose, onIndexChange]);

  if (!current) return null;

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX > 0) {
      onIndexChange((index - 1 + media.length) % media.length);
    } else {
      onIndexChange((index + 1) % media.length);
    }
  }

  return createPortal(
    <div
      data-testid="lightbox-backdrop"
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-bg/90 p-4 ${
        prefersReducedMotion ? "" : "transition-opacity duration-200"
      }`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("dialogLabel", { title: projectTitle })}
        className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
        >
          &times;
        </button>

        <div
          className="flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {current.type === "image" ? (
            <img
              src={current.src}
              alt={current.alt}
              loading="lazy"
              className="max-h-[70vh] w-auto rounded-lg object-contain"
            />
          ) : (
            <video
              src={current.src}
              controls
              autoPlay={false}
              aria-label={current.alt}
              className="max-h-[70vh] w-auto rounded-lg"
            />
          )}
        </div>

        {media.length > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onIndexChange((index - 1 + media.length) % media.length)}
              aria-label={t("previousLabel")}
              className="rounded-full border border-border px-4 py-2 text-sm text-text transition-colors hover:border-accent hover:text-accent"
            >
              {t("previous")}
            </button>
            <span className="font-mono text-xs text-text-muted">
              {t("position", { current: index + 1, total: media.length })}
            </span>
            <button
              type="button"
              onClick={() => onIndexChange((index + 1) % media.length)}
              aria-label={t("nextLabel")}
              className="rounded-full border border-border px-4 py-2 text-sm text-text transition-colors hover:border-accent hover:text-accent"
            >
              {t("next")}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
