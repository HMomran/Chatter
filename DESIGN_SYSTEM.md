
# Design System

## Design Philosophy
Create clean, premium, intentional interfaces inspired by high-quality modern SaaS products.

The goal is a distinctive product identity, not a generic AI-generated template.

## Visual Style
- Minimal and professional
- Strong typography
- Generous but controlled whitespace
- Clear visual hierarchy
- Consistent alignment
- Subtle borders and shadows
- No unnecessary decorations

## Colors
Use semantic design tokens rather than arbitrary colors.

Suggested starting palette:
- Primary: #2563EB
- Background: #FFFFFF
- Surface: #F8FAFC
- Text: #0F172A
- Muted text: #64748B
- Border: #E2E8F0
- Success: #16A34A
- Error: #DC2626

Adjust the palette to the product's brand.

## Typography
- Font: Inter or Geist
- Clear heading hierarchy
- Body: 14–16px
- Headings: 24–48px depending on context
- Use consistent font weights
- Keep paragraphs readable

## Spacing
Use a consistent 4px-based spacing scale:
4, 8, 12, 16, 24, 32, 48, 64px.

## Components
- Buttons: clear hierarchy, consistent sizing
- Cards: subtle borders, minimal shadows
- Inputs: visible labels and focus states
- Navigation: simple and predictable
- Tables: readable, aligned, responsive
- Dialogs: accessible and focused
- Feedback: clear loading and error states

## Layout
- Use structured grids
- Keep content widths appropriate
- Maintain consistent page padding
- Support mobile, tablet, and desktop
- Avoid unnecessary nested containers

## Animations
- Subtle transitions (150–250ms)
- Animate only when useful
- Avoid excessive motion
- Respect reduced-motion preferences

## Forbidden Patterns
- Random gradients
- Excessive glassmorphism
- Giant empty hero sections
- Inconsistent border radii
- Too many different colors
- Decorative elements without purpose
- Copying generic dashboard templates

## Quality Standard
The result should look like a carefully designed real product, not an automatically generated demo.

## Chatter brand implementation

The application uses a conversation workspace identity. Geist is the shared typeface, with system sans-serif fallbacks. Use sentence case and direct functional copy. Avoid ornamental eyebrows, slogan footers, rotated mockups, and generic dashboard card walls.

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#183442` | Main text and outgoing speech bubbles |
| `--paper` | `#FFFFFF` | Main canvas and form surfaces |
| `--surface` | `#F2F6F8` | Account navigation and conversation background |
| `--primary` | `#087F8C` | Actions and focus indicators |
| `--muted` | `#526B77` | Supporting text |
| `--line` | `#D8E3E8` | Structural separators |

Shared styles live in `frontend/src/styles.css`, divided into controls, landing, accounts, directory, conversation, and responsive rules. Use compact contact rows for the directory. Keep forms to 400px and message text below 80 characters per line. Speech-tail corners belong to messages and the brand mark, not every container. Use 8px control radii, 14–16px body text, and 12px supplementary text. Headings range from 24–48px. Motion is limited to 180ms interaction feedback and the user-triggered refresh indicator; reduced-motion preferences disable it.
