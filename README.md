# Mega Multi-Tool Platform — Reference Roadmap (Milestone 79: SSL Certificate Checker)

Adds the MAC Address Vendor Lookup to the existing Next.js App Router + TypeScript + Tailwind project.

## Milestone 78 features
- Look up a 12-character MAC address or a 6-character OUI prefix against the public macvendors.com vendor database.
- Displays the normalized address, registered organization, lookup timestamp, and a copyable text summary.
- Shows clear validation/network errors and explains third-party lookup privacy and coverage limits.
- This tool does not scan the local network or identify a device owner/model. The query is sent to the external vendor service.

## Run locally
```bash
npm install
npm run dev
```
Then visit http://localhost:3000/tools/mac-address-vendor-lookup.

## Verification status
TypeScript/TSX syntax transpilation, catalog/route integration, and ZIP integrity were checked. Dependency installation, full type checking, production build, and live browser/API testing have not been completed in this environment.

## Milestone 67 — Percentage / Discount Calculator
- Route: `/tools/percentage-discount-calculator`.
- Supports discount/final-price calculations, percentage of a value, what-percent-of, and percentage change. Includes input validation, sample and clear controls, copy result, and TXT download.
- Calculations run locally in the browser. Discount output excludes tax/shipping unless represented in the input.
- Verification: TypeScript/TSX syntax transpilation, catalog and route integration checks, calculation smoke checks, and ZIP integrity. Full dependency installation, production build, and browser testing remain pending.

Next reference item: **Strong password generator** (Category 6, Calculators & Daily Utilities; Milestone 68).


## Milestone 68 — Strong Password Generator
- Route: `/tools/strong-password-generator`.
- Generates 1–20 passwords at a time, 4–128 characters long, with selectable lowercase, uppercase, numeric, and symbol sets; optionally excludes ambiguous characters.
- Uses the browser Web Crypto API with rejection sampling for random character selection and cryptographic shuffling. Passwords remain client-side; copy and TXT export are user-initiated.
- Includes visibility toggle, per-password/all copy, clear controls, approximate entropy estimate, validation, and password-handling cautions.
- Verification: source syntax transpilation, catalog/route checks, basic random-generator smoke tests, and ZIP integrity. Full dependency installation, Next.js production build, and browser end-to-end testing remain pending.

Next reference item: **Random number/name picker** (Category 6, Calculators & Daily Utilities; Milestone 69).


## Milestone 69 — Random Number / Name Picker
- Route: `/tools/random-number-name-picker`.
- Pick random integers from a configurable inclusive range, or select names from a newline/comma/semicolon-separated list. Supports 1–100 results, optional duplicate prevention, copy, TXT download, reset, and repeat pick.
- Uses the browser Web Crypto API with rejection sampling; no names or results are uploaded. Duplicate names in a list count as separate entries/tickets.
- Verification: TypeScript/TSX syntax transpilation, catalog/route checks, random-selection algorithm review, and ZIP integrity. Full dependency installation, Next.js production build, and browser end-to-end testing remain pending.

Next reference item: **Stopwatch / countdown timer** (Category 6, Calculators & Daily Utilities; Milestone 70).


## Milestone 70 — Stopwatch / Countdown Timer
- Route: `/tools/stopwatch-countdown-timer`.
- Stopwatch supports start, pause, resume, reset, lap recording and copying elapsed time. Countdown supports editable minutes/seconds, setting a duration, start, pause, resume and reset.
- Uses timestamp-based updates while the page is open; timer updates can be throttled when the tab/device sleeps and it is not a certified timing instrument.
- Verification: TypeScript/TSX syntax transpilation, catalog/route checks, timer logic review, and ZIP integrity. Full dependency installation, production build, and browser end-to-end testing remain pending.

Next reference item: **MP4 to MP3** (Category 7, Video & Audio Tools; Milestone 71).


## Milestone 71 — MP4 to MP3
- Route: `/tools/mp4-to-mp3`.
- Extracts an MP4 audio track and encodes it as MP3 with selectable 128, 192, 256, or 320 kbps output. Includes progress, audio preview, download, reset, file validation, and a 500 MB input cap.
- Uses FFmpeg WebAssembly in the browser; the FFmpeg core is fetched from jsDelivr on first conversion. Processing stays client-side, but memory/CPU use can be significant and a network connection is required to load the engine. Convert only media you own or are authorized to use.
- Verification: source syntax transpilation, catalog/route integration, and ZIP integrity checks. Dependency installation, full production build, and browser end-to-end conversion tests remain pending.

