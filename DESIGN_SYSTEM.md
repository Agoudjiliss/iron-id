# iron-id — Design System

Document de référence UI/UX pour le frontend iron-id. Ce guide assure une cohérence visuelle, une excellence en UX et des performances optimales.

## 1. Principes Fondamentaux

| Principe | Description |
|----------|-------------|
| **Clarté** | Hiérarchie lisible, pas de surcharge visuelle |
| **Confiance** | Ton sobre, couleurs sémantiques, feedback immédiat |
| **Accessibilité** | Contraste WCAG AAA, focus visible, zones ≥ 48px |
| **Cohérence** | Même famille typo, rayons, espacements |
| **Performance** | Chargement < 2s, animations 60fps |
| **Inclusivité** | Multilingue (RTL arabe), mode sombre |

## 2. Typographie

- **Police** : Outfit (Google Fonts), fallback system-ui
- **Titre page** : `text-2xl md:text-3xl lg:text-4xl` font-bold
- **Hero** : `text-3xl sm:text-4xl`
- **Sous-titre** : `text-base md:text-lg` text-ink-muted
- **Corps** : `text-sm md:text-base`
- **Labels** : `text-sm font-medium text-ink`
- **Données techniques** : `font-mono text-xs` (truncate + tooltip)

## 3. Palette

### Light
- Brand 500: #6366f1, 600: #4f46e5
- Surface: #f8fafc, elevated: #ffffff
- Ink: #0f172a, muted: #64748b

### Dark
- Variables CSS via `.dark`
- Surface: #1e293b, elevated: #0f172a
- Ink: #f1f5f9

## 4. Composants

- **btn-primary** : CTA, py-3, min-w-120px
- **btn-secondary** : Bordure, hover fill
- **input-base** : Bordure slate, focus ring brand-500
- **card** : rounded-card, shadow-card
- **card-hover** : hover:scale-1.02, shadow-cardHover

## 5. Fichiers

- `tailwind.config.js` : Thème (darkMode: 'class')
- `src/index.css` : Variables CSS, composants
- `index.html` : Fonts, meta theme-color, script init dark
