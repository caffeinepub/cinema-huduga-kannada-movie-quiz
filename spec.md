# Cinema Huduga – Kannada Movie Quiz

## Current State
Full-featured Kannada movie quiz app with 4 levels, 35 questions, 3-lives system, 15-second timer, speed bonus, sound effects, cinematic game over screen, and Kannada UI. No PWA support.

## Requested Changes (Diff)

### Add
- `manifest.json` in `public/` with app name (Kannada + English), icons, theme color (#000000), background color (#000000), display: standalone, orientation: portrait
- `sw.js` service worker in `public/` for offline caching of all app assets (JS, CSS, fonts, images)
- 192x192 icon reference (resized from generated 512x512)
- PWA meta tags in `index.html`: `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`, manifest link
- Service worker registration script in `index.html`
- `screenshots` array in manifest for Play Store listing (two screenshots: portrait 1080x1920)

### Modify
- `index.html`: add all PWA meta tags, manifest link, SW registration

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/public/manifest.json` with full PWA metadata
2. Create `src/frontend/public/sw.js` service worker with cache-first strategy
3. Update `src/frontend/index.html` to link manifest, add meta tags, register SW