Next reference item: **Audio trimmer / ringtone maker** (Category 7, Video & Audio Tools; Milestone 72).


## Milestone 72 — Audio Trimmer / Ringtone Maker
- Route: `/tools/audio-trimmer-ringtone-maker`.
- Loads a local audio file (100 MB maximum), decodes it with the browser Web Audio API, supports start/end time selection, previews the selected range, and exports the trim as PCM WAV (mono/stereo).
- Audio decoding depends on browser codec support. Export is WAV, not MP3; processing remains local and can use significant memory for long recordings. Trim only media you own or are authorized to edit.
- Verification: source syntax transpilation, catalog/route integration, core WAV encoder checks, and ZIP integrity. Dependency installation, full production build, and real browser audio testing remain pending.

Next reference item: **Video compressor** (Category 7, Video & Audio Tools; Milestone 73).


## Milestone 73 — Video Compressor

- Added `/tools/video-compressor` to compress common video inputs into MP4 using FFmpeg WebAssembly and H.264/AAC.
- Offers CRF quality presets and maximum-width options, progress reporting, output preview, file-size comparison, and MP4 download.
- Processing is performed in the browser. First use downloads FFmpeg core from jsDelivr; large inputs can exhaust browser memory. Input limit: 300 MB.
- Verification completed: source syntax transpilation and ZIP integrity. Full dependency installation, production build, and actual browser conversion remain pending.
- Next reference roadmap item: **What is my IP** (Category 8 — Network & IP Tools).


## Milestone 74 — What Is My IP?

- Route: `/tools/what-is-my-ip`.
- Lets the user explicitly request their public IP address, with IP version, optional approximate location, network/provider, and timezone details. Falls back to a public-IP-only provider if the richer lookup is unavailable.
- External lookup providers receive the request and can see the public IP; this is disclosed in the UI. Location is approximate. Browser pages generally cannot reliably expose private LAN IP addresses.
- Verification: TypeScript/TSX syntax transpilation, catalog/route checks, and ZIP integrity. Full dependency installation, production build, and live browser/network testing remain pending.

Next reference item: **WHOIS lookup** (Category 8, Network & IP Tools; Milestone 75).


## Milestone 75 — WHOIS Lookup
- Route: `/tools/whois-lookup`.
- Uses the public RDAP endpoint to query a domain's registration record; displays registrar where available, creation/update/expiration dates, status codes, nameservers, and registry handle.
- Accepts a domain or full website URL, validates the hostname, and supports copying a plain-text summary. No API key is required.
- Privacy/limits: the searched domain is sent to a third-party RDAP service; registry support and returned fields vary, and registrant data is often redacted.
- Verification: source syntax, catalog/route integration, and ZIP integrity checked. Full dependency installation, production build, and live browser/network test remain pending.

Next reference item: **Ping / latency checker** (Category 8 — Network & IP Tools; Milestone 76).


## Milestone 76 — DNS Lookup
- Route: `/tools/dns-lookup`.
- Queries selected public DNS record types (A, AAAA, CNAME, MX, NS, TXT, CAA, SOA) through Google Public DNS over HTTPS. Shows record data, TTL, and response status, with copyable summaries.
- Accepts a domain or website URL and validates its hostname. DNS queries are sent to Google Public DNS; resolver results may differ due to caching, propagation, or split-horizon DNS.
- Verification: TypeScript/TSX syntax transpilation, catalog/route checks, DNS response handling review, and ZIP integrity. Full dependency installation, production build, and live browser/network testing remain pending.
- Next reference item: **Ping / traceroute** (Category 8 — Network & IP Tools; Milestone 77).


## Milestone 77 — Ping / Traceroute

- Route: `/tools/ping-traceroute`.
- Runs 1–10 browser-based HTTPS reachability timing probes against a fixed public endpoint; reports individual timings plus minimum, average, maximum, and failed-request percentage. Results can be copied as a text report.
- Important limitation: this is **not ICMP ping** and does not perform traceroute or discover network hops. Browser sandbox restrictions prevent arbitrary raw ICMP/traceroute; the UI explains OS terminal commands for genuine tests.
- Privacy: requests are sent to the public HTTPS endpoint.
- Verification: source syntax, catalog/route integration, and ZIP integrity checks. Full dependency installation, production build, and browser network testing remain pending.

