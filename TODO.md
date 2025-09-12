## UI/UX Todo

### Completed
- [x] Prevent dark-mode flash on load by applying theme class before hydration (`src/app/layout.tsx`).
- [x] Add avatars to chat messages and align per role (`src/app/chat/page.tsx`).
- [x] Add settings control to chat header (`SettingsDropdown`).
- [x] Keyboard shortcut to focus input: `/` or Cmd/Ctrl+K in chat.

### Next (High Priority)
- [ ] Header parity on Home: add right-side `SettingsDropdown` to `src/app/page.tsx` header, mirroring chat.
- [ ] Standardize page rhythm: unify container widths/padding across pages (e.g., `max-w-3xl`, `px-5`, `py-12`).
- [ ] Rounded shape consistency: audit inputs and bubbles to consistently use `rounded-3xl` where appropriate.
- [ ] Prompt input readability: ensure base font size ≥16px on mobile for all prompt inputs; adjust shared `PromptInputTextarea` defaults if needed.
- [ ] Accessibility: set `aria-live="polite"` for the chat log alongside `role="log"` and verify SR announcements.
- [ ] Shortcut hint: add subtle placeholder hint on larger screens (e.g., “Press / to focus”).
- [ ] User "sending" state: show a temporary sending indicator for the latest user message before assistant replies.
- [ ] Touch affordance in `ImageGrid`: add a visible corner expand button (always-on for touch) in addition to hover overlay.
- [ ] `LightboxModal` metadata: optional collapsible panel showing prompt and timestamp while browsing.
- [ ] Markdown/code theming parity: ensure code blocks and inline code align with app theme in `ui/markdown.tsx`.

### Medium Priority
- [ ] Micro-interactions: add subtle hover scale on icon buttons (e.g., `hover:scale-[1.02]` with transition).
- [ ] Sidebar discoverability: add counts/badges to groups (e.g., Today, Recent) when history is wired.
- [ ] Dedicated theme toggle: optional separate theme switch (besides `SettingsDropdown`).
- [ ] Focus states audit: ensure visible focus outlines and logical tab order across all interactive elements.
- [ ] Typography: audit global type scale for consistent hierarchy (headings, body, captions).

### Low Priority
- [ ] Add tests/e2e checks for theme persistence and keyboard shortcut focusing.
- [ ] Wire analytics hooks for key UI interactions (open lightbox, expand image, copy message, etc.).


