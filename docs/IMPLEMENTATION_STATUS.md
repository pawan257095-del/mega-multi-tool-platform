# Reference Roadmap Implementation Status

## Current milestone
- Milestone 48: Text to Speech — implemented at `/tools/text-to-speech`.
- Milestone 47: Fancy Text Generator — implemented at `/tools/fancy-text-generator`.
- Milestone 46: Find and Replace — implemented at `/tools/find-and-replace`.

Source of truth: `docs/TOOL_INVENTORY.md` from the original reference project. Build reference entries in inventory order; do not add extra tools until the reference inventory is complete. Existing features must be audited for actual route/page wiring before being counted complete.

## Current milestone
- Milestone 45: Text to Slug Converter — implemented as `/tools/text-to-slug-converter`.
- Milestone 44: Lorem Ipsum Generator — implemented as `/tools/lorem-ipsum-generator`.
- Milestone 43: Remove Extra Spaces and Line Breaks — implemented as `/tools/remove-extra-spaces-line-breaks`.
- Milestone 42: Case Converter — implemented as `/tools/case-converter`.
- Milestone 41: Word and Character Counter — implemented as `/tools/word-counter`.

## Reference inventory progress
- Category 1, PDF Tools: all 9 reference capabilities have implementation candidates with page files and routes in the current project. Full runtime verification is still pending.
- Category 2, Image & Design Tools: the 7 reference capabilities have implementation candidates: Image Converter, Image Compressor, Image Resizer, Image Cropper, Image to Base64, Base64 to Image, Color Picker from Image, HEX/RGB Converter, and Image Watermark. The inventory combines some related capabilities into shared entries.
- Categories 3–20: not yet reconciled completely against the reference inventory. Some starter catalog entries exist, but entries without an actual route/page do not count as implemented.

## Next reference item
- Milestone 49: JSON Formatter and Validator (Category 4, Developer & Coding Tools). Audit whether its existing catalog entry has a functional page and complete implementation; do not rebuild it if already complete.

## Validation policy
A tool is not considered deployment-verified solely because its source exists or ZIP integrity passes. Run dependency installation, TypeScript checks, production build, and browser checks before marking it verified.


## Milestone 41 — Word and Character Counter (Reference Inventory)

Implemented `/tools/word-counter` using the existing `word-counter` catalog entry. Includes word, character, no-whitespace character, sentence, paragraph, line, and alphanumeric counts; estimated reading/speaking time; approximate English Flesch readability; copy and `.txt` download. Processing is browser-local. Sentence, syllable, and readability results are estimates and may be less accurate for non-English text or abbreviations.

Verification: source/page/catalog/route checks and ZIP integrity are checked during packaging. Dependency installation, TypeScript checks, production build, and browser testing remain pending.


## Milestone 42 — Case Converter (Reference Inventory)

Implemented `/tools/case-converter` using a new catalog entry. Includes uppercase, lowercase, title case, sentence case, alternating case, inverse case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE. Includes live output, copy, `.txt` download, and use-result-as-input controls. Processing is browser-local.

Verification: source/page/catalog/route presence and ZIP integrity are checked during packaging. Dependency installation, TypeScript checks, production build, and browser testing remain pending.


## Milestone 43 — Remove Extra Spaces and Line Breaks (Reference Inventory)
- Route: `/tools/remove-extra-spaces-line-breaks`
- Status: implemented in source; ZIP integrity checked after packaging.
- Options: trim whole-text edges, collapse repeated spaces/tabs, trim each line, remove blank lines, normalize CRLF/CR endings, and join lines into one paragraph. Includes live output, copy, text download, and input/output character statistics.
- Processing runs locally in the browser. Dependency installation, TypeScript checks, production build, and browser testing remain pending.