Next reference item: **MAC address vendor lookup** (Category 8, Network & IP Tools; Milestone 78).


## Milestone 78 — MAC Address Vendor Lookup

- Route: `/tools/mac-address-vendor-lookup`.
- Accepts a MAC address or 6-hex-character OUI prefix, validates its hexadecimal form, and queries the public macvendors.com endpoint for the assigned organization. Supports copying a plain-text result and includes an explicit third-party privacy notice.
- Important limitation: vendor/OUI data identifies the assigned prefix organization, not a specific device owner or exact model. The browser cannot inspect nearby devices or reveal their MAC addresses.
- Verification: TypeScript syntax transpilation, catalog/route checks, and ZIP integrity. Full dependency installation, production build, and live browser/API test remain pending.

Next reference item: **SSL certificate checker** (Category 8 — Network & IP Tools; Milestone 79).


## Milestone 79 features

- Route: `/tools/ssl-certificate-checker`.
- Queries public certificate-transparency records through crt.sh and shows up to 30 recent entries, issuer, subject/common name, validity dates, date-based expiry estimate, and links to source records. Supports copying a text summary.
- Privacy: the searched domain is sent to crt.sh.
- Important limitation: this is a certificate-transparency lookup, not a live TLS handshake. It cannot verify the current served certificate chain, hostname match, revocation status, or server configuration.
- Verification: syntax transpilation, catalog/route checks, and ZIP integrity. Full dependency installation, production build, and live browser/network test remain pending.

Next reference item: **Real-time currency converter** (Category 9 — Financial & Business Tools; Milestone 80).


### Milestone 82: Real-Time Currency Converter
Currency conversion is available at `/tools/real-time-currency-converter`. It uses the public Frankfurter exchange-rate API and requires an internet connection. Reference rates can differ from bank/card rates and may not be live trading quotes.

### Milestone 83: GST / VAT Calculator
Available at `/tools/gst-vat-calculator`. Calculates tax added to a base amount or tax extracted from an inclusive amount, with configurable tax rate, currency display, copyable breakdown and optional estimated CGST/SGST split. This is an arithmetic estimate, not tax advice; confirm applicable rates and treatment using official rules.
\n\n### Currency converter reliability fix\n- Updated the exchange-rate endpoint to `https://api.frankfurter.dev/v1/latest?base=...`.\n- Validates the response and shows clearer HTTP/network guidance.\n- Caches successful real rates in browser localStorage for offline fallback; cached rates are clearly labelled and never fabricated.\n

## Milestone 85 — Crypto-to-Fiat Converter
- Added a client-side cryptocurrency-to-fiat conversion tool using CoinGecko's public simple-price endpoint.
- Includes BTC, ETH, USDT, BNB, SOL, XRP and other selected assets, with multiple fiat currencies.
- Saves the last successful selected price in browser localStorage and clearly labels cached fallback values.
- Added route, catalog entry and tool-card navigation. Live API behavior and full production build still require local verification.


## Milestone 86 — Invoice PDF Generator
- Added a browser-local invoice builder with seller/customer details, invoice dates, line items, quantity/rate, tax, discount, currency, notes, totals and PDF download using pdf-lib.
- Added route, catalog entry and tool-card navigation. Full build and browser PDF output still require local verification.


## Milestone 87 — Salary / Income Tax Calculator
- Added a simplified Indian income-tax estimate with old/new regime comparison, annual income, other income, deductions, age group, estimated taxable income, tax including cess, monthly equivalent and copyable summary.
- Added route, catalog entry and tool-card navigation. Calculations use explicitly labelled illustrative assumptions; full build and browser verification remain pending.


## Milestone 88 — Length / Distance Converter
- First tool in Category 10 of the reference inventory.
- Converts millimeters, centimeters, meters, kilometers, inches, feet, yards, miles, nautical miles, micrometers, nanometers and light-years entirely in the browser.
- Added route, catalog entry and tool-card navigation. Full production build and browser verification remain pending.


