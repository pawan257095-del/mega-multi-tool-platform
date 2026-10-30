# Toolbox UI update notes

Changes in this revision:
- Removed the duplicate search form from the homepage hero. The shared header search remains the primary search field; quick-search chips still trigger the shared search flow.
- Removed the large dedicated "Install Our App" homepage banner. The header install button remains; the floating mobile Install tab still dispatches the existing install event.
- Added active-state visual feedback to Home, All Tools, Categories, and Popular mobile navigation tabs.
- Added browser history state for in-app view changes so the Android/browser Back action restores the previous view instead of leaving the tab state stuck.
- Updated dark-mode hero-art blending to avoid a pale rectangular image canvas against the dark hero background.

The project preserves the existing tool catalog, routes, SEO files, PWA registration, and tool implementations.
