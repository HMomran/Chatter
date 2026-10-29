# Chatter interface review

## Audit

The existing app has working registration, login, search and messaging, but the visual system is fragmented. Landing and account pages use decorative slogans, tiny uppercase labels and rotated chat mockups; the directory uses a dark dashboard sidebar and large repeated cards; the conversation uses another set of surfaces and radii. Secondary text falls to 9–12px. Shared CSS mixes global and scoped rules and repeats mobile overrides. The result is more promotional than useful for a small personal messenger.

## Direction: a conversation workspace

A contact book is the product's organizing idea: people first, then a focused exchange. Retain the Chatter name and conversation-shaped mark, but give them a quieter, more precise identity.

- Ink `#183442`, canvas `#FFFFFF`, surface `#F2F6F8`, action `#087F8C`, muted `#526B77`, border `#D8E3E8`.
- Geist for headings and body, with system sans-serif fallback. Headings use weight 500 and tight but readable tracking. Body is 14–16px; timestamps are 12px.
- Use the existing 4px spacing scale, 8px controls, and speech-tail geometry only where it signifies an actual conversation.
- Left-align headings and controls; keep forms at 400px and conversation text below 80 characters per line.

Layout alternatives:

```
Rejected: oversized promotional split
[large headline and slogans] [decorative card stack]

Chosen: product-led opening
[Chatter                              Sign in]
[Clear purpose]              [Example conversation]
[Create account]             [reply / reply]

Directory
[light account rail] [People          Refresh]
                     [Search                  ]
                     [initial / name / phone / Message]
                     [initial / name / phone / Message]
```

The first plan still used repeated contact cards and a large dark sidebar, which would fit almost any SaaS product. Replace those with flat contact rows and a light account rail. Remove ornamental eyebrows, random avatar colors, decorative arrows, and slogan footers. Use a restrained conversation diagram as the one recognizable visual on the public pages.

## Review criteria

Preserve existing routes, fields, password visibility, validation, sessions, sign-out, refresh/retry, search, message history, sending states and timestamps. Check desktop/tablet/mobile overflow, long names, keyboard focus, text contrast, reduced motion and loading/error/empty states. Keep one shared stylesheet with explicit sections rather than appended overrides.

## Implemented review

All five existing pages now share Geist, semantic color tokens, readable supplementary text, and the same controls. The directory uses contact rows; account pages use a restrained example exchange; the public opening shows an explicitly labeled example conversation. Removed duplicate and overlapping CSS and the unused Bootstrap stylesheet rather than stacking another override layer. Existing API calls, sessions, routes and controls remain in place.

Headless Chrome checks the rendered pages at 320, 360, 768 and 1440px with long contact names and long message links. Checks include horizontal overflow, usable input widths and keyboard focus. Interaction tests cover account creation/sign-in, password confirmation, directory search, refresh, errors and retry. A screenshot-based visual review could not be performed because no connected browser session is available; these checks are rendered DOM/layout checks, not a claim of pixel-level screenshot review.