## Milestone 89 — Weight Converter
- Second tool in Category 10 of the reference inventory.
- Converts mg, µg, g, kg, metric tonnes, ounces, pounds, stone, US short tons, UK long tons, carats and grains locally in the browser.
- Added route, catalog entry and tool-card navigation. Full production build and browser verification remain pending.


## Milestone 90 — Temperature Converter
- Route: `/tools/temperature-converter`.
- Converts Celsius, Fahrenheit, Kelvin, and Rankine in either direction, including negative Celsius/Fahrenheit values where physically valid.
- Rejects non-numeric values and temperatures below absolute zero; includes swap, reset, copy result, and common reference points.
- All calculations run locally in the browser; no temperature data is uploaded.
- Verification: source/route/catalog integration and ZIP integrity checked. Dependency installation, full TypeScript check, production build, and browser end-to-end testing remain pending.

Next reference item: **Data Storage Converter** (Category 10, Unit & Measurement Converters; Milestone 91).


## Milestone 91 — Data Storage Converter
- Route: `/tools/data-storage-converter`.
- Converts bits, bytes, decimal SI units (kB through PB) and binary IEC units (KiB through PiB), with clear unit labels.
- Includes instant results, swap, copy, reset and a guide explaining decimal-versus-binary storage sizes.
- All calculations run locally in the browser; no input is uploaded.
- Verification: source/route/catalog integration and ZIP integrity checked. Dependency installation, full TypeScript check, production build, and browser end-to-end testing remain pending.

Next reference item: **Time Converter** (Category 10, Unit & Measurement Converters; Milestone 92).


## Milestone 92 — Time Converter
- Route: `/tools/time-converter`.
- Converts nanoseconds, microseconds, milliseconds, seconds, minutes, hours, 24-hour days, weeks, fortnights and fixed 365-day years.
- Includes instant conversion, swap, copy result, reset and clear notes on fixed-duration assumptions.
- All calculations run locally in the browser; no input is uploaded.
- Verification: source/route/catalog integration and ZIP integrity checked. Dependency installation, full TypeScript check, production build, and browser end-to-end testing remain pending.

Next reference roadmap category: **UI/UX & Web Design Tools** (Category 11; Milestone 93 begins with Color Palette Generator).


## Milestone 93 — Color Palette Generator
- Route: `/tools/color-palette-generator`.
- Generates five-color complementary, analogous, triadic and monochromatic palettes from a valid 3- or 6-digit HEX base color.
- Shows HEX, RGB and HSL values, supports per-color/all-HEX copy, random color selection, native color picker, reset and CSS custom-property export.
- Palette generation runs locally in the browser; no colors or input are uploaded.
- Verification: source/route/catalog integration and ZIP integrity checked. Dependency installation, full TypeScript check, production build, and browser end-to-end testing remain pending.

Next reference item: **CSS Gradient Generator** (Category 11, UI/UX & Web Design Tools; Milestone 94).


## Milestone 94 — CSS Gradient Generator
- Route: `/tools/gradient-generator`.
- Creates linear and radial gradients from two valid HEX colors, with a live preview, adjustable linear angle and stop position, quick presets and randomization.
- Supports copy CSS, CSS file export and reset; runs locally in the browser.
- Verification: source/route/catalog integration and ZIP integrity checked. Dependency installation, full TypeScript check, production build, and browser end-to-end testing remain pending.

Next reference item: **CSS Box Shadow / Border Radius Generator** (Category 11, UI/UX & Web Design Tools; Milestone 95).


## Milestone 95 — CSS Box Shadow / Border Radius Generator
- Route: `/tools/css-box-shadow-generator`.
- Adjusts horizontal/vertical offset, blur, spread, opacity, shadow color, inset mode and border radius with a live preview.
- Includes presets, randomization, reset and copyable CSS declarations; calculations and preview run locally.
- Verification: source/route/catalog integration and ZIP integrity checked. Dependency installation, full TypeScript check, production build, and browser end-to-end testing remain pending.

Next reference item: **SVG to PNG / PNG to SVG** (Category 11, UI/UX & Web Design Tools; Milestone 96).


## Milestone 96 — SVG to PNG / PNG to SVG
- Route: `/tools/svg-png-converter`.
- SVG to PNG: renders a validated SVG locally to a PNG at user-selected dimensions (1–8192 px).
- PNG to SVG: creates an SVG wrapper with the PNG embedded as a data URI; this does not vectorize raster pixels.
- Includes source preview, output preview, download, reset, a 15 MB file limit and basic blocking of active SVG content.
- Verification: source/route/catalog integration and ZIP integrity checked. Dependency installation, full TypeScript check, production build, and browser end-to-end testing remain pending.