## Milestone 44 — Lorem Ipsum Generator (Reference Inventory)
- Route: `/tools/lorem-ipsum-generator`
- Status: implemented in source; ZIP integrity checked after packaging.
- Generates placeholder text by paragraph, sentence, or word count, with controls for sentences per paragraph, minimum sentence length, and classic opening sentence. Output is editable, copyable, and downloadable as `.txt`; live word/character/paragraph statistics are shown.
- Processing is browser-local. Text is generated for layout prototyping and is not intended as meaningful prose. Dependency installation, TypeScript checks, production build, and browser testing remain pending.


## Milestone 45 — Text to Slug Converter (Reference Inventory)
- Route: `/tools/text-to-slug-converter`
- Status: implemented in source; ZIP integrity checked after packaging.
- Converts titles and phrases into URL-friendly slugs with hyphen/underscore separators, optional accent normalization, and optional digit retention. Includes live URL preview, slug length and word count, copy, text download, reset, and use-result-as-input.
- Processing runs locally in the browser. General-purpose slug rules may need adjustment for a specific CMS, routing framework, or language. Dependency installation, TypeScript checks, production build, and browser testing remain pending.


## Milestone 46 — Find and Replace (Reference Inventory)

Implemented `/tools/find-and-replace` using the existing Text & Content Tools category. Supports literal text search by default, optional JavaScript regular expressions, case-sensitive matching, replace-first or replace-all, live match counts, output preview, copy, `.txt` download, and using output as the next input. Invalid regex patterns display an error and leave input unchanged. Processing is local in the browser.

Verification: page, component, catalog entry, icon mapping, route mapping, inventory update, and ZIP integrity checked. Dependency installation, TypeScript checks, production build, and browser testing remain pending.


## Milestone 47 — Fancy Text Generator

Added `/tools/fancy-text-generator` as the next missing reference capability. Generates bold, italic, bold italic, monospace, double-struck, fullwidth, circled, small-caps, and strikethrough Unicode styles; supports copying an individual style, copying all styles, and downloading all output as a `.txt` file. Processing stays in the browser. Unicode coverage and rendering vary by font, device, and platform; decorative text may be less accessible to screen readers.

Verification: source files, catalog entry, icon and route mapping, inventory update, and ZIP integrity checked. Dependency installation, TypeScript checks, production build, and browser testing remain pending. Next reference capability: **Text to Speech (audio voiceover)** (Milestone 48).


## Milestone 48 — Text to Speech (Reference Inventory)

- Route: `/tools/text-to-speech`.
- Status: implemented in source; ZIP integrity checked after packaging.
- Uses the browser Web Speech API (`speechSynthesis`) with available local voices, voice/language selection, speed, pitch, volume, play, pause/resume, stop, and copy-text controls. Includes character and word counts and a browser-local privacy note.
- Limitation: browser/device voice availability varies. This is speech playback only; it does not record or export MP3/WAV audio, and it requires a browser with Web Speech API support.
- Dependency installation, TypeScript checks, production build, and browser testing remain pending.


## Milestone 49 — JSON Formatter and Validator (Reference Inventory)

- Route: `/tools/json-formatter`
- Uses the existing `json-formatter` catalog entry and `braces` icon.
- Features: syntax validation, formatted output with selectable indentation (2 spaces, 4 spaces, or tabs), minification, sample JSON, copy output, download `.json`, editable output, and use-result-as-input. Parsing errors are displayed with engine message and line/column when available.
- Privacy: JSON parsing and formatting run locally in the browser.
- Verification: source/page/catalog/route presence and ZIP integrity checked. Dependency installation, TypeScript checks, production build, and browser testing remain pending.

Next reference item: **HTML / CSS / JS minifier** (Milestone 51).


## Milestone 50 — XML to JSON / JSON to XML Converter (Reference Inventory)

- Route: `/tools/xml-json-converter`.
- Supports XML-to-JSON and JSON-to-XML, syntax validation, pretty output toggle, sample inputs, copy, download as `.json` or `.xml`, and switching output into the opposite converter.
- XML repeated child tags map to arrays; attributes map to `@attributes`; mixed text maps to `#text`. JSON-to-XML requires a single root property matching the chosen root element name and supports arrays as repeated elements.
- Privacy: conversion is local in the browser. This is a practical mapping rather than a lossless representation of all XML features; comments and namespace semantics may not round-trip.
- Verification: source/page/catalog/route presence and ZIP integrity checked. Dependency installation, TypeScript checks, production build, and browser testing remain pending.

