# iron-id — Tableau d’art & Design System

Document de référence UI/UX pour le frontend iron-id. Utilisé pour garder une cohérence visuelle et un niveau d’excellence sur l’ensemble de l’interface.

---

## 1. Principes

| Principe | Description |
|----------|-------------|
| **Clarté** | Hiérarchie lisible (titres, sous-titres, corps), pas de surcharge visuelle. |
| **Confiance** | Ton sobre, couleurs sémantiques (succès = vert, erreur = rouge), feedback immédiat. |
| **Accessibilité** | Contraste suffisant (WCAG AA), focus visible, labels sur les champs, zones cliquables ≥ 44px. |
| **Cohérence** | Même famille typo, mêmes rayons, mêmes espacements sur toute l’app. |

---

## 2. Typographie

| Usage | Police | Poids | Taille (Tailwind) | Remarque |
|-------|--------|--------|-------------------|----------|
| Titre page | Outfit | 700 | `text-2xl`–`text-4xl` | Hero `text-3xl` sm:`text-4xl` |
| Sous-titre / intro | Outfit | 400 | `text-lg` | `text-ink-muted` |
| Cartes / sections | Outfit | 600 | `text-lg` | Titre de carte |
| Corps | Outfit | 400 | `text-sm` | Description, labels |
| Labels formulaires | Outfit | 500 | `text-sm` | `text-ink` |
| Données techniques | Monospace | 400 | `text-xs` | Hash, token (truncate si long) |

**Police principale :** [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts), fallback `system-ui`.

---

## 3. Palette de couleurs

### 3.1 Couleurs principales

| Nom | Hex | Usage Tailwind |
|-----|-----|----------------|
| **Brand 50** | `#eef2ff` | Fonds légers, hover |
| **Brand 500** | `#6366f1` | Icônes, liens |
| **Brand 600** | `#4f46e5` | Boutons primaires, barre de progression |
| **Brand 700** | `#4338ca` | Hover bouton primaire |

### 3.2 Surfaces & texte

| Nom | Hex | Usage |
|-----|-----|--------|
| **Surface** | `#f8fafc` | Fond de page (`bg-surface`) |
| **Surface elevated** | `#ffffff` | Cartes, header, inputs |
| **Surface muted** | `#f1f5f9` | Zones secondaires |
| **Ink** | `#0f172a` | Texte principal |
| **Ink muted** | `#64748b` | Sous-titres, labels secondaires |
| **Ink subtle** | `#94a3b8` | Placeholders |

### 3.3 Sémantiques

| Contexte | Couleur | Exemple |
|----------|---------|---------|
| Succès | Emerald (50/200/600/700/800) | Message « Protection réussie », statut Authentic |
| Erreur | Red (50/200/700/800) | Message d’erreur, champs invalides |
| Avertissement | Amber (50/200/800) | Statut Modified |
| Info / neutre | Slate (100/200) | Bordures, séparateurs |

---

## 4. Espacements & dimensions

| Token | Valeur | Usage |
|-------|--------|--------|
| **page** | `clamp(1rem, 4vw, 2rem)` | Padding horizontal des blocs (px-page) |
| **section** | `clamp(2rem, 6vw, 4rem)` | Espacement vertical entre sections (py-section) |
| **max-w-content** | `72rem` | Largeur max du contenu (layout) |
| **max-w-form** | `32rem` | Largeur max des formulaires (Protect, Verify) |

Espacements internes : multiples de 4 (Tailwind : `gap-2` = 8px, `p-5` = 20px, etc.).

---

## 5. Rayons & ombres

| Élément | Classe | Valeur |
|---------|--------|--------|
| Carte | `rounded-card` | `1rem` |
| Bouton / pill | `rounded-button` | `0.75rem` |
| Input | `rounded-input` | `0.5rem` |
| Ombre carte | `shadow-card` | Légère (1px blur) |
| Ombre carte hover | `shadow-cardHover` | Un peu plus marquée |
| Header | `shadow-header` | Bordure basse discrète |

---

## 6. Composants

### 6.1 Boutons

| Variant | Classe | Usage |
|---------|--------|--------|
| Primaire | `btn-primary` | CTA principal (Protéger, Télécharger, Vérifier) |
| Secondaire | `btn-secondary` | Actions secondaires (Réessayer, Protéger une autre) |

Règles : hauteur confortable (py-2.5 ou py-3), pas de bordure sur primaire, bordure slate sur secondaire.