Next reference item: **Dummy Image Generator** (Category 11, UI/UX & Web Design Tools; Milestone 97).

## Milestone 97 — Dummy Image Generator

- Added `/tools/dummy-image-generator` with custom width and height, presets, background/text colors, label and dimension toggles, live preview, and PNG download.
- Generation happens in-browser; no upload or external API is required.
- Next: Font Pairing Generator (Category 11 — UI/UX & Web Design Tools; Milestone 98).

## Milestone 98 — Font Pairing Generator

- Added `/tools/font-pairing-generator` with 16 curated font pairings, style filters, random pairing, editable preview text, adjustable heading/body sizes, and copyable CSS.
- Google Fonts are loaded in the browser when internet access is available; font suggestions remain usable as system-font fallbacks.
- Next: WhatsApp Direct Link Generator (Category 12 — Social Media & Marketing Tools; Milestone 99).

## Milestone 99 — WhatsApp Direct Link Generator

- Added `/tools/whatsapp-direct-link-generator` with international number normalization, optional prefilled message, live URL preview, copy link, open WhatsApp, and reset.
- The tool generates a link only; it does not send messages, validate WhatsApp account ownership, or persist entered data.
- Next: YouTube Tag Extractor (Category 12 — Social Media & Marketing Tools; Milestone 100).

## Milestone 100 — YouTube Tag Extractor

- Added `/tools/youtube-tag-extractor` with video URL/ID parsing, thumbnail preview, metadata/source parser, manual tag-list cleanup, deduplication, and copy options.
- Due to browser cross-origin restrictions and inconsistent public YouTube metadata, the tool only extracts tags from source text supplied by the user; it does not claim to fetch hidden tags from a URL.
- Next: Tweet-to-Image (Category 12 — Social Media & Marketing Tools; Milestone 101).

## Milestone 101 — Tweet-to-Image

- Added `/tools/tweet-to-image` with editable display name, handle, avatar initials, post text, theme selection, layout sizes, and local PNG export.
- The output is an original mock social card, not an official X/Twitter screenshot or endorsement.
- Next: UTM Builder (Category 12 — Social Media & Marketing Tools; Milestone 102).

## Milestone 102 — UTM Builder

- Added `/tools/utm-builder` with destination URL validation, source/medium/campaign/term/content fields, optional custom query parameters, lowercase mode, replace-existing-UTM option, and copyable URL.
- UTM values are URL-encoded by the URL API. Users should not place personal or confidential information in tracking parameters.
- Next: Social Media Character Counter (Category 12 — Social Media & Marketing Tools; Milestone 103).


## Milestone 103 — Social Media Character Counter

Added `/tools/social-media-character-counter` with live character, word, line, hashtag, and URL counts; common platform limits; custom limits; over-limit feedback; copy and clear actions. Platform limits can change, so users should verify before publishing.


## Milestone 104 — Password Strength Checker

Added `/tools/password-strength-checker` with a browser-local heuristic strength estimate, checklist, and improvement advice. It does not perform a breached-password lookup or provide a reliable crack-time estimate.

Next tool: Data Breach Checker (Milestone 105).


## Milestone 105 — Data Breach Checker

Added `/tools/data-breach-checker` with email validation, explicit consent, privacy notes, and a fail-closed API route at `/api/data-breach-checker`. Live lookups are intentionally disabled until a legitimate provider integration and server-side API key are configured; the tool does not invent results.

Next tool: Disposable Email Generator (Milestone 106).


## Milestone 106 — Disposable Email Generator

Added `/tools/disposable-email-generator` for generating address-shaped aliases locally with prefix/domain/token controls and copy action. It does not create an inbox or guarantee delivery; receiving mail requires a real provider or a domain/mail server you control.

Next tool: Htpasswd Generator (Milestone 107).


## Milestone 107 — Htpasswd Generator

Added `/tools/htpasswd-generator` with username/password inputs, selectable format, validation, and copyable output UI. The `/api/htpasswd-generator` route fails closed until a maintained server-side hashing implementation is configured; it does not fabricate hashes.