Next reference item: **HTML / CSS / JS minifier** (Milestone 51).


## Milestone 51 — HTML / CSS / JavaScript Minifier (Reference Inventory)

- Route: `/tools/html-css-js-minifier`.
- Supports HTML, CSS, and JavaScript modes with starter samples, editable output, byte/character statistics, estimated bytes saved, clipboard copy, and downloads using `.html`, `.css`, or `.js` extensions.
- Processing is browser-local. This intentionally lightweight minifier does not replace a language parser or production bundler; complex JavaScript syntax and whitespace-sensitive HTML require review.
- Verification: source/page/catalog/route presence and ZIP integrity checked. Dependency installation, TypeScript checks, production build, and browser testing remain pending.

Next reference item: **HTML / CSS / JS beautifier** (Milestone 52).


## Milestone 52 — HTML / CSS / JavaScript Beautifier (Reference Inventory)

- Route: `/tools/html-css-js-beautifier`.
- Features: HTML/CSS/JavaScript mode selection, 2-space/4-space/tab indentation, starter examples, editable input and output, copy, language-specific downloads, and output reuse.
- Privacy: formatting runs locally in the browser.
- Limitation: lightweight best-effort formatting; not a full parser. HTML whitespace-sensitive content and complex JavaScript require review.
- Verification: source/page/catalog/route presence and ZIP integrity checked. Dependency installation, TypeScript checks, production build, and browser testing remain pending.

Next reference item: **URL encoder / decoder** (Category 4, Developer & Coding Tools; Milestone 53).


## Milestone 53 — URL Encoder / Decoder

- Route: `/tools/url-encoder-decoder`.
- Supports URL-component and full-URI encode/decode modes, a live preview, malformed-encoding feedback, editable result, copy, `.txt` download, sample loading, clearing, and using output as input.
- Privacy: conversion runs locally in the browser.
- Important: `encodeURIComponent` encodes reserved delimiters for a component; `encodeURI` preserves URI structure. Decode using the matching mode.
- Verification: page/component/catalog/route presence, TypeScript syntax transpilation, and ZIP integrity checked. Dependency installation, full type-check, production build, and browser testing remain pending.

Next reference item: **Base64 encoder / decoder** (Milestone 54).


## Milestone 54 — Base64 Encoder / Decoder

- Route: `/tools/base64-encoder-decoder`.
- Supports UTF-8-safe encoding/decoding, including emoji/non-English text; malformed Base64 and invalid UTF-8 feedback; sample, clear, editable result, copy, `.txt` download, and output reuse.
- Privacy: all conversion runs in the browser. Base64 is encoding, not encryption; binary payloads may not decode to readable text.
- Verification: source syntax transpilation, page/component/catalog/route checks, and ZIP integrity checked. Dependency installation, full type-check, production build, and browser testing remain pending.

Next reference item: **QR generator / scanner** (Milestone 55).


## Milestone 55 — QR Generator / Scanner

- Route: `/tools/qr-generator-scanner`.
- QR generation: text/URL input, live preview, configurable PNG size, error-correction level and foreground/background colors, PNG download. Uses the `qrcode` package.
- QR scanning: image-file input via the browser `BarcodeDetector` API where available; reports unsupported browsers and no-code cases clearly. Does not claim universal scanner support.
- Privacy: generation and image scanning occur in the browser; image files are not uploaded by this tool.
- Verification: syntax transpilation and source/catalog/route checks plus ZIP integrity passed. Dependency installation, full type-check, production build, and browser testing remain pending.

Next reference item: **UUID / GUID generator** (Milestone 56).


## Milestone 56 — UUID / GUID Generator

