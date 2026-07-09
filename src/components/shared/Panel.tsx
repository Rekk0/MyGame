import { useEffect } from "react";
import { X } from "@phosphor-icons/react";

interface PanelProps {
  children: React.ReactNode;
  ornate?: boolean;
  className?: string;
}

/** Framed surface — the base container of the RPG visual language. */
export function Panel({
  children,
  ornate = false,
  className = "",
}: PanelProps): JSX.Element {
  return (
    <div
      className={`${ornate ? "rpg-frame-ornate bg-panel" : "rpg-frame"} rounded-lg ${className}`}
    >
      {children}
    </div>
  );
}

interface ModalShellProps {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

/** Shared modal chrome: scrim + ornate panel + serif title bar + close button. */
export function ModalShell({
  title,
  onClose,
  children,
  className = "",
  titleClassName = "text-gold",
}: ModalShellProps): JSX.Element {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', h, true)
    return () => window.removeEventListener('keydown', h, true)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim"
      onClick={onClose}
    >
      <div
        className={`rpg-frame-ornate flex flex-col rounded-lg bg-panel ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
          <h2
            className={`font-display text-lg font-bold tracking-wide ${titleClassName}`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-dim transition-colors hover:text-ink-hi"
            aria-label="close"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className="mx-5 h-px shrink-0 bg-gradient-to-r from-transparent via-edge-strong to-transparent" />
        {children}
      </div>
    </div>
  );
}