Next tool: AI Summarizer (Milestone 108, per remaining original roadmap order).


## Milestone 108 — AI Summarizer

Added `/tools/ai-summarizer` with local extractive sentence ranking, three summary-length options, input statistics, and copy output. It is not a generative AI model and users should review summaries for context loss.

Next tool: Grammar/Spell Checker (Milestone 109).


## Milestone 110 — Prompt Generator

- Added `/tools/prompt-generator` to the tool catalog and tool-card route map.
- Generates a structured prompt for writing, coding, research, tutoring, business, or custom tasks.
- Supports context, audience, tone, output format, constraints, example preference, and clarification preference.
- Prompt generation is deterministic and local; no external AI service is called.

Next reference tool: YouTube Earnings Estimator (Milestone 127).


## Milestone 111 — Text-to-Emoji Translator

- Added `/tools/text-to-emoji-translator` to the tool catalog and tool-card route map.
- Maps a curated set of common English words and phrases to emoji-enhanced text.
- Includes light, balanced, and expressive density modes, tone choices, sample input, and copy output.
- Processing is local and keyword-based; no external AI service is called.

Next reference category: E-Commerce & Dropshipping Tools.


## Milestone 112 — CGPA / GPA Calculator

- Added `/tools/cgpa-gpa-calculator` to the catalog and tool-card route map.
- Calculates credit-weighted semester GPA with editable subjects, credits, and grade points.
- Supports 0–10 and 0–4 grade-point scales and optional updated cumulative CGPA using prior CGPA plus completed credits.
- Includes invalid-row warnings and explains the formulas and institution-policy caveat.

Next reference tool: YouTube Earnings Estimator (Milestone 127).


## Milestone 113 — APA/MLA Citation Generator

- Added `/tools/apa-mla-citation-generator` to the catalog and tool-card route map.
- Creates basic APA 7 and MLA 9 reference entries and parenthetical in-text citations.
- Supports website, book, and journal article source types with relevant metadata fields.
- Citation formatting runs locally; source metadata is not automatically verified.

Next reference tool: YouTube Earnings Estimator (Milestone 127).


## Milestone 114 — Text Comparison / Plagiarism Helper

- Added `/tools/text-comparison-plagiarism-helper` to the catalog and tool-card route map.
- Compares two texts with token-level added/removed highlighting and a bounded LCS comparison.
- Finds exact phrase overlap between the two user-provided texts.
- Runs locally; does not query the web or academic databases.
- Explicitly described as a comparison aid, not a plagiarism detector or verdict.

Next reference tool: YouTube Earnings Estimator (Milestone 127).


## Audit hardening follow-up

- Added `npm run audit:static` to compare tool route folders, catalog IDs, explicit route mappings, and component imports.
- Added `scripts/TOOL_SMOKE_TEST_CHECKLIST.md` with manual regression cases for all tool families and Invoice PDF edge cases.
- This static check does not replace `npm audit`, typecheck, production build, or browser end-to-end tests.


## Milestone 115 — Word Unscrambler / Anagram Solver

- Added `/tools/word-unscrambler-anagram-solver` to the catalog and tool-card route map, following the authoritative reference inventory order.
- Supports exact anagrams, shorter words built from supplied letters, word-length filters, result sorting, filtering, and copy.
- Uses a bounded, built-in English word list and local processing; no external API is required.
- Clearly discloses that the dictionary is limited and results are not exhaustive.

Next reference tool: YouTube Earnings Estimator (Milestone 127).


## Milestone 125: Barcode Generator — added to E-Commerce & Dropshipping Tools.

- Added `/tools/percentage-difference-calculator` to the Education & Student Tools category, in the authoritative reference ZIP order.
- Supports symmetric percentage difference and directional percentage change as separate formulas.
- Validates non-finite/empty inputs and explains zero-denominator cases rather than showing `NaN` or `Infinity`.
- Includes precision selection, examples, and copy result.

Next reference category: **Health & Fitness Calculators** (the Education & Student Tools category is complete).


## Latest roadmap milestone

- Milestone 126: CPM Calculator added under E-Commerce & Dropshipping Tools.
- Next reference tool: YouTube Earnings Estimator (Milestone 127).


## Latest roadmap milestone