Implemented source: `src/app/tools/uuid-guid-generator/page.tsx` and `src/components/tools/uuid-guid-generator-tool.tsx`. Catalog and route are connected. Supports UUID v4 generation in batches, uppercase and no-hyphen options, copy and TXT download. Syntax and ZIP checks only; build and browser testing remain pending.


## Milestone 57 — MD5 / SHA-256 Hash Generator

- Route: `/tools/md5-sha256-hash-generator`.
- Supports text-to-MD5 and text-to-SHA-256 hexadecimal hashes, sample input, clear, copy, TXT download, and using the hash as input. MD5 is explicitly labeled insecure/legacy; SHA-256 uses Web Crypto.
- Privacy: all input processing is local in the browser.
- Verification: TypeScript syntax transpilation, route/catalog checks, MD5 known-vector check, and ZIP integrity checked. Full production build and browser testing remain pending.


## Milestone 58 — Meta Tag Generator

Implemented `/tools/meta-tag-generator` with basic SEO metadata, canonical and robots tags, Open Graph and Twitter/X card tags, editable fields, preview, copy, and HTML download. Processing is browser-local. Syntax transpilation and archive integrity checked; build and browser verification pending.

Next: robots.txt generator (Milestone 59).


## Milestone 59 — robots.txt Generator

Implemented at `/tools/robots-txt-generator`. Supports user-agent, enabled/disabled Allow and Disallow paths, optional sitemap URL and crawl-delay, live output, copy, reset, and `robots.txt` download. Generation is browser-local. Reminder: robots.txt is not a security boundary and crawler support for Crawl-delay varies. Syntax transpilation, catalog/route presence, and ZIP integrity checked; production build and browser verification pending.

Next reference item: **XML sitemap generator** (Category 5, SEO & Webmaster Tools; Milestone 60).


## Milestone 60 — XML Sitemap Generator

Implemented at `/tools/xml-sitemap-generator`. Supports multiple URLs, optional last-modified dates, change-frequency hints, priority, XML escaping, URL/date/priority validation, sample data, add/remove rows, copy, and `sitemap.xml` download. Generation is browser-local. Sitemap inclusion does not guarantee indexing. Syntax transpilation and source/catalog/route checks passed; full production build and browser verification pending.

Next reference item: **Keyword density checker** (Category 5, SEO & Webmaster Tools; Milestone 61).

## Milestone 61 — Keyword Density Checker

- Route: `/tools/keyword-density-checker`.
- Analyzes single words, two-word phrases, or three-word phrases; provides frequency counts, estimated density percentages, and total/unique word statistics.
- Includes a configurable stop-word filter, top 10/25/50 results, copyable CSV output, and CSV download.
- Text processing runs locally in the browser. Density is a descriptive ratio, not a search-ranking formula.
- Verification: source syntax transpilation and ZIP integrity checked; dependency installation, production build, and browser testing remain pending.

Next reference item: **Open Graph Generator** (Category 5, SEO & Webmaster Tools; Milestone 62).


## Milestone 62 — Open Graph Generator

- Route: `/tools/open-graph-generator`.
- Generates Open Graph title, description, type, page URL, image URL, site name, and locale tags.
- Includes an approximate share-card preview, URL validation, copy, HTML snippet download, sample and clear controls.
- All form processing runs locally in the browser. Social crawlers may need tags present in the page source/server-rendered HTML; actual previews vary by platform.
- Verification: syntax transpilation and source/catalog/route checks plus ZIP integrity. Full build and browser testing remain pending.

Next reference item: **YouTube thumbnail downloader** (Category 5, SEO & Webmaster Tools; Milestone 63).


## Milestone 63 — YouTube Thumbnail Downloader

