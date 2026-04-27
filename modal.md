# Event Modal — Glassmorphism Refactor

This document explains the changes made to the "Create New Event" / "Edit Event" modal to apply a glassmorphism look, remove a stray accent line, and unify input styling.

## Goals

1. Give the modal a translucent, blurred-glass appearance consistent with the dark/green theme.
2. Remove the green vertical accent bar that appeared on the header.
3. Make the **Event Type** select and **Description** textarea visually identical to the **Title** and date inputs.

## Files touched

- [frontend/src/app/globals.css](frontend/src/app/globals.css)
- [frontend/src/components/ui/dialog.tsx](frontend/src/components/ui/dialog.tsx)
- [frontend/src/components/calendar/EventForm.tsx](frontend/src/components/calendar/EventForm.tsx)

---

## 1. Glassmorphism on the modal container

The dialog uses a shared utility class `.dialog-content-branded` defined in [globals.css:282-291](frontend/src/app/globals.css#L282-L291) and applied by `DialogContent` in [dialog.tsx:41](frontend/src/components/ui/dialog.tsx#L41).

```css
.dialog-content-branded {
  background-color: rgba(15, 18, 16, 0.45);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 20px 60px -15px rgba(0, 143, 76, 0.18),
    0 8px 32px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
}
```

What each piece does:

- **`background-color: rgba(15, 18, 16, 0.45)`** — a very dark green-tinted base at 45% opacity. Letting the page show through is what makes the glass effect possible.
- **`backdrop-filter: blur(24px) saturate(140%)`** — the core of glassmorphism. Blurs whatever is behind the modal and slightly boosts saturation so the blurred backdrop reads as colored glass instead of grey fog. `-webkit-backdrop-filter` is the Safari prefix.
- **`border: 1px solid rgba(255, 255, 255, 0.1)`** — a faint white outline that catches the eye and defines the panel edge against the blurred background.
- **`box-shadow`** — three stacked layers:
  - `0 20px 60px -15px rgba(0, 143, 76, 0.18)` — large soft green halo below, ties the modal to the brand color.
  - `0 8px 32px rgba(0, 0, 0, 0.45)` — neutral depth shadow for elevation.
  - `inset 0 1px 0 0 rgba(255, 255, 255, 0.06)` — top inner highlight, simulates light hitting the glass edge.

The overlay behind the modal (`.dialog-overlay-branded`, [globals.css:272-280](frontend/src/app/globals.css#L272-L280)) already provides a green radial vignette and a `backdrop-blur-md` is applied via Tailwind in [dialog.tsx:24](frontend/src/components/ui/dialog.tsx#L24), so the page content blurs even further behind the glass — reinforcing the depth illusion.

## 2. Removing the green accent bar on the header

Previously `DialogHeader` carried a left border:

```tsx
className={cn("flex flex-col space-y-2 text-left pl-3 border-l-2 border-[color-mix(in_srgb,var(--green-nice)_60%,transparent)]", className)}
```

That `border-l-2` was the green vertical line visible at the top-left of the modal. It was removed in [dialog.tsx:59-70](frontend/src/components/ui/dialog.tsx#L59-L70):

```tsx
const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
)
```

The associated `pl-3` indent was dropped along with it so the title and description align flush with the rest of the modal content.

## 3. Unifying the input styles

The Title and date inputs use the shadcn `Input` component, which inherits its background and border from props passed in [EventForm.tsx:171,184,197](frontend/src/components/calendar/EventForm.tsx#L171):

```tsx
className="bg-[#ffffff]/5 border-[#ffffff]/20 text-white placeholder:text-[#ffffff]/50"
```

Translation: 5% white fill, 20% white border, white text, 50% white placeholder.

Previously the **SelectTrigger** and **Textarea** rendered with their default shadcn classes (`bg-background` / `border-input`), which are solid black and a different border color — that's why they looked heavier than the inputs in the screenshot.

### Why `!` (important) was needed

The project's `cn` helper at [frontend/src/utils/cn.ts](frontend/src/utils/cn.ts) is plain `clsx` — it does **not** include `tailwind-merge`. So when shadcn's component already has `bg-background` baked in, simply appending `bg-[#ffffff]/5` produces two competing utilities and CSS specificity / source order decides the winner (often the wrong one). Prefixing with `!` forces the override deterministically.

### SelectTrigger

[EventForm.tsx:206](frontend/src/components/calendar/EventForm.tsx#L206):

```tsx
<SelectTrigger className="h-9 rounded-lg !bg-[#ffffff]/5 !border-[#ffffff]/20 px-2.5 py-1 text-white focus:border-green-nice focus:ring-green-nice/30">
```

- `h-9 rounded-lg px-2.5 py-1` matches the input's box model.
- `!bg-[#ffffff]/5 !border-[#ffffff]/20` matches its surface.
- Focus ring uses the brand green for consistency with the rest of the form.

### Textarea

[EventForm.tsx:231](frontend/src/components/calendar/EventForm.tsx#L231):

```tsx
className="rounded-lg !bg-[#ffffff]/5 !border-[#ffffff]/20 px-2.5 py-1.5 text-white placeholder:text-[#ffffff]/50 resize-none"
```

Same translucent surface, with `resize-none` to prevent the drag-handle from breaking the glass aesthetic, and slightly taller padding (`py-1.5`) to feel comfortable for multi-line text.

Result: all five form controls share one visual language — translucent white surface, consistent border, identical radius and rhythm.

---

## How to extend

- To tune the glass intensity, change the alpha in `.dialog-content-branded`'s `background-color` (more opaque = less see-through) or the `blur(...)` value (higher = frostier).
- For a new modal style (e.g. a destructive-action modal), prefer adding a new utility class next to `.dialog-content-branded` rather than overriding inline — it keeps the dialog component dumb and the styling centralized.
- If `tailwind-merge` is ever added to `cn`, the `!` prefixes on the select/textarea can be dropped.