- Milestone 127: YouTube Earnings Estimator added under YouTube & Content Creator Tools.
- Next reference tool: YouTube Tags / Keywords (Milestone 128).


## Latest roadmap milestone

- Milestone 128: YouTube Tags / Keywords added under YouTube & Content Creator Tools.
- Next reference tool: YouTube Title / Description Generator (Milestone 129).


## Latest roadmap milestone

- Milestone 129: YouTube Title / Description Generator added under YouTube & Content Creator Tools.
- Next reference tool: Twitch Overlay Resizer (Milestone 130).


## Latest roadmap milestone

- Milestone 130: Twitch Overlay Resizer added under YouTube & Content Creator Tools.
- Next reference tool: Instagram / TikTok Hashtag Generator (Milestone 131).


## Latest roadmap milestone

- Milestone 131: Instagram / TikTok Hashtag Generator added under YouTube & Content Creator Tools.
- Next reference tool: Gamertag Generator (Milestone 132).


## Latest roadmap milestone

- Milestone 132: Gamertag Generator added under Fun, Gaming & Social Generators.
- Next reference tool: Discord Text Formatter (Milestone 133).


## Latest roadmap milestone

- Milestone 133: Discord Text Formatter added under Fun, Gaming & Social Generators.
- Next reference tool: Kaomoji Board (Milestone 134).


## Latest roadmap milestone

- Milestone 134: Kaomoji Board added under Fun, Gaming & Social Generators.
- Next reference tool: Love Calculator (entertainment only) (Milestone 135).


## Latest roadmap milestone

- Milestone 135: Love Calculator added as an entertainment-only name game under Fun, Gaming & Social Generators.
- Next reference tool: Zodiac Calculator (Milestone 136).


## Latest roadmap milestone

- Milestone 136: Zodiac Calculator added under Fun, Gaming & Social Generators.
- Next reference tool: Time Zone Converter (Milestone 137).


## Latest roadmap milestone

- Milestone 137: Time Zone Converter added under Productivity & Remote Work Tools.
- Next reference tool: Pomodoro Timer (Milestone 138).


## Milestone 138 — Pomodoro Timer

Added `/tools/pomodoro-timer` with configurable focus/short-break/long-break intervals, start/pause/reset/skip controls, completed-session tracking, progress display, and optional browser notifications. Timer state is kept in the current page; notifications require explicit browser permission. Static audit is included; production build, type-check, lint, and browser end-to-end tests were not run for this milestone.

Next reference-roadmap tool: **Browser Notepad with Local Save (Milestone 139)**.


## Milestone 139 — Browser Notepad with Local Save

Added `/tools/browser-notepad-local-save` with multiple notes, title/content editing, search, explicit save, delete, word/character counts, `.txt` export, and JSON backup import/export. Notes are stored in browser local storage only and are not synced to the cloud. Clearing site data can remove them; do not store passwords or highly sensitive data. Static audit is included; production build, type-check, lint, and browser end-to-end tests were not run for this milestone.

Next reference-roadmap tool: **Meeting Overlap Calculator (Milestone 140)**.


## Milestone 140 — Meeting Overlap Calculator

Added `/tools/meeting-overlap-calculator` with configurable participants, IANA time zones, local working hours and weekdays, meeting durations, candidate start times in 15-minute increments, local-time display, and copyable results. It uses the browser time-zone database; ambiguous daylight-saving transitions and unusual schedules should be verified manually. Static audit is included; production build, type-check, lint, and browser end-to-end tests were not run for this milestone.

The original 20-category reference inventory is now complete through its final listed tool. The compiler category remains paused per the project instruction. No additional tools were added beyond the reference inventory.


## Tool-name correction

Corrected the display names for 14 tools that had accidentally inherited the `CPM Calculator` label in the catalog. The actual CPM Calculator remains named CPM Calculator. No tools were added or removed; route IDs and functionality were preserved.


## Professional UI and interaction pass

Applied a shared visual system across all 133 tool pages: branded gradient hero panels, improved typography and spacing, consistent form-control focus states, hover/active feedback, and reduced-motion support. Added a universal post-click visual pulse to enabled buttons; it does not claim that an action succeeded, so each tool should still provide its own status/error message where appropriate. This is a CSS and interaction consistency pass, not a full manual redesign of every tool's individual workflow. Production build, type-check, lint, and browser end-to-end testing have not been run.