- Route: `/tools/youtube-thumbnail-downloader`.
- Accepts standard YouTube watch, Shorts, live, embed, youtu.be URLs, or an 11-character video ID.
- Previews maximum, standard, high, medium, and default public thumbnail endpoints; supports selecting a size, copying its URL, opening the image, and attempting a JPG download with a manual-save fallback if cross-origin download is blocked.
- Does not require a backend or API key. Availability and exact dimensions depend on the video. Users should reuse thumbnails only when permitted.
- Verification: source/page/catalog/route checks and ZIP integrity checked. Dependency installation, full TypeScript checks, production build, and browser testing remain pending.

Next reference item: **Age Calculator** (Milestone 64).


## Milestone 64 — Age Calculator

- Route: `/tools/age-calculator`.
- Calculates calendar age as years/months/days, total months, total days, next birthday date, and days remaining.
- Includes input validation, sample/clear controls, and copyable summary; all calculations run locally. February 29 next-birthday countdown uses February 28 in non-leap years.
- Verification: TypeScript syntax transpilation and catalog/route checks plus ZIP integrity. Full dependency installation, production build, and browser testing remain pending.

Next reference item: **EMI / loan calculator** (Category 6, Calculators & Daily Utilities; Milestone 65).

## Milestone 65 — EMI / Loan Calculator

- Route: `/tools/emi-loan-calculator`.
- Estimates fixed-rate monthly EMI, total interest, total repayment, and optional processing fee.
- Displays principal/interest composition and the first 12 months of an amortization schedule; the full schedule can be downloaded as CSV.
- Validates amount, annual rate, tenure, and processing-fee inputs. All calculations run locally; this is an estimate and not a lender quote.
- Verification: TypeScript syntax transpilation, catalog/route presence, calculation smoke checks, and ZIP integrity. Full dependency installation, production build, and browser testing remain pending.

Roadmap order is governed by `docs/TOOL_INVENTORY.md`; after EMI / loan calculator, the next listed tool is **BMI Calculator** (Milestone 66).

## Milestone 66 — BMI Calculator

- Route: `/tools/bmi-calculator`.
- Calculates BMI from metric or imperial measurements, displays standard adult reference categories and a height-based BMI 18.5–24.9 weight range.
- Includes input validation, sample/clear controls, copyable summary, and a medical-context disclaimer. Calculations run locally.
- Verification: syntax transpilation, catalog/route presence, calculation smoke checks, and ZIP integrity. Full dependency installation, production build, and browser testing remain pending.

Next reference item: **Percentage / discount calculator** (Category 6, Calculators & Daily Utilities; Milestone 67).


## Milestone 67 — Percentage / Discount Calculator

- Route: `/tools/percentage-discount-calculator`.
- Supports percentage-of-value, part-as-percent-of-whole, percentage change, and discount/final-price calculations. Includes input validation, sample/clear controls, copy result, and TXT download.
- Processing runs locally in the browser. Discount calculations do not automatically add taxes or shipping.
- Verification: syntax transpilation, catalog/page/route presence, arithmetic smoke tests, and ZIP integrity. Full dependency installation, production build, and browser testing remain pending.

Next reference item: **Strong password generator** (Category 6, Calculators & Daily Utilities; Milestone 68).


## Milestone 68 — Strong Password Generator

- Route: `/tools/strong-password-generator`.
- Generates cryptographically random passwords in-browser using Web Crypto, with selectable character groups, ambiguity exclusion, length (4–128), batch count (1–20), visibility toggle, copy controls, and TXT download.
- Includes input validation and security guidance; generated values are not transmitted to a server by this tool.
- Verification: source syntax transpilation, catalog/route presence, generator smoke checks, and ZIP integrity. Full dependency installation, production build, and browser testing remain pending.

Next reference item: **Random number/name picker** (Category 6, Calculators & Daily Utilities; Milestone 69).


## Milestone 69 — Random Number / Name Picker
- Route: `/tools/random-number-name-picker`.
- Supports random integer draws from an inclusive range and random selection from a user-supplied list; count 1–100, optional uniqueness, copy/download, and repeat pick.
- Uses Web Crypto with rejection sampling and runs locally. Duplicate list entries are treated as separate entries.
- Verification: source syntax transpilation, catalog/page/route checks, algorithm review, and ZIP integrity. Full dependency installation, production build, and browser testing remain pending.

