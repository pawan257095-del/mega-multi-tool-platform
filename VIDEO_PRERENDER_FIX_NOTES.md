# Video tool prerender fix

The `/tools/video-trimmer` and `/tools/smart-video-clip-generator` pages now load the shared browser-based video tool through a client-only `next/dynamic` wrapper with `ssr: false`. This keeps FFmpeg/browser-media component code out of server prerendering and is intended to address the reported `__NEXT_PRIVATE_MINIMIZE_MACRO_FALSE` prerender failure.

Verification status: this patch was not run through a fresh local production build in this environment. After extracting, run `npm.cmd run typecheck` and `npm.cmd run build` in PowerShell.
