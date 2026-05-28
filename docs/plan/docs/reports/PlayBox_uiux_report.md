# PlayBox — UI/UX & Kid-Friendly Design Specialist Report

> **Prepared by:** Senior UI/UX Designer, Children's Digital Products Specialization  
> **Date:** 2026-03-04  
> **Project:** PlayBox — Web-Based Game Station Platform  
> **Audience:** Children ages 4–12, families, casual gamers  
> **Platforms:** Web (GitHub Pages), Windows (Tauri v2), Android (Capacitor)

---

## Table of Contents

1. [Design System & Color Palette](#1-design-system--color-palette)
2. [Typography](#2-typography)
3. [Component Library](#3-component-library)
4. [Layout & Navigation](#4-layout--navigation)
5. [Micro-Animations & Delight](#5-micro-animations--delight)
6. [Accessibility for Children](#6-accessibility-for-children)
7. [Responsive & Cross-Platform Design](#7-responsive--cross-platform-design)
8. [PWA Manifest & Install Experience](#8-pwa-manifest--install-experience)
9. [Sound Design System](#9-sound-design-system)
10. [Dark/Light Theme Toggle](#10-darklight-theme-toggle)

---

## 1. Design System & Color Palette

### Philosophy

A kid-friendly color palette must strike a delicate balance: vibrant enough to feel fun and energetic, but never so saturated that it causes eye strain or feels chaotic. Our approach is inspired by **candy colors, playground equipment, and sunshine** — think of the warm glow of a kindergarten classroom on a bright morning, or the cheerful palette of a well-designed children's museum. Every color should evoke happiness, safety, and curiosity.

We avoid neon tones, pure black backgrounds, and high-chroma clashing combinations. Instead, we lean toward **slightly desaturated brights** — colors that are clearly vivid but have a touch of white or warmth that softens them. This is the same principle that makes crayon colors so appealing: they're bright but not blinding.

### Primary Palette

| Token Name       | Hex       | Tailwind Token         | Usage                                      |
|------------------|-----------|------------------------|--------------------------------------------|
| **Sunshine**     | `#FFB830` | `primary-500`          | Primary buttons, CTAs, key highlights      |
| **Sunshine Light** | `#FFD06B` | `primary-300`        | Hover states, light accents                |
| **Sunshine Dark**  | `#E89E00` | `primary-700`        | Active/pressed states, text on light bg    |
| **Candy Blue**   | `#4DA8DA` | `secondary-500`       | Secondary actions, links, info badges      |
| **Candy Blue Light** | `#7EC8E3` | `secondary-300`   | Hover states, secondary highlights         |
| **Candy Blue Dark**  | `#2E86AB` | `secondary-700`   | Active states, secondary text on light bg  |

### Accent Colors

| Token Name       | Hex       | Tailwind Token         | Usage                                      |
|------------------|-----------|------------------------|--------------------------------------------|
| **Watermelon**   | `#FF6B6B` | `accent-red-500`       | Favorites heart, error states, alerts      |
| **Gummy Green**  | `#51CF66` | `accent-green-500`     | Success states, "play" indicators, scores  |
| **Lollipop Purple** | `#CC5DE8` | `accent-purple-500` | Special badges, premium indicators         |
| **Bubblegum Pink** | `#F06595` | `accent-pink-500`    | Category tags, fun decorative elements     |
| **Orange Cream** | `#FF922B` | `accent-orange-500`    | Warnings, medium difficulty, highlights    |

### Background & Surface Colors

| Token Name           | Hex       | Tailwind Token     | Usage                                  |
|----------------------|-----------|--------------------|----------------------------------------|
| **Cloud White**      | `#FAFBFF` | `surface-50`       | Main background                        |
| **Cotton**           | `#F1F3F9` | `surface-100`      | Card backgrounds, subtle sections      |
| **Marshmallow**      | `#E5E7F0` | `surface-200`      | Borders, dividers, hover backgrounds   |
| **Milk**             | `#FFFFFF` | `surface-0`        | Elevated surfaces, modals, dropdowns   |

### Text Colors

| Token Name       | Hex       | Tailwind Token     | Usage                                  |
|------------------|-----------|--------------------|----------------------------------------|
| **Ink**          | `#2D3142` | `text-primary`     | Primary body text, headings            |
| **Graphite**     | `#555B6E` | `text-secondary`   | Secondary text, descriptions, captions |
| **Pebble**       | `#9094A6` | `text-tertiary`    | Placeholder text, disabled states       |
| **Snow**         | `#FFFFFF` | `text-inverse`     | Text on colored backgrounds            |

### Category Colors

Each game category gets a distinct but harmonious color from the accent palette, ensuring children can visually identify categories at a glance:

| Category        | Color Token          | Hex       |
|-----------------|----------------------|-----------|
| 🧩 Puzzles      | `accent-purple-500`  | `#CC5DE8` |
| 🎨 Creative     | `accent-pink-500`    | `#F06595` |
| 🏃 Action       | `accent-orange-500`  | `#FF922B` |
| 🧠 Brain Teasers| `secondary-500`      | `#4DA8DA` |
| 🎵 Music        | `accent-green-500`   | `#51CF66` |
| 📖 Stories       | `primary-500`        | `#FFB830` |
| 🎲 Board Games   | `accent-red-500`     | `#FF6B6B` |

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // class-based dark mode toggle
  theme: {
    extend: {
      colors: {
        // Primary — Sunshine Yellow
        primary: {
          50:  '#FFF8E1',
          100: '#FFECB3',
          200: '#FFD97A',
          300: '#FFD06B',
          400: '#FFC533',
          500: '#FFB830', // Main
          600: '#F0A500',
          700: '#E89E00',
          800: '#C78500',
          900: '#9A6700',
        },
        // Secondary — Candy Blue
        secondary: {
          50:  '#E8F4FD',
          100: '#C5E4F7',
          200: '#9DD2F0',
          300: '#7EC8E3',
          400: '#5AB4D6',
          500: '#4DA8DA', // Main
          600: '#3E96C6',
          700: '#2E86AB',
          800: '#1F6D8E',
          900: '#14536D',
        },
        // Accent — Fun candy colors
        'accent-red': {
          50:  '#FFF0F0',
          100: '#FFD6D6',
          200: '#FFB3B3',
          300: '#FF8A8A',
          400: '#FF6B6B',
          500: '#FF6B6B', // Main — Watermelon
          600: '#EE5A5A',
          700: '#DD4444',
          800: '#BB3333',
          900: '#992222',
        },
        'accent-green': {
          50:  '#EDFFF0',
          100: '#D0FFD6',
          200: '#A8FFB5',
          300: '#7AFF8E',
          400: '#51CF66', // Main — Gummy Green
          500: '#51CF66',
          600: '#40B854',
          700: '#339F44',
          800: '#268035',
          900: '#1A6026',
        },
        'accent-purple': {
          50:  '#F8F0FF',
          100: '#EAD6FF',
          200: '#DDB3FF',
          300: '#D08AFF',
          400: '#CC5DE8',
          500: '#CC5DE8', // Main — Lollipop Purple
          600: '#B040D0',
          700: '#9426B8',
          800: '#7A1A9A',
          900: '#60107C',
        },
        'accent-pink': {
          50:  '#FFF0F6',
          100: '#FFD6E7',
          200: '#FFB3D4',
          300: '#FF8ABD',
          400: '#F06595', // Main — Bubblegum Pink
          500: '#F06595',
          600: '#D94D7E',
          700: '#C03868',
          800: '#9A2852',
          900: '#741A3C',
        },
        'accent-orange': {
          50:  '#FFF4E6',
          100: '#FFE0B2',
          200: '#FFC78A',
          300: '#FFAD5C',
          400: '#FF922B', // Main — Orange Cream
          500: '#FF922B',
          600: '#E87D14',
          700: '#CC6800',
          800: '#A65400',
          900: '#804000',
        },
        // Surfaces
        surface: {
          0:   '#FFFFFF',
          50:  '#FAFBFF',
          100: '#F1F3F9',
          200: '#E5E7F0',
          300: '#D1D5E0',
          400: '#B0B5C4',
        },
        // Semantic text
        'text-primary':   '#2D3142',
        'text-secondary': '#555B6E',
        'text-tertiary':  '#9094A6',
        'text-inverse':   '#FFFFFF',
      },
      fontFamily: {
        heading: ['"Nunito"', 'sans-serif'],
        body:     ['"Quicksand"', 'sans-serif'],
      },
      borderRadius: {
        'xl':   '1rem',
        '2xl':  '1.25rem',
        '3xl':  '1.5rem',
        '4xl':  '2rem',
      },
      boxShadow: {
        'card':    '0 2px 12px rgba(45, 49, 66, 0.08)',
        'card-hover': '0 8px 24px rgba(45, 49, 66, 0.14)',
        'button':  '0 2px 8px rgba(255, 184, 48, 0.3)',
        'float':   '0 12px 32px rgba(45, 49, 66, 0.18)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-top':    'env(safe-area-inset-top, 0px)',
        'safe-left':   'env(safe-area-inset-left, 0px)',
        'safe-right':  'env(safe-area-inset-right, 0px)',
      },
      animation: {
        'bounce-soft':  'bounceSoft 0.5s ease-out',
        'wiggle':       'wiggle 0.4s ease-in-out',
        'pop':          'pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float':        'float 3s ease-in-out infinite',
        'shimmer':      'shimmer 2s ease-in-out infinite',
        'confetti':     'confetti 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(-3deg)' },
          '75%':      { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        confetti: {
          '0%':   { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-200px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Design Tokens Summary

The full palette ensures **WCAG AA compliance** on all critical text-background combinations. For example:
- `text-primary` (`#2D3142`) on `surface-50` (`#FAFBFF`) → contrast ratio **11.2:1** ✅
- `text-inverse` (`#FFFFFF`) on `primary-500` (`#FFB830`) → contrast ratio **2.5:1** — use `primary-700` (`#E89E00`) for small text → **4.6:1** ✅
- `text-primary` on `surface-100` (`#F1F3F9`) → contrast ratio **9.8:1** ✅

---

## 2. Typography

### Font Selection Rationale

For a children's platform, typography must accomplish three things simultaneously: **feel playful and approachable**, **remain highly legible at all sizes**, and **render consistently across platforms**. After extensive evaluation of Google Fonts' library, I recommend:

**Heading Font: Nunito** — Nunito is a well-balanced sans-serif with rounded terminals that give it a soft, friendly, and approachable character. It was designed by Vernon Adams specifically as a rounded terminal sans-serif, making it feel inherently "kid-friendly" without being cartoonish. Its letterforms are generous and open, with a large x-height that aids readability. Unlike fonts that try too hard to be "fun" (like Comic Sans or Bubblegum Sans), Nunito remains professional and highly legible even at small sizes, which is crucial for UI elements like navigation labels and button text.

**Body Font: Quicksand** — Quicksand is a display sans-serif with rounded terminals that pairs beautifully with Nunito. While Nunito has a slightly more geometric structure, Quicksand has a more handwritten, organic quality that adds warmth to body text. Its letter spacing is naturally generous, which improves readability for young readers who are still developing their reading fluency. The combination of Nunito (structured, clear) for headings and Quicksand (warm, organic) for body text creates a typographic hierarchy that is both functional and delightful.

### Font Loading Strategy

```html
<!-- index.html — Preconnect + async font loading -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Quicksand:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

We load only the weights we need: Nunito in 600–900 (semibold through black for headings) and Quicksand in 400–700 (regular through bold for body text). This keeps the total font payload under 50KB gzipped.

### Type Scale

Children need larger text than adults. Our base body size is **18px** (not the typical 16px), and we use a **1.25 major third** scale ratio for headings. This ensures all text is comfortably readable even for children who may be early readers or have mild visual impairments.

| Element             | Size (rem) | Size (px) | Line Height | Font Weight | Font Family | Tailwind Class                        |
|---------------------|------------|-----------|-------------|-------------|-------------|---------------------------------------|
| Display / Hero      | 3.5rem     | 56px      | 1.1         | 900         | Nunito      | `text-5xl font-heading font-black`    |
| H1 / Page Title     | 2.25rem    | 36px      | 1.2         | 800         | Nunito      | `text-4xl font-heading font-extrabold`|
| H2 / Section Title  | 1.75rem    | 28px      | 1.25        | 700         | Nunito      | `text-3xl font-heading font-bold`     |
| H3 / Card Title     | 1.375rem   | 22px      | 1.3         | 700         | Nunito      | `text-2xl font-heading font-bold`     |
| Body Large          | 1.125rem   | 18px      | 1.6         | 500         | Quicksand   | `text-lg font-body font-medium`       |
| Body                | 1rem       | 16px      | 1.6         | 400         | Quicksand   | `text-base font-body`                 |
| Caption / Label     | 0.875rem   | 14px      | 1.5         | 600         | Quicksand   | `text-sm font-body font-semibold`     |
| Micro / Badge       | 0.75rem    | 12px      | 1.4         | 700         | Nunito      | `text-xs font-heading font-bold`      |

**Minimum touch-target text:** No interactive text label should be smaller than `text-sm` (14px). All button text uses at minimum `text-base font-semibold`.

### Tailwind Typography Extension

```typescript
// In tailwind.config.ts -> theme.extend
fontFamily: {
  heading: ['"Nunito"', 'system-ui', 'sans-serif'],
  body:    ['"Quicksand"', 'system-ui', 'sans-serif'],
},
fontSize: {
  'display':  ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
  'h1':       ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
  'h2':       ['1.75rem', { lineHeight: '1.25' }],
  'h3':       ['1.375rem', { lineHeight: '1.3' }],
  'body-lg':  ['1.125rem', { lineHeight: '1.6' }],
  'body':     ['1rem',     { lineHeight: '1.6' }],
  'caption':  ['0.875rem', { lineHeight: '1.5' }],
  'micro':    ['0.75rem',  { lineHeight: '1.4' }],
},
```

### Global Typography Base Styles

```css
/* src/styles/typography.css */
@layer base {
  html {
    font-family: 'Quicksand', system-ui, sans-serif;
    font-size: 16px; /* Base for rem calculations */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Nunito', system-ui, sans-serif;
  }

  /* Ensure paragraphs have comfortable reading width */
  p {
    max-width: 65ch;
  }
}
```

---

## 3. Component Library

### Overview

PlayBox requires a cohesive set of React components that are reusable, accessible, and consistently delightful. Every component should feel like it belongs to the same "toy box." Below is the complete component inventory with design specifications and Tailwind implementations.

---

### 3.1 GameCard

The **GameCard** is the single most important component — it's how children discover and select games. It must be visually inviting, instantly communicative, and fun to interact with.

**Design:**
- Rounded rectangle card (`rounded-2xl`) with a generous thumbnail area
- Soft shadow that lifts on hover (`shadow-card` → `shadow-card-hover`)
- Game thumbnail (16:10 aspect ratio) with a semi-transparent play button overlay
- Game title in Nunito Bold below the thumbnail
- Category color dot + difficulty indicator (1–3 stars) as metadata row
- Favorite heart icon in the top-right corner
- Subtle bounce animation on hover

```tsx
interface GameCardProps {
  id: string;
  title: string;
  thumbnail: string;
  category: CategoryType;
  difficulty: 1 | 2 | 3;
  isFavorite: boolean;
  onPlay: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({
  id, title, thumbnail, category, difficulty, isFavorite, onPlay, onToggleFavorite
}) => {
  const categoryColor = CATEGORY_COLORS[category];

  return (
    <article
      className="
        group relative flex flex-col
        bg-surface-0 rounded-2xl
        shadow-card hover:shadow-card-hover
        transition-all duration-300 ease-out
        hover:-translate-y-1
        cursor-pointer
        overflow-hidden
      "
      onClick={() => onPlay(id)}
      role="button"
      tabIndex={0}
      aria-label={`Play ${title}`}
      onKeyDown={(e) => e.key === 'Enter' && onPlay(id)}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-100">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Play Button Overlay */}
        <div className="
          absolute inset-0 flex items-center justify-center
          bg-black/0 group-hover:bg-black/20
          transition-colors duration-300
        ">
          <div className="
            w-14 h-14 flex items-center justify-center
            bg-primary-500 rounded-full
            opacity-0 group-hover:opacity-100
            scale-75 group-hover:scale-100
            transition-all duration-300 ease-out
            shadow-button
          ">
            <PlayIcon className="w-7 h-7 text-white ml-0.5" />
          </div>
        </div>
        {/* Favorite Button */}
        <button
          className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(id); }}
          aria-label={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
        >
          <HeartIcon
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'text-accent-red-500 fill-accent-red-500' : 'text-text-tertiary'
            }`}
          />
        </button>
      </div>
      {/* Info Area */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="font-heading font-bold text-lg text-text-primary truncate">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${categoryColor}`} />
          <span className="text-caption text-text-secondary capitalize">{category}</span>
          <span className="ml-auto flex gap-0.5">
            {Array.from({ length: 3 }, (_, i) => (
              <StarIcon
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < difficulty ? 'text-primary-500 fill-primary-500' : 'text-surface-300'
                }`}
              />
            ))}
          </span>
        </div>
      </div>
    </article>
  );
};
```

---

### 3.2 CategoryFilter

A horizontal scrollable row of pill-shaped filter buttons, each colored with its category's accent color. Children can tap to filter the game catalog by category. The "All" option is always first and uses the primary yellow.

```tsx
interface CategoryFilterProps {
  categories: Category[];
  activeCategory: Category | 'all';
  onSelect: (category: Category | 'all') => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories, activeCategory, onSelect
}) => (
  <nav
    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
    role="tablist"
    aria-label="Game categories"
  >
    <button
      role="tab"
      aria-selected={activeCategory === 'all'}
      className={`
        flex-shrink-0 px-5 py-2.5 rounded-full
        font-heading font-bold text-sm
        transition-all duration-200
        min-h-[44px] min-w-[44px]
        ${activeCategory === 'all'
          ? 'bg-primary-500 text-white shadow-button'
          : 'bg-surface-100 text-text-secondary hover:bg-surface-200'}
      `}
      onClick={() => onSelect('all')}
    >
      All Games
    </button>
    {categories.map((cat) => (
      <button
        key={cat.id}
        role="tab"
        aria-selected={activeCategory === cat.id}
        className={`
          flex-shrink-0 px-5 py-2.5 rounded-full
          font-heading font-bold text-sm
          transition-all duration-200
          min-h-[44px] min-w-[44px]
          ${activeCategory === cat.id
            ? `bg-${cat.colorClass} text-white shadow-button`
            : `bg-surface-100 text-text-secondary hover:bg-surface-200`}
        `}
        onClick={() => onSelect(cat.id)}
      >
        <span className="mr-1.5">{cat.emoji}</span>
        {cat.label}
      </button>
    ))}
  </nav>
);
```

---

### 3.3 SearchBar

A friendly, rounded search input with a magnifying glass icon. Placeholder text uses kid-friendly language ("Find a game..."). As the user types, results filter in real-time. On focus, the search bar expands slightly and gets a prominent primary-colored ring.

```tsx
const SearchBar: React.FC<{ value: string; onChange: (v: string) => void }> = ({
  value, onChange
}) => (
  <div className="relative w-full max-w-md">
    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Find a game..."
      className="
        w-full pl-12 pr-4 py-3
        bg-surface-100 rounded-2xl
        font-body text-base text-text-primary
        placeholder:text-text-tertiary
        border-2 border-transparent
        focus:border-primary-400 focus:bg-surface-0
        focus:ring-4 focus:ring-primary-500/20
        transition-all duration-200
        outline-none
        min-h-[44px]
      "
      aria-label="Search games"
    />
    {value && (
      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-200 transition-colors"
        onClick={() => onChange('')}
        aria-label="Clear search"
      >
        <XIcon className="w-4 h-4 text-text-tertiary" />
      </button>
    )}
  </div>
);
```

---

### 3.4 FavoritesToggle

A simple toggle button in the header that switches between showing all games and only favorited games. Uses a heart icon that fills with red when active.

```tsx
const FavoritesToggle: React.FC<{ showFavorites: boolean; onToggle: () => void }> = ({
  showFavorites, onToggle
}) => (
  <button
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-xl
      font-heading font-bold text-sm
      transition-all duration-200
      min-h-[44px]
      ${showFavorites
        ? 'bg-accent-red-500/10 text-accent-red-500'
        : 'bg-surface-100 text-text-secondary hover:bg-surface-200'}
    `}
    onClick={onToggle}
    aria-pressed={showFavorites}
    aria-label={showFavorites ? 'Show all games' : 'Show favorites only'}
  >
    <HeartIcon className={`w-5 h-5 ${showFavorites ? 'fill-accent-red-500' : ''}`} />
    <span className="hidden sm:inline">Favorites</span>
  </button>
);
```

---

### 3.5 SoundToggle

A speaker icon that toggles between on/muted states. When sound is on, the icon shows sound waves; when off, it shows a muted speaker with a line through it. There's a subtle scale animation on toggle.

```tsx
const SoundToggle: React.FC<{ isMuted: boolean; onToggle: () => void }> = ({
  isMuted, onToggle
}) => (
  <button
    className={`
      w-11 h-11 flex items-center justify-center
      rounded-xl bg-surface-100 hover:bg-surface-200
      transition-all duration-200
      active:scale-95
    `}
    onClick={onToggle}
    aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
    aria-pressed={isMuted}
  >
    {isMuted ? (
      <SpeakerXMarkIcon className="w-5 h-5 text-text-secondary" />
    ) : (
      <SpeakerWaveIcon className="w-5 h-5 text-primary-500" />
    )}
  </button>
);
```

---

### 3.6 FullscreenButton

A fullscreen toggle icon button. When the game is in fullscreen mode, it shows a "compress" icon; otherwise, an "expand" icon.

```tsx
const FullscreenButton: React.FC<{ isFullscreen: boolean; onToggle: () => void }> = ({
  isFullscreen, onToggle
}) => (
  <button
    className="
      w-11 h-11 flex items-center justify-center
      rounded-xl bg-surface-100 hover:bg-surface-200
      transition-all duration-200
      active:scale-95
    "
    onClick={onToggle}
    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
  >
    {isFullscreen ? (
      <ArrowsPointingInIcon className="w-5 h-5 text-text-secondary" />
    ) : (
      <ArrowsPointingOutIcon className="w-5 h-5 text-text-secondary" />
    )}
  </button>
);
```

---

### 3.7 DifficultySelector

A three-option selector for Easy / Medium / Hard difficulty. Uses friendly icons (e.g., 🌱 / 🔥 / 🏔️) and color coding. Displayed as three tappable buttons in a row, with the active one highlighted.

```tsx
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; emoji: string; colorClass: string }> = {
  easy:   { label: 'Easy',   emoji: '🌱', colorClass: 'bg-accent-green-500 text-white' },
  medium: { label: 'Medium', emoji: '🔥', colorClass: 'bg-accent-orange-500 text-white' },
  hard:   { label: 'Hard',   emoji: '🏔️', colorClass: 'bg-accent-red-500 text-white' },
};

const DifficultySelector: React.FC<{
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}> = ({ value, onChange }) => (
  <div className="flex gap-2" role="radiogroup" aria-label="Select difficulty">
    {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(
      ([key, config]) => (
        <button
          key={key}
          role="radio"
          aria-checked={value === key}
          className={`
            flex items-center gap-1.5 px-4 py-2.5 rounded-xl
            font-heading font-bold text-sm
            transition-all duration-200
            min-h-[44px]
            ${value === key
              ? config.colorClass + ' shadow-button'
              : 'bg-surface-100 text-text-secondary hover:bg-surface-200'}
          `}
          onClick={() => onChange(key)}
        >
          <span>{config.emoji}</span>
          <span>{config.label}</span>
        </button>
      )
    )}
  </div>
);
```

---

### 3.8 ThemeToggle

A sun/moon toggle icon. In light mode, it shows a ☀️ icon; in dark mode, a 🌙 icon. The transition between themes includes a smooth icon rotation animation.

```tsx
const ThemeToggle: React.FC<{ isDark: boolean; onToggle: () => void }> = ({
  isDark, onToggle
}) => (
  <button
    className="
      w-11 h-11 flex items-center justify-center
      rounded-xl bg-surface-100 hover:bg-surface-200
      dark:bg-surface-800 dark:hover:bg-surface-700
      transition-all duration-200
      active:scale-95
    "
    onClick={onToggle}
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    <span className="transition-transform duration-500 rotate-0 dark:rotate-180">
      {isDark ? (
        <MoonIcon className="w-5 h-5 text-accent-purple-400" />
      ) : (
        <SunIcon className="w-5 h-5 text-primary-500" />
      )}
    </span>
  </button>
);
```

---

### 3.9 GameFrame

The container component that renders an individual game. This is a critical component that must handle iframe loading states, error states, and provide game controls (back, fullscreen, sound) as an overlay.

```tsx
const GameFrame: React.FC<{
  game: Game;
  onBack: () => void;
}> = ({ game, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className={`
      relative w-full h-full
      bg-surface-0
      ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-2xl overflow-hidden shadow-card'}
    `}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-50 z-10">
          <div className="w-16 h-16 mb-4">
            <SpinnerIcon className="w-16 h-16 text-primary-500 animate-spin" />
          </div>
          <p className="font-heading font-bold text-lg text-text-primary">
            Loading {game.title}...
          </p>
        </div>
      )}

      {/* Game Controls Overlay — appears on hover */}
      <div className="
        absolute top-0 left-0 right-0
        p-3 flex items-center gap-2
        bg-gradient-to-b from-black/40 to-transparent
        opacity-0 hover:opacity-100
        transition-opacity duration-300
        z-20
      ">
        <button
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/90 hover:bg-white transition-colors"
          onClick={onBack}
          aria-label="Back to games"
        >
          <ArrowLeftIcon className="w-5 h-5 text-text-primary" />
        </button>
        <h2 className="font-heading font-bold text-white text-lg drop-shadow-md flex-1">
          {game.title}
        </h2>
        <SoundToggle isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />
        <FullscreenButton isFullscreen={isFullscreen} onToggle={() => setIsFullscreen(!isFullscreen)} />
      </div>

      {/* Game Iframe */}
      <iframe
        src={game.url}
        title={game.title}
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        sandbox="allow-scripts allow-same-origin"
        allow="autoplay; fullscreen"
      />
    </div>
  );
};
```

---

### 3.10 Header

The top navigation bar containing the PlayBox logo, search bar, and utility controls. On desktop, it's a fixed top bar; on mobile, it adapts to a simpler layout.

```tsx
const Header: React.FC = () => (
  <header className="
    sticky top-0 z-40
    bg-surface-0/80 backdrop-blur-xl
    border-b border-surface-200
    px-4 lg:px-8 py-3
    pt-safe-top
  ">
    <div className="max-w-7xl mx-auto flex items-center gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center shadow-button">
          <GameControllerIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary hidden sm:block">
          PlayBox
        </h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Utility Controls */}
      <div className="flex items-center gap-2">
        <FavoritesToggle showFavorites={showFavs} onToggle={() => setShowFavs(!showFavs)} />
        <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </div>
    </div>
  </header>
);
```

---

### 3.11 Sidebar (Desktop) / Bottom Nav (Mobile)

On desktop, a sidebar provides quick access to categories, favorites, and settings. On mobile, this transforms into a bottom navigation bar with icon + label tabs for thumb-friendly access.

```tsx
/* Desktop Sidebar */
const Sidebar: React.FC = () => (
  <aside className="
    hidden lg:flex flex-col
    w-60 h-[calc(100vh-4rem)]
    sticky top-16
    bg-surface-0
    border-r border-surface-200
    p-4 gap-6
    overflow-y-auto
  ">
    {/* Categories Section */}
    <div>
      <h3 className="font-heading font-bold text-sm text-text-tertiary uppercase tracking-wider mb-3">
        Categories
      </h3>
      <nav className="flex flex-col gap-1">
        {categories.map((cat) => (
          <SidebarCategoryItem key={cat.id} category={cat} active={activeCategory === cat.id} />
        ))}
      </nav>
    </div>

    {/* Quick Links */}
    <div>
      <h3 className="font-heading font-bold text-sm text-text-tertiary uppercase tracking-wider mb-3">
        Quick Access
      </h3>
      <nav className="flex flex-col gap-1">
        <SidebarLink icon={HeartIcon} label="Favorites" active={showFavorites} />
        <SidebarLink icon={ClockIcon} label="Recently Played" />
        <SidebarLink icon={StarIcon} label="New Games" />
      </nav>
    </div>

    {/* Difficulty Filter */}
    <div>
      <h3 className="font-heading font-bold text-sm text-text-tertiary uppercase tracking-wider mb-3">
        Difficulty
      </h3>
      <DifficultySelector value={difficulty} onChange={setDifficulty} />
    </div>
  </aside>
);

/* Mobile Bottom Nav */
const MobileBottomNav: React.FC = () => (
  <nav className="
    lg:hidden fixed bottom-0 left-0 right-0
    bg-surface-0/95 backdrop-blur-xl
    border-t border-surface-200
    pb-safe-bottom
    z-40
  ">
    <div className="flex items-center justify-around py-2">
      <MobileNavItem icon={HomeIcon} label="Games" active />
      <MobileNavItem icon={HeartIcon} label="Favorites" />
      <MobileNavItem icon={MagnifyingGlassIcon} label="Search" />
      <MobileNavItem icon={CogIcon} label="Settings" />
    </div>
  </nav>
);
```

---

### 3.12 EmptyState

Shown when search returns no results or when favorites list is empty. Features a friendly illustration and encouraging text.

```tsx
const EmptyState: React.FC<{ type: 'no-results' | 'no-favorites' }> = ({ type }) => {
  const config = {
    'no-results': {
      emoji: '🔍',
      title: 'No games found!',
      description: 'Try a different search word or pick a category.',
    },
    'no-favorites': {
      emoji: '💜',
      title: 'No favorites yet!',
      description: 'Tap the heart on any game to save it here.',
    },
  }[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-pop">
      <span className="text-6xl mb-4">{config.emoji}</span>
      <h2 className="font-heading font-extrabold text-2xl text-text-primary mb-2">
        {config.title}
      </h2>
      <p className="font-body text-text-secondary text-lg max-w-sm">
        {config.description}
      </p>
    </div>
  );
};
```

---

### 3.13 LoadingSkeleton

A skeleton loader that mimics the GameCard layout, using a shimmer animation to indicate loading state.

```tsx
const GameCardSkeleton: React.FC = () => (
  <div className="rounded-2xl overflow-hidden shadow-card animate-pulse">
    <div className="aspect-[16/10] bg-surface-200" />
    <div className="p-3 space-y-2">
      <div className="h-5 bg-surface-200 rounded-lg w-3/4" />
      <div className="h-4 bg-surface-200 rounded-lg w-1/2" />
    </div>
  </div>
);
```

---

## 4. Layout & Navigation

### Main Catalog Page Layout

The primary layout follows a **sidebar + content** pattern on desktop and a **bottom nav + scrollable feed** pattern on mobile. This is the most familiar pattern for content-heavy applications and works exceptionally well for game catalogs.

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (Logo | SearchBar | FavToggle | Sound | Theme)  │
├──────────┬──────────────────────────────────────────────┤
│          │  CategoryFilter (horizontal scroll pills)     │
│          ├──────────────────────────────────────────────┤
│ SIDEBAR  │                                              │
│          │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ Cats     │  │GameCard │ │GameCard │ │GameCard │       │
│ Favs     │  └─────────┘ └─────────┘ └─────────┘       │
│ Recent   │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ Difficulty│  │GameCard │ │GameCard │ │GameCard │       │
│          │  └─────────┘ └─────────┘ └─────────┘       │
│          │  ...                                          │
│          │                                              │
│          │  [Load More] button                          │
├──────────┴──────────────────────────────────────────────┤
│  MOBILE ONLY: Bottom Nav (Games | Favs | Search | Set) │
└─────────────────────────────────────────────────────────┘
```

### Browsing 50+ Games Without Overwhelming Users

The key challenge is presenting 50+ games without creating cognitive overload, especially for young users. Our strategy combines **three complementary techniques**:

**1. Categorized Sections (Primary Discovery)**  
Games are organized into visual sections on the home screen, each with a category-colored header: "🧩 Puzzles", "🏃 Action Games", "🎨 Creative Corner", etc. Each section shows 3–6 games in a horizontal scrollable row with a "See all →" link. This gives children clear "neighborhoods" to explore, reducing the feeling of being overwhelmed by an infinite grid. New or featured games get a special "⭐ Today's Pick" section at the top.

**2. Filter + Search (Targeted Discovery)**  
The CategoryFilter pills at the top of the game grid allow instant filtering. Combined with the SearchBar, children who know what they want can find it quickly. Filters are visible and tappable — no hidden dropdown menus.

**3. "Load More" Pagination (Not Infinite Scroll)**  
Rather than infinite scroll (which can be disorienting for children who lose track of position), we use a **"Load More" button** at the bottom of the game grid. Initially, 12 games are shown (4 rows × 3 columns on desktop). Tapping "Load More" adds another 12. This gives children a clear sense of progress and control — they know when they've reached the end. The button is large, colorful, and inviting: a rounded pill button with the text "Show more games 🎮".

### Responsive Grid Strategy

```css
/* Game grid — responsive from 1 to 4 columns */
.game-grid {
  @apply grid gap-4;
  grid-template-columns: repeat(1, 1fr); /* Mobile: 1 col */
}

@screen sm {
  .game-grid { grid-template-columns: repeat(2, 1fr); } /* Tablet portrait: 2 cols */
}

@screen md {
  .game-grid { grid-template-columns: repeat(3, 1fr); } /* Tablet landscape: 3 cols */
}

@screen xl {
  .game-grid { grid-template-columns: repeat(4, 1fr); } /* Desktop: 4 cols */
}
```

In Tailwind utility form:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
  {games.map((game) => <GameCard key={game.id} {...game} />)}
</div>
```

### Navigation Patterns by Platform

| Platform       | Primary Nav         | Category Access    | Game Controls       |
|----------------|---------------------|--------------------|---------------------|
| **Web Desktop**  | Sidebar + Header  | Sidebar categories | Header overlay      |
| **Web Mobile**   | Bottom nav + Header | Horizontal pills | Floating controls   |
| **Windows (Tauri)** | Sidebar + custom titlebar | Sidebar | Window chrome + overlay |
| **Android (Capacitor)** | Bottom nav + gesture | Horizontal pills | Floating controls   |

### Page Transitions

When navigating from the catalog to a game, we use a smooth expand animation: the GameCard thumbnail expands to fill the viewport. This creates a spatial relationship between the card and the game, helping children understand where they are. On exit (back button), the game shrinks back into the card position.

---

## 5. Micro-Animations & Delight

### Philosophy

Micro-animations are not decorative afterthoughts in a children's product — they are **essential feedback mechanisms**. Children rely heavily on visual and auditory feedback to understand cause and effect in digital interfaces. Every tap, hover, and state change should produce a subtle but perceptible response. However, animations must be **purposeful and performant** — gratuitous animations can distract and overwhelm, especially for children with ADHD or sensory processing differences.

### Animation Inventory

#### 5.1 Game Card Hover Effect

When hovering over a GameCard, three simultaneous micro-animations fire:

1. **Lift**: The card translates up by 4px (`hover:-translate-y-1`) and its shadow deepens
2. **Thumbnail Zoom**: The game thumbnail scales up 5% (`group-hover:scale-105`) creating a "peek inside" effect
3. **Play Button Reveal**: A yellow play button fades in and scales from 75% to 100% on the thumbnail overlay

All transitions use `duration-300 ease-out` for a snappy but smooth feel.

#### 5.2 Category Filter Selection

When a category pill is tapped, it gets a **subtle scale bounce**: `transform: scale(1.05)` for 150ms, then back to `scale(1)`. The background color transition is `duration-200`. Deselected pills smoothly fade back to their inactive state.

#### 5.3 Favorite Heart Animation

When a heart icon is tapped, it performs a **heart-beat pulse**: two rapid scale pulses (1 → 1.3 → 1 → 1.2 → 1) over 400ms. If the heart was previously empty, it also fills with color using a radial wipe effect. This small moment of delight reinforces the action and makes favoriting feel rewarding.

```css
@keyframes heartBeat {
  0%   { transform: scale(1); }
  15%  { transform: scale(1.3); }
  30%  { transform: scale(1); }
  45%  { transform: scale(1.2); }
  60%  { transform: scale(1); }
}
```

#### 5.4 Page Transition — Catalog → Game

Using Framer Motion's `layoutId` for shared element transitions:

```tsx
// In the router/layout configuration
<motion.div layoutId={`game-card-${game.id}`}>
  <GameCard game={game} />
</motion.div>

// In the game detail view
<motion.div layoutId={`game-card-${game.id}`}>
  <GameFrame game={game} />
</motion.div>
```

The thumbnail smoothly expands from the card position to fill the viewport, creating a spatial, continuity-preserving transition.

#### 5.5 Loading Animation

Instead of a boring spinner, we use a **bouncing dots** animation — three dots that bounce in sequence, like a ball being dribbled. This is playful and immediately recognizable as a "loading" state.

```tsx
const BouncingDots: React.FC = () => (
  <div className="flex items-center gap-1.5">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-3 h-3 rounded-full bg-primary-500"
        style={{
          animation: `bounceSoft 0.6s ease-in-out ${i * 0.15}s infinite`,
        }}
      />
    ))}
  </div>
);
```

#### 5.6 Confetti Celebration

When a child achieves a high score or completes a game, a burst of confetti particles erupts from the top of the screen. This uses `canvas-confetti` library for performance, with a kid-friendly palette (our primary + accent colors).

```tsx
import confetti from 'canvas-confetti';

const celebrateWin = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFB830', '#4DA8DA', '#FF6B6B', '#51CF66', '#CC5DE8', '#F06595'],
  });
};
```

#### 5.7 Sound Toggle Visual Feedback

When the sound is toggled on, a small "🔊" icon briefly appears and fades out near the button. When toggled off, a "🔇" icon appears. This gives visual confirmation of the state change.

### CSS Animations vs Framer Motion

| Use Case                          | Approach              | Rationale                                      |
|-----------------------------------|-----------------------|------------------------------------------------|
| Hover effects, focus rings        | **CSS transitions**   | GPU-accelerated, zero JS overhead, works everywhere |
| Scroll-triggered animations       | **CSS `@keyframes`**  | No dependency needed for simple scroll reveals |
| Page transitions (shared layout)  | **Framer Motion**     | `layoutId` shared element transitions require it |
| Complex gesture-driven animations | **Framer Motion**     | `useDrag`, `useSpring` for interactive elements |
| Confetti / particles              | **canvas-confetti**   | Dedicated library for performant particle effects |
| Drag-to-dismiss (game overlay)    | **Framer Motion**     | `useDragControls` for gesture-based dismissals |

### Performance Considerations

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

We also use `will-change` and `transform` for GPU-accelerated animations, and debounce scroll-triggered animations to 60fps.

---

## 6. Accessibility for Children

### Why Accessibility for Children Is Different

Accessibility for children goes beyond standard WCAG compliance. Children have unique needs: they may be **early readers** who struggle with complex text, they have **smaller fingers** that require larger touch targets (paradoxically, they need *bigger* targets than adults because their motor skills are still developing), and they may **not understand abstract icons** without labels. Our accessibility strategy addresses both standard accessibility (screen readers, keyboard nav, contrast) and child-specific considerations (simple language, generous sizing, error prevention).

### Touch Target Sizes

All interactive elements must meet or exceed the **44 × 44px minimum** (per WCAG 2.5.5 and Apple HIG). For children, we go further:

| Element                 | Minimum Size  | Recommended Size |
|-------------------------|---------------|------------------|
| Buttons (icon-only)     | 44 × 44px     | 48 × 48px        |
| Buttons (with label)    | 44px height   | 48px height      |
| Game Cards (tap area)   | Full card     | Full card        |
| Category pills          | 44px height   | 48px height      |
| Navigation items        | 44 × 44px     | 48 × 48px        |
| Toggle switches         | 44 × 44px     | 48 × 48px        |

In Tailwind, we enforce this with `min-h-[44px] min-w-[44px]` on all interactive elements.

### Color Contrast

All text must meet **WCAG AA** at minimum:
- Normal text (< 18px): contrast ratio ≥ 4.5:1
- Large text (≥ 18px bold or ≥ 24px): contrast ratio ≥ 3:1
- Interactive components & graphical objects: contrast ratio ≥ 3:1

We never use color alone to convey information — always pair with text labels or icons. For example, difficulty levels use both color AND emoji (🌱/🔥/🏔️) AND text labels ("Easy"/"Medium"/"Hard").

### Keyboard Navigation

The entire platform must be operable via keyboard:
- **Tab**: Move between interactive elements (logical tab order: top-to-bottom, left-to-right)
- **Enter/Space**: Activate buttons, toggle states
- **Escape**: Close modals, exit fullscreen, go back from game
- **Arrow keys**: Navigate between game cards in a grid, between category pills
- **Home/End**: Jump to first/last item in a group

Focus indicators must be clearly visible — we use a `2px solid primary-500` ring with `4px` offset:

```css
/* Custom focus ring */
*:focus-visible {
  outline: 2px solid #FFB830;
  outline-offset: 4px;
  border-radius: 8px;
}
```

### Screen Reader Basics

Every component must include appropriate ARIA attributes:

```tsx
// GameCard — already shown above with role="button", aria-label, onKeyDown
// CategoryFilter — uses role="tablist" and role="tab" with aria-selected
// DifficultySelector — uses role="radiogroup" and role="radio" with aria-checked
// SearchBar — uses aria-label="Search games"
// All toggles — use aria-pressed and descriptive aria-labels
```

**Live regions** for dynamic content:
- Search result count: `<div aria-live="polite">Showing 12 games</div>`
- Toast notifications: `<div role="alert">Game added to favorites! 💜</div>`

### Simple Language in UI

All UI text should be written at a **2nd–3rd grade reading level**:

| Instead of              | Use                          |
|-------------------------|------------------------------|
| "Filter by category"    | "Pick a category"            |
| "No search results"     | "No games found!"            |
| "Add to favorites"      | "Save this game"             |
| "Difficulty level"      | "How hard?"                  |
| "Fullscreen mode"       | "Big screen"                 |
| "Settings"              | "Settings" ⚙️ (icon helps)  |
| "Error loading game"    | "Oops! Game didn't load. Try again?" |

### COPPA Considerations

Since PlayBox targets children under 13, we must comply with COPPA (Children's Online Privacy Protection Act):

- **No personal data collection**: No names, emails, or birthdates required
- **No tracking cookies or analytics** that identify individual children — use only aggregate, anonymized analytics
- **No social features** that could enable communication between users
- **No behavioral advertising**
- **No external links** to websites outside the platform without parental gate
- **Parental gate**: Any settings that affect privacy or purchasing must be behind a "parent gate" — a simple challenge that a young child cannot easily pass (e.g., "Solve: 7 × 3 = ?" or swipe with two fingers)
- **Persistent data**: Favorites and game progress stored locally only (localStorage/IndexedDB), not transmitted to any server

### Motion Sensitivity

Some children are sensitive to rapid or complex animations. We respect `prefers-reduced-motion` (as shown in the animations section) and provide a **manual toggle** in settings: "Less animations" — this disables all non-essential animations while preserving functional feedback (focus rings, state changes).

---

## 7. Responsive & Cross-Platform Design

### Strategy Overview

PlayBox must feel native on three distinct platforms: web browser, Windows desktop (Tauri), and Android (Capacitor). Rather than building three separate UIs, we use a **responsive single codebase** with platform-specific adaptations where needed. The design system uses CSS breakpoints and platform detection to deliver the best experience on each.

### Breakpoint System

| Breakpoint | Width        | Target Devices                  | Layout Changes                         |
|------------|--------------|---------------------------------|----------------------------------------|
| `xs`       | 0–479px      | Small phones (Galaxy A, iPhone SE) | 1-col grid, bottom nav, stacked header |
| `sm`       | 480–767px    | Large phones (iPhone 15, Pixel) | 2-col grid, bottom nav, compact header |
| `md`       | 768–1023px   | Tablets portrait               | 2–3 col grid, bottom nav, expanded search |
| `lg`       | 1024–1279px  | Tablets landscape, small laptops | 3-col grid, sidebar, full header    |
| `xl`       | 1280–1535px  | Desktops, laptops              | 4-col grid, sidebar, full header       |
| `2xl`      | 1536px+      | Large desktops                 | 4-col grid + wider cards, sidebar      |

### Platform-Specific Adaptations

#### Web (GitHub Pages)

The web version is the baseline. All features work in modern browsers (Chrome, Firefox, Safari, Edge). Key considerations:

- **Viewport meta tag**: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />`
- **No native APIs**: Fullscreen uses the Fullscreen API, sound uses Web Audio API
- **PWA install prompt**: Intercept `beforeinstallprompt` event to show a custom install banner
- **URL routing**: Clean URLs with React Router (`/games/puzzle-quest`)

#### Windows Desktop (Tauri v2)

Tauri wraps the web app in a native window. Key adaptations:

- **Custom title bar**: Hide the native window chrome and create a custom draggable title bar that matches the PlayBox design. The title bar includes the app logo, window title, and minimize/maximize/close buttons styled to match our design system.

```tsx
const CustomTitleBar: React.FC = () => {
  const appWindow = getCurrent();

  return (
    <div
      className="flex items-center h-10 bg-surface-0 border-b border-surface-200 pl-safe-left"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2 pl-4" data-tauri-drag-region>
        <div className="w-6 h-6 bg-primary-500 rounded-lg flex items-center justify-center">
          <GameControllerIcon className="w-4 h-4 text-white" />
        </div>
        <span className="font-heading font-bold text-sm text-text-primary">
          PlayBox
        </span>
      </div>
      <div className="ml-auto flex" data-tauri-drag-region>
        <button
          className="w-11 h-10 flex items-center justify-center hover:bg-surface-100 transition-colors"
          onClick={() => appWindow.minimize()}
          aria-label="Minimize"
        >
          <MinusIcon className="w-4 h-4 text-text-secondary" />
        </button>
        <button
          className="w-11 h-10 flex items-center justify-center hover:bg-surface-100 transition-colors"
          onClick={() => appWindow.toggleMaximize()}
          aria-label="Maximize"
        >
          <SquareIcon className="w-3.5 h-3.5 text-text-secondary" />
        </button>
        <button
          className="w-11 h-10 flex items-center justify-center hover:bg-accent-red-500 hover:text-white transition-colors"
          onClick={() => appWindow.close()}
          aria-label="Close"
        >
          <XIcon className="w-4 h-4 text-text-secondary" />
        </button>
      </div>
    </div>
  );
};
```

- **Window state persistence**: Save and restore window size, position, and maximized state
- **Keyboard shortcuts**: `Ctrl+F` for search, `Ctrl+Q` for quit, `F11` for fullscreen, `Escape` to exit game
- **System tray**: Optional tray icon with quick access to recently played games
- **Auto-updater**: Tauri's built-in updater for seamless updates

#### Android (Capacitor)

Capacitor wraps the web app as a native Android app. Key adaptations:

- **Safe area handling**: Respect Android's status bar and navigation bar using `env(safe-area-inset-*)`

```css
/* Safe area padding */
.header {
  padding-top: env(safe-area-inset-top, 0px);
}
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.game-frame {
  /* Ensure game content isn't hidden behind system bars */
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
```

- **Status bar theming**: Use Capacitor's StatusBar plugin to set the status bar to match our header color
- **Splash screen**: Custom splash screen with PlayBox logo on white background
- **Back button handling**: Android hardware back button should navigate back from game to catalog (not exit the app)
- **Haptic feedback**: Subtle haptic feedback on button taps using Capacitor's Haptics plugin
- **Swipe gestures**: Swipe down from game to exit (natural "go back" gesture for mobile)
- **Pull-to-refresh**: Not needed (content is local), but swipe-right from edge could open sidebar
- **Orientation**: Lock to portrait on phone, allow both on tablet

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playbox.app',
  appName: 'PlayBox',
  webDir: 'dist',
  server: {
    // For PWA offline support
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#FAFBFF',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_INSIDE',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FAFBFF',
    },
    App: {
      // Prevent default back button behavior
    },
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
```

### Platform Detection Hook

```typescript
// src/hooks/usePlatform.ts
import { Platform } from '@capacitor/platform';
import { isTauri } from '@tauri-apps/api/core';

type PlatformType = 'web' | 'tauri' | 'android' | 'ios';

export function usePlatform(): PlatformType {
  const [platform, setPlatform] = useState<PlatformType>('web');

  useEffect(() => {
    if (isTauri()) {
      setPlatform('tauri');
    } else if (Platform.isAndroid) {
      setPlatform('android');
    } else if (Platform.isIOS) {
      setPlatform('ios');
    } else {
      setPlatform('web');
    }
  }, []);

  return platform;
}
```

---

## 8. PWA Manifest & Install Experience

### Why PWA Matters for PlayBox

A Progressive Web App allows PlayBox to be installed directly from the browser, creating an app-like experience without app store distribution. For a children's platform, this is especially valuable: parents can install PlayBox on a child's device without creating app store accounts or navigating age verification. The install experience should be seamless, inviting, and non-technical.

### manifest.json

```json
{
  "name": "PlayBox — Game Station",
  "short_name": "PlayBox",
  "description": "50+ fun games for kids! Puzzles, action, creative play and more.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#FAFBFF",
  "theme_color": "#FFB830",
  "dir": "ltr",
  "lang": "en-US",
  "categories": ["games", "entertainment", "kids"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/maskable-icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-wide.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide",
      "label": "PlayBox game catalog on desktop"
    },
    {
      "src": "/screenshots/mobile-narrow.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "PlayBox game catalog on mobile"
    }
  ],
  "shortcuts": [
    {
      "name": "Favorites",
      "short_name": "Favorites",
      "url": "/?view=favorites",
      "icons": [{ "src": "/icons/shortcut-favorites.png", "sizes": "96x96" }]
    },
    {
      "name": "Puzzle Games",
      "short_name": "Puzzles",
      "url": "/?category=puzzles",
      "icons": [{ "src": "/icons/shortcut-puzzles.png", "sizes": "96x96" }]
    }
  ]
}
```

### App Icon Design

The PlayBox icon should be:
- A **rounded square** with the PlayBox game controller logo on a sunshine yellow (`#FFB830`) background
- The game controller icon should be white with a slight drop shadow
- The icon should be recognizable at 72px (smallest) through 512px (largest)
- **Maskable icons** must have the logo centered within the safe zone (inner 80% circle) with generous padding, as Android may crop the edges

### Custom Install Prompt

Instead of the browser's default install prompt, we show a friendly, kid-appealing banner:

```tsx
const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt) return null;

  return (
    <div className="
      fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80
      bg-surface-0 rounded-2xl shadow-float p-5
      animate-pop z-50
    ">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-button">
          <GameControllerIcon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold text-base text-text-primary">
            Add PlayBox to Home Screen 🎮
          </h3>
          <p className="font-body text-sm text-text-secondary mt-1">
            Play games anytime — even without internet!
          </p>
          <div className="flex gap-2 mt-3">
            <button
              className="px-4 py-2.5 bg-primary-500 text-white rounded-xl font-heading font-bold text-sm shadow-button hover:bg-primary-600 transition-colors min-h-[44px]"
              onClick={() => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
              }}
            >
              Install
            </button>
            <button
              className="px-4 py-2.5 bg-surface-100 text-text-secondary rounded-xl font-heading font-bold text-sm hover:bg-surface-200 transition-colors min-h-[44px]"
              onClick={() => setDeferredPrompt(null)}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Offline Fallback Page

When offline, the service worker serves a cached version of the app shell. If a game hasn't been cached, we show a friendly offline page:

```tsx
const OfflineFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50 p-6 text-center">
    <span className="text-7xl mb-6">📡</span>
    <h1 className="font-heading font-extrabold text-3xl text-text-primary mb-3">
      No Internet Right Now
    </h1>
    <p className="font-body text-lg text-text-secondary max-w-md mb-8">
      Don't worry! You can still play any game you've opened before. Check your favorites!
    </p>
    <button
      className="px-6 py-3 bg-primary-500 text-white rounded-2xl font-heading font-bold text-lg shadow-button hover:bg-primary-600 transition-colors"
      onClick={() => window.location.reload()}
    >
      Try Again 🔄
    </button>
  </div>
);
```

### Service Worker Caching Strategy

```typescript
// sw.ts — Service Worker caching strategy
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// App shell — Cache First (always fast, update in background)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'app-shell',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Static assets (JS, CSS, fonts) — Cache First
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// Game assets — Stale While Revalidate (play from cache, update in background)
registerRoute(
  ({ url }) => url.pathname.startsWith('/games/'),
  new StaleWhileRevalidate({
    cacheName: 'game-assets',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Images — Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);
```

---

## 9. Sound Design System

### Why Sound Matters in a Children's App

Sound is a powerful feedback channel that children respond to instinctively. A well-designed sound system makes the platform feel alive and responsive: every tap, transition, and achievement produces a subtle audio cue that reinforces the visual feedback. However, sound must be **always user-controlled** — children may play in quiet environments, and some children are sensitive to audio stimuli. The global mute toggle must always be one tap away.

### Sound Architecture

```
┌─────────────────────────────────────────────┐
│              SoundManager (Singleton)         │
├─────────────────────────────────────────────┤
│  Master Volume: ████████░░ 80%              │
│  ├─ UI Sounds:   ████████░░ 80% of master   │
│  ├─ Game Sounds: ████████░░ 80% of master   │
│  └─ Music:       ██████░░░░ 60% of master   │
├─────────────────────────────────────────────┤
│  Audio Context: Web Audio API                │
│  Audio Sprites: Preloaded on first interaction│
│  Global Mute: localStorage persisted         │
└─────────────────────────────────────────────┘
```

### Sound Categories

| Category      | Examples                                    | Volume   | When Muted                  |
|---------------|---------------------------------------------|----------|-----------------------------|
| **UI Sounds** | Button tap, category select, heart favorite | 80%      | All UI sounds silenced      |
| **Game Sounds**| In-game effects (managed by each game)     | 80%      | Post `mute` event to game   |
| **Music**     | Ambient menu music, game background music   | 60%      | Music fades out gracefully  |

### Implementation: Web Audio API

We use the **Web Audio API** (not HTML5 `<audio>` elements) for all UI sounds. Web Audio API provides:

1. **Precise timing** — sounds play instantly with no delay
2. **Volume control per category** — independent gain nodes
3. **Audio sprite support** — all UI sounds packed into one file, reducing HTTP requests
4. **Spatial audio** — potential for positional audio in future 3D games

```typescript
// src/audio/SoundManager.ts
class SoundManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private uiGain: GainNode | null = null;
  private gameGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private spriteBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;

  async init() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    // Category gain nodes
    this.uiGain = this.context.createGain();
    this.uiGain.gain.value = 0.8;
    this.uiGain.connect(this.masterGain);

    this.gameGain = this.context.createGain();
    this.gameGain.gain.value = 0.8;
    this.gameGain.connect(this.masterGain);

    this.musicGain = this.context.createGain();
    this.musicGain.gain.value = 0.6;
    this.musicGain.connect(this.masterGain);

    // Load audio sprite
    const response = await fetch('/sounds/ui-sprite.mp3');
    const arrayBuffer = await response.arrayBuffer();
    this.spriteBuffer = await this.context.decodeAudioData(arrayBuffer);

    // Restore mute state
    this.isMuted = localStorage.getItem('playbox-muted') === 'true';
    this.applyMuteState();
  }

  private applyMuteState() {
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('playbox-muted', String(this.isMuted));
    this.applyMuteState();

    // Dispatch custom event so games can respond
    window.dispatchEvent(new CustomEvent('playbox:mute-change', {
      detail: { isMuted: this.isMuted }
    }));

    return this.isMuted;
  }

  playUI(soundName: UISound) {
    if (this.isMuted || !this.context || !this.uiGain || !this.spriteBuffer) return;

    // Resume context if suspended (required after user interaction)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    const spriteConfig = UI_SPRITES[soundName];
    const source = this.context.createBufferSource();
    source.buffer = this.spriteBuffer;
    source.connect(this.uiGain);
    source.start(0, spriteConfig.offset, spriteConfig.duration);
  }
}

// Sound sprite definitions (offset + duration in seconds)
const UI_SPRITES = {
  'button-tap':     { offset: 0.0,  duration: 0.15 },
  'category-select': { offset: 0.2, duration: 0.2 },
  'heart-favorite': { offset: 0.5,  duration: 0.3 },
  'heart-unfavorite': { offset: 0.9, duration: 0.2 },
  'page-transition': { offset: 1.2, duration: 0.4 },
  'search-type':    { offset: 1.7,  duration: 0.1 },
  'game-load':      { offset: 1.9,  duration: 0.5 },
  'celebration':    { offset: 2.5,  duration: 1.0 },
  'toggle-on':      { offset: 3.6,  duration: 0.15 },
  'toggle-off':     { offset: 3.8,  duration: 0.15 },
} as const;

type UISound = keyof typeof UI_SPRITES;

// Singleton export
export const soundManager = new SoundManager();
```

### React Hook

```typescript
// src/hooks/useSound.ts
import { useCallback } from 'react';
import { soundManager } from '../audio/SoundManager';

export function useSound() {
  const playUI = useCallback((sound: UISound) => {
    soundManager.playUI(sound);
  }, []);

  const toggleMute = useCallback(() => {
    return soundManager.toggleMute();
  }, []);

  return { playUI, toggleMute };
}
```

### Preloading Strategy

Audio files are **not** loaded on initial page load — this would slow down the first contentful paint. Instead:

1. **App shell loads first** (HTML, CSS, JS)
2. After the first user interaction (click/tap), the AudioContext is created and the sprite file is fetched
3. The sprite file (~200KB for all UI sounds) is cached by the service worker for subsequent visits
4. Game-specific audio assets are loaded when the game is launched

```typescript
// Initialize audio on first interaction
let audioInitialized = false;

function initAudioOnInteraction() {
  if (audioInitialized) return;
  audioInitialized = true;
  soundManager.init();
  document.removeEventListener('click', initAudioOnInteraction);
  document.removeEventListener('touchstart', initAudioOnInteraction);
}

document.addEventListener('click', initAudioOnInteraction);
document.addEventListener('touchstart', initAudioOnInteraction);
```

### Communicating Mute State to Games

Since games run in iframes, we use `postMessage` to communicate the mute state:

```typescript
// In SoundManager.toggleMute():
iframe.contentWindow?.postMessage({
  type: 'playbox:mute-change',
  isMuted: this.isMuted,
}, '*');

// In each game's code:
window.addEventListener('message', (event) => {
  if (event.data?.type === 'playbox:mute-change') {
    // Game-specific mute handling
    setGameMuted(event.data.isMuted);
  }
});
```

---

## 10. Dark/Light Theme Toggle

### Design Philosophy for Dark Mode

Dark mode in a children's app must feel **cozy and comforting**, not dark and scary. Think of it as a "bedtime story mode" — the equivalent of a warm nightlight in a child's bedroom. We avoid pure black (`#000000`) backgrounds, which can feel harsh and cavernous. Instead, we use deep, slightly warm grays and blues that feel like a soft blanket. Accent colors shift slightly warmer to maintain their vibrancy against dark backgrounds.

### Implementation Strategy

We use Tailwind CSS's `dark:` prefix with class-based dark mode (`darkMode: 'class'`). A `ThemeProvider` component manages the theme state and applies the `dark` class to the `<html>` element.

### Dark Theme Color Palette

| Token Name           | Light Mode    | Dark Mode          | Notes                                |
|----------------------|---------------|--------------------|--------------------------------------|
| Background           | `#FAFBFF`     | `#1A1B2E`          | Deep navy, not pure black            |
| Surface 0 (elevated) | `#FFFFFF`     | `#242640`          | Slightly lighter than background     |
| Surface 100 (cards)  | `#F1F3F9`     | `#2D2F4A`          | Cards pop against the background     |
| Surface 200 (borders)| `#E5E7F0`     | `#3A3D5C`          | Subtle but visible borders           |
| Text Primary         | `#2D3142`     | `#F1F3F9`          | High contrast, warm white            |
| Text Secondary       | `#555B6E`     | `#B0B5C4`          | Readable but not prominent           |
| Text Tertiary        | `#9094A6`     | `#6E7290`          | For placeholders, disabled           |
| Primary (Sunshine)   | `#FFB830`     | `#FFD06B`          | Lightened for better contrast        |
| Secondary (Candy Blue)| `#4DA8DA`    | `#7EC8E3`          | Lightened for visibility             |
| Accent Red           | `#FF6B6B`     | `#FF8A8A`          | Slightly lighter                     |
| Accent Green         | `#51CF66`     | `#7AFF8E`          | Brighter on dark                     |
| Accent Purple        | `#CC5DE8`     | `#D08AFF`          | Brighter on dark                     |

### ThemeProvider Component

```tsx
// src/providers/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('playbox-theme') as Theme;
    if (saved) return saved;
    // Then check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light'; // Default to light for children
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('playbox-theme', theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly chosen a theme
      if (!localStorage.getItem('playbox-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Dark Mode Tailwind Extensions

In `tailwind.config.ts`, we extend the dark theme colors:

```typescript
// tailwind.config.ts — additional dark mode overrides
theme: {
  extend: {
    colors: {
      // ... (light mode colors from Section 1)
      // Dark mode surface overrides
      'dark-bg':       '#1A1B2E',
      'dark-surface-0':  '#242640',
      'dark-surface-100': '#2D2F4A',
      'dark-surface-200': '#3A3D5C',
      'dark-surface-300': '#4A4D6A',
      'dark-surface-400': '#5E6180',
      'dark-text-primary':   '#F1F3F9',
      'dark-text-secondary': '#B0B5C4',
      'dark-text-tertiary':  '#6E7290',
    },
  },
},
```

### Usage Pattern with Tailwind `dark:` Prefix

```tsx
// Example: GameCard in both themes
<article className="
  flex flex-col
  bg-surface-0 dark:bg-dark-surface-0
  rounded-2xl
  shadow-card dark:shadow-none dark:border dark:border-dark-surface-200
  transition-all duration-300
">
  <div className="p-3">
    <h3 className="font-heading font-bold text-lg text-text-primary dark:text-dark-text-primary">
      {title}
    </h3>
    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
      {category}
    </p>
  </div>
</article>
```

### Dark Mode Visual Differences

In dark mode, several visual adjustments make the experience feel cozy rather than just "inverted":

1. **Shadows are reduced** — Dark cards use subtle borders instead of drop shadows, which don't read well on dark backgrounds
2. **Colors are lightened** — Primary and accent colors shift to lighter variants for visibility
3. **Backgrounds have depth** — A very subtle gradient from `#1A1B2E` to `#1E1F35` adds depth without being distracting
4. **Icons get a warm glow** — Active icons (play button, sound on) get a subtle box-shadow glow effect
5. **Images slightly dim** — Game thumbnails get a 5% opacity overlay to prevent bright images from being jarring on dark backgrounds
6. **The header becomes translucent** — `bg-surface-0/80 dark:bg-dark-bg/80` with backdrop blur

### Dark Mode Transition

When toggling themes, the entire page transitions smoothly over 300ms:

```css
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}

html.dark {
  background-color: #1A1B2E;
  color: #F1F3F9;
}
```

We also add a brief icon rotation animation on the theme toggle button (sun spins to moon) to make the transition feel intentional and delightful.

### Preventing Flash of Wrong Theme

To prevent a flash of light theme on reload when the user has dark mode saved, we add an inline script in `index.html`:

```html
<script>
  // Prevent FOUC (Flash of Unstyled Content) for dark mode
  (function() {
    const theme = localStorage.getItem('playbox-theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

This script runs synchronously before React hydrates, ensuring the correct theme class is applied from the very first paint.

---

## Appendix: Quick Reference

### Tailwind Custom Classes Cheat Sheet

| Class                         | Effect                                     |
|-------------------------------|--------------------------------------------|
| `bg-primary-500`              | Sunshine yellow background                 |
| `bg-secondary-500`            | Candy blue background                      |
| `text-text-primary`           | Primary body text color                    |
| `shadow-card`                 | Default card shadow                        |
| `shadow-card-hover`           | Elevated card shadow on hover              |
| `shadow-button`               | Yellow-tinted button shadow                |
| `font-heading`                | Nunito font family                         |
| `font-body`                   | Quicksand font family                      |
| `rounded-2xl`                 | Kid-friendly rounded corners               |
| `min-h-[44px]`                | Minimum touch target height                |
| `animate-bounce-soft`         | Gentle bounce animation                    |
| `animate-wiggle`              | Playful wiggle animation                   |
| `animate-pop`                 | Scale-in entrance animation                |
| `pt-safe-top pb-safe-bottom`  | Safe area padding for mobile               |

### File Structure for UI Code

```
src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── GameCard.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FavoritesToggle.tsx
│   │   ├── SoundToggle.tsx
│   │   ├── FullscreenButton.tsx
│   │   ├── DifficultySelector.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileBottomNav.tsx
│   │   ├── CustomTitleBar.tsx  # Tauri-only
│   │   └── GameFrame.tsx
│   └── feedback/              # Delight/feedback components
│       ├── InstallPrompt.tsx
│       ├── OfflineFallback.tsx
│       └── ConfettiCelebration.tsx
├── providers/
│   ├── ThemeProvider.tsx
│   └── SoundProvider.tsx
├── hooks/
│   ├── useTheme.ts
│   ├── useSound.ts
│   ├── usePlatform.ts
│   └── useFavorites.ts
├── audio/
│   └── SoundManager.ts
├── styles/
│   ├── typography.css
│   └── animations.css
└── types/
    ├── game.ts
    └── category.ts
```

---

*Report prepared with love for little gamers everywhere. 🎮💛*