Next reference item: **Stopwatch / countdown timer** (Category 6, Calculators & Daily Utilities; Milestone 70).


## Milestone 70 — Stopwatch / Countdown Timer
- Route: `/tools/stopwatch-countdown-timer`.
- Stopwatch: start/pause/resume/reset, lap history, and copy displayed time. Countdown: configurable minutes and seconds, set duration, start/pause/resume/reset, and completion state.
- Uses browser-local timestamp-based timing. Updates can be throttled while a tab is backgrounded or a device sleeps; not intended for certified precision timing.
- Verification: syntax transpilation, catalog/route presence, logic review, and ZIP integrity. Full dependency installation, production build, and browser tests remain pending.

Next reference item: **MP4 to MP3** (Category 7, Video & Audio Tools; Milestone 71).


## Milestone 71 — MP4 to MP3
- Added `/tools/mp4-to-mp3` with local MP4 selection, bitrate options, progress status, audio preview, and MP3 download. FFmpeg WebAssembly core loads from jsDelivr on first conversion; network access is required for that first load.
- Verification: TypeScript syntax transpilation, catalog and route mapping, and ZIP integrity. Full dependency installation, production build, and real-browser conversion remain pending.
- Next reference item: Audio trimmer/ringtone maker (Milestone 72).


## Milestone 72 — Audio Trimmer / Ringtone Maker
- Route: `/tools/audio-trimmer-ringtone-maker`.
- Accepts supported local audio files up to 100 MB, decodes with Web Audio API, lets users select start/end times, previews the selection, and exports PCM WAV (up to stereo).
- Browser codec support varies; export is WAV rather than MP3. Audio remains local, but decoding long files can use substantial memory.
- Verification: TypeScript/TSX syntax transpilation, catalog and route integration, WAV encoder smoke checks, and ZIP integrity. Full dependency install, production build, and real browser audio test remain pending.

Next reference item: **Video compressor** (Category 7, Video & Audio Tools; Milestone 73).


## Milestone 73 — Video Compressor

Status: source integrated; not yet release-verified.

- Route: `/tools/video-compressor`
- Tool: `Video Compressor` (Category 7 — Video & Audio Tools)
- Uses FFmpeg WebAssembly to encode MP4 with H.264/AAC; configurable CRF quality and optional maximum width.
- Input is limited to 300 MB as a conservative browser-memory guard. FFmpeg core is fetched from a public CDN at runtime.
- Source syntax and archive integrity checked. Full build and browser-based conversion still pending.
- Next reference tool: **What is my IP**.


## Milestone 74 — What Is My IP?

- Route: `/tools/what-is-my-ip`.
- Fetches public IP details only after the user clicks the lookup button; shows IP version and optional approximate location, network/provider, and timezone. Falls back to an IP-only service if the detailed endpoint fails.
- Privacy note warns that third-party lookup services can see the public IP. The tool does not claim to reveal the device's private LAN IP.
- Verification: syntax transpilation, catalog/route checks, and ZIP integrity. Full build and live browser/network test remain pending.

Next reference item: **WHOIS lookup** (Category 8 — Network & IP Tools; Milestone 75).


## Milestone 75 — WHOIS Lookup
- Route: `/tools/whois-lookup`.
- Queries public RDAP registration data without an API key; shows registrar, relevant dates, domain status, nameservers, and registry metadata when available.
- Accepts a domain or full URL, validates the hostname, copies a summary, and explains third-party lookup/privacy and registry limitations.
- Verification: source syntax and catalog/route integration checked; ZIP integrity checked. Full build and browser/network test remain pending.
- Next reference item: **Ping / latency checker** (Milestone 76).


