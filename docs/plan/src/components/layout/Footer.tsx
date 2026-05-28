/**
 * Footer — Simple footer with branding
 *
 * Phase 1.3 Polish:
 * - Hidden on mobile (bottom nav replaces it)
 * - Better spacing and colors
 * - Subtle animation
 */

export default function Footer() {
  return (
    <footer className="
      hidden md:block
      py-6 px-4 text-center
      border-t border-[var(--color-border)]
      text-sm text-[var(--color-text-muted)]
      font-[var(--font-body)]
      animate-[fadeIn_600ms_ease-out_500ms_both]
    ">
      <p>
        🎮 <span className="font-semibold text-[var(--color-primary)]">PlayBox</span>
        {' — '}A fun game station for kids and families
      </p>
      <p className="mt-1 text-xs">
        Made with ❤️ • Open Source (MIT)
      </p>
    </footer>
  );
}