### 6.2 Champs de formulaire

| Élément | Classe | Règles |
|---------|--------|--------|
| Input texte / Select | `input-base` | Bordure slate-200, focus ring brand-500/20 |
| Label | `text-sm font-medium text-ink mb-1.5` | Au-dessus du champ |

### 6.3 Cartes

| Usage | Classe | Remarque |
|-------|--------|----------|
| Carte simple | `card` | Fond blanc, bordure légère, shadow-card |
| Carte interactive | `card-hover` | Idem + hover shadow-cardHover |
| Zone drop (fichier) | `card` + `border-2 border-dashed` | Hover border-brand-300 |

### 6.4 États de feedback

| État | Style |
|------|--------|
| Succès | `bg-emerald-50 border-emerald-200 text-emerald-800` |
| Erreur | `bg-red-50/50 border-red-200 text-red-700/800` |
| En cours | Spinner `border-brand-200 border-t-brand-600` + barre de progression `bg-brand-600` |

---

## 7. Navigation & layout

- **Header** : sticky, fond `surface-elevated` avec léger backdrop-blur, bordure basse.
- **Logo** : icône bouclier dans un carré brand-500 + texte « iron-id ».
- **Liens actifs** : fond `brand-500/12`, texte `brand-700`.
- **Sélecteur de langue** : pills dans un conteneur slate-100, actif = fond blanc + ombre.
- **Footer** : bordure haute, texte muted, une ligne.

---

## 8. Accessibilité (résumé)

| Point | Implémentation |
|-------|----------------|
| Focus clavier | `:focus-visible` avec ring brand-500 (dans index.css). |
| Contraste | Texte ink sur surface ≥ 4.5:1 ; muted sur surface ≥ 4.5:1. |
| Zones cliquables | Boutons et liens ≥ 44px de zone utile (py-2.5 min). |
| Labels | Tous les champs ont un `<label>` visible. |
| Navigation | `aria-label="Navigation principale"` sur la nav, `role="group"` + `aria-label="Langue"` sur le sélecteur de langue. |
| Images | `alt=""` quand décoratif, alt descriptif pour les previews. |

---

## 9. Récapitulatif des écrans

| Écran | Objectif UX | Éléments clés |
|-------|-------------|---------------|
| **Accueil** | Orienter vers Protéger ou Vérifier | Hero court, 2 cartes CTA, 3 cartes « comment ça marche ». |
| **Protéger** | Upload → options → traitement → résultat | Dropzone claire, formulaire compact, barre de progression, bloc succès/erreur, bouton téléchargement. |
| **Vérifier** | Upload → résultat de vérification | Même dropzone, un bouton « Vérifier », carte de statut (authentic/modified/…) + détails pliables. |

---

## 10. Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `tailwind.config.js` | Thème (couleurs, fontFamily, borderRadius, boxShadow, spacing). |
| `src/index.css` | Base (body), focus-visible, classes composants (btn-primary, input-base, card). |
| `index.html` | Précharge Outfit, theme-color, classes body. |
| `App.tsx` | Shell (header, nav, footer). |
| `pages/HomePage.tsx` | Hero, CTAs, features. |
| `pages/ProtectPage.tsx` | Formulaire protection, états, résultat. |
| `pages/VerifyPage.tsx` | Formulaire vérification, résultat. |

---

## 11. PWA & Mobile

### PWA
- **Manifest** : `display: standalone`, `orientation: portrait-primary`, shortcuts Protéger / Vérifier.
- **Service worker** : `autoUpdate`, `navigateFallback` vers `/index.html` pour offline, cache des fonts Google.
- **Meta** : `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`.

### Mobile (< 768px)
- **Navigation** : barre fixe en bas (Accueil, Protéger, Vérifier) avec icônes + labels ; header réduit (logo + sélecteur de langue).
- **Safe areas** : `env(safe-area-inset-*)` sur le header (top) et la bottom nav (bottom, left, right).
- **Contenu** : `main` avec `pb-24` pour ne pas passer sous la bottom nav.
- **Touch** : zones tactiles `min-h-touch` (44px), inputs 16px pour éviter le zoom iOS.
- **Pages** : dropzones `min-h-[200px]`, padding réduit sur petit écran.

Ce document sert de **tableau d’art** et de référence pour toute évolution ou recette UI/UX du frontend iron-id.