## Milestone 76 — DNS Lookup
- Route: `/tools/dns-lookup`.
- Queries A, AAAA, CNAME, MX, NS, TXT, CAA, and SOA records through Google Public DNS JSON-over-HTTPS. Displays record data, TTL, and DNS response status, and supports copying a plain-text summary.
- Accepts a domain or full URL and validates the hostname. DNS queries are sent to a third-party resolver; responses may differ from authoritative answers due to caching, propagation, or split-horizon configuration.
- Verification: source syntax, catalog/route integration, response handling review, and ZIP integrity checked. Full build and live browser/network tests remain pending.

Next reference item: **Ping / traceroute** (Category 8 — Network & IP Tools; Milestone 77).


## Milestone 77 — Ping / Traceroute
- Route: `/tools/ping-traceroute`.
- Provides a browser-compatible HTTPS timing check with configurable 1–10 attempts, per-attempt results, min/average/max latency, failed-request percentage, and copyable report.
- Does not claim to perform ICMP ping or traceroute: browser APIs do not provide arbitrary raw ICMP or hop discovery. Provides OS command guidance for true ping/traceroute.
- Verification: TypeScript syntax transpilation, catalog/route presence, and ZIP integrity. Full build and browser/network testing pending.
- Next reference item: **MAC address vendor lookup** (Category 8; Milestone 78).


## Milestone 78 — MAC Address Vendor Lookup
- Route: `/tools/mac-address-vendor-lookup`.
- Validates a 12-hex-character MAC address or 6-character OUI prefix and queries the public macvendors.com lookup endpoint. Shows the registered organization, normalized address, lookup time, copyable summary, and privacy/coverage caveats.
- Limitation: browser tool does not scan a LAN or discover other devices' MAC addresses. Vendor data does not identify a device owner or guarantee a model.
- Verification: syntax transpilation, catalog/route integration, and ZIP integrity checked. Full production build and live browser/API test pending.

Next reference item: **SSL certificate checker** (Category 8, Network & IP Tools; Milestone 79).


## Milestone 79 — SSL Certificate Checker

- Route: `/tools/ssl-certificate-checker`.
- Queries crt.sh certificate-transparency JSON for a domain and lists up to 30 recent records with issuer, common name, validity dates, date-based expiry estimate, and links to source records. Includes copyable summary and third-party data notice.
- Limitation: browser-only implementation does not perform a live TLS handshake and cannot reliably verify the currently served certificate chain, hostname match, revocation, or server configuration.
- Verification: TypeScript/TSX syntax transpilation, catalog/route presence, and ZIP integrity checks. Full build and live browser/network test remain pending.
- Next reference item: **Real-time currency converter** (Category 9 — Financial & Business Tools; Milestone 80).


## Milestone 82 — Real-Time Currency Converter
- Added currency selection and amount conversion UI.
- Uses Frankfurter public HTTP API for reference rates; no project-owned backend required.
- Added route, tool catalog entry, and navigation mapping.
- Browser/network execution and production build not verified in this environment.

## Milestone 83 — GST / VAT Calculator
- Route: `/tools/gst-vat-calculator`.
- Supports adding tax to a tax-exclusive base amount and extracting tax from a tax-inclusive total; configurable percentage, currency display, copyable breakdown, reset, and optional estimated equal CGST/SGST split.
- Limitation: calculation helper only. Tax treatment, rates, rounding and whether CGST/SGST or IGST applies depend on jurisdiction and transaction; verify current official rules.
- Verification: route/component/catalog/navigation and ZIP integrity checked. Full production build and live browser testing remain pending.
- Next reference item: **SIP / mutual fund calculator** (Category 9 — Financial & Business Tools; Milestone 84).


## Milestone 84 — SIP / Mutual Fund Calculator
- Added browser-side SIP projection with monthly contribution, expected annual return, duration, optional annual step-up, currency selection, copy summary, and reset.
- Route: `/tools/sip-mutual-fund-calculator`.
- Calculation is an estimate using monthly compounding derived from annual return; no investment outcomes are guaranteed.
- Verification: source integration added; production build and browser interaction not run in this environment.
