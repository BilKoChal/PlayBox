export default function Footer() {
  return (
    <footer className="
      py-6 px-4 text-center
      border-t border-[var(--color-border)]
      text-sm text-[var(--color-text-muted)]
      font-[var(--font-body)]
      mb-14 md:mb-0
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