## Invoice PDF Generator — professional invoice fields

Expanded the invoice generator with seller legal/trading identity and contact fields; buyer billing and optional shipping details; invoice/issue/due dates and purchase-order reference; itemized descriptions, HSN/SAC, quantity/unit, unit rate, line discounts and tax rates; configurable INR-style CGST/SGST, IGST, or no-tax presentation; invoice discount, shipping, optional round-off; payment method, bank/UPI details, payment terms, amount paid and balance due; notes, terms, and authorized-signatory name. PDF output includes a branded header, item table, totals, continuation pages, and page numbers. The tool is still a configurable template: users must verify jurisdiction-specific legal/tax/e-invoicing requirements before issuing.

## Professional Resume Builder

The Education & Student Tools category includes **Professional Resume Builder** at `/tools/professional-resume-builder`. It offers 20 selectable resume designs for students, graduates, technical and business roles, academics, healthcare, creative work, and international applications. Selecting a template opens a guided form for contact information, summary, work history, education, projects, skills, certifications, achievements, languages, and optional sections. The PDF is generated locally in the browser with `pdf-lib`; resume details are not uploaded by this tool. Blank sections are omitted, and the generator does not invent qualifications or experience. Users should review the exported PDF and tailor it to each employer's requirements.


## Recent toolbox navigation and media updates

- Added a cross-category **Popular tools** view while keeping each tool listed in its original category.
- The home page now includes a searchable-category-compatible **All tools** catalog grid.
- Removed "Soon" badges and roadmap messaging from category navigation.
- Reclassified CSS generators, CSS layout helpers, and related web UI design utilities under **UI/UX & Web Design Tools**.
- MP4-to-MP3 and Video Compressor now try jsDelivr and unpkg when loading the FFmpeg WebAssembly engine. Both require a working internet connection on first use; processing happens locally in the browser.


### FFmpeg / Next.js bundler compatibility

The development and production build scripts explicitly use Webpack (`next dev --webpack`, `next build --webpack`) because `@ffmpeg/ffmpeg` creates a module Worker using `import.meta.url`, which can fail to resolve under Turbopack in this setup. Restart the dev server after updating this project; stop the old server with Ctrl+C first.


## Security tool configuration

### Data Breach Checker
The live email breach lookup uses the Have I Been Pwned API v3. Add `HIBP_API_KEY=your_key_here` to the server's `.env.local` (or deployment environment) and restart the app. Obtain the key from the provider and follow its current terms and rate limits. Do not prefix this variable with `NEXT_PUBLIC_`; it must remain server-side. Without the key, the tool intentionally shows a clear configuration error rather than claiming an email is safe.

### Htpasswd Generator
The htpasswd endpoint uses `bcryptjs` for bcrypt entries and Node's built-in crypto for `{SHA}` and Apache APR1-MD5 entries. Bcrypt is recommended. SHA and APR1-MD5 are legacy formats and should only be used when compatibility requires them. Always deploy the tool over HTTPS.


### Free Data Breach Checker provider
The Data Breach Checker uses the XposedOrNot public email-check endpoint, which documents no API key for its basic email lookup. It has rate limits, and its dataset may be incomplete or outdated. The app does not need `HIBP_API_KEY` for this route. The email address is sent to the third-party provider for lookup; the UI asks for explicit consent first.


### Search field route-reset fix
The global tool-library search query is reset whenever the URL route changes. This prevents a stale search query (including browser-restored text such as `alisa`) from persisting when opening an individual tool page.


### Tool-route search isolation fix
The global search-results view is now rendered only on the homepage (`/`). A stale query or browser-autofilled search text can no longer replace an individual tool page's contents. Route changes also clear the search query.


## Browser navigation and installable app

- The selected category is preserved in `sessionStorage`, so after opening a tool and using the browser Back button, the homepage restores the category you were browsing.
- The app includes a web manifest, Toolbox icons, an install button, and a service worker for basic offline caching.
- For local testing, use `http://localhost:3000`. For installation on another device or a public site, use HTTPS.
- Microsoft Edge: open the site, choose the three-dot menu, then **Apps > Install this site as an app** (menu wording can vary). Chrome: use **Install page as app** or **Create shortcut** from its menu when available.
- Offline support is best-effort. Tools that need network APIs or large libraries may still require a connection.
