# Tool Inventory and Category Order

This is the roadmap inventory, not a claim that these tools are already implemented. Build in this order unless a dependency or user-approved reprioritization makes another order clearly better.

**Counting note:** The original list contains about 116 listed entries across 20 categories. Some capabilities repeat (for example, YouTube tag extraction appears in SEO and creator tools). Implement one canonical capability and link to it from multiple relevant categories rather than maintaining duplicate code. Reconcile the final unique count as implementation proceeds.

## 1. PDF Tools — 9
1. Image to PDF (JPG/PNG to PDF)
2. PDF to Image (extract pages as JPG/PNG)
3. Merge PDF
4. Split PDF
5. Compress PDF
6. Word / Excel / PowerPoint to PDF
7. Protect PDF with password
8. Unlock PDF with password, only where the user is authorized and the password/permissions permit it
9. Extract text from PDF

**Implementation notes:** Browser support and library capability vary. Office-to-PDF may require a conversion service or a local-compatible library; document limitations honestly. PDF compression is not guaranteed to shrink every PDF. Password handling must not imply breaking encryption.

## 2. Image & Design Tools — 7
1. Image format converter (JPG, PNG, WEBP, GIF, ICO)
2. Image compressor
3. Image resizer and cropper
4. Image to Base64 / Base64 to Image
5. Color picker from image
6. HEX to RGB / RGB to HEX
7. Meme generator / image watermark adder

## 3. Text & Content Tools — 7
1. Word and character counter
2. Case converter
3. Remove extra spaces and line breaks — implemented at `/tools/remove-extra-spaces-line-breaks` (Milestone 43)
4. Lorem Ipsum generator
5. Text to slug converter — implemented at `/tools/text-to-slug-converter` (Milestone 45)
6. Find and replace — implemented at `/tools/find-and-replace` (Milestone 46)
7. Fancy text generator — implemented at `/tools/fancy-text-generator` (Milestone 47)
8. Text to speech (audio voiceover) — implemented at `/tools/text-to-speech` (Milestone 48)

**Counting correction:** The original category contains 8 listed capabilities despite an earlier estimated count of 7. Track all 8.

## 4. Developer & Coding Tools — 9
1. JSON formatter and validator — implemented at `/tools/json-formatter` (Milestone 49)
2. XML to JSON / JSON to XML — implemented at `/tools/xml-json-converter` (Milestone 50)
3. HTML / CSS / JS minifier
4. HTML / CSS / JS beautifier
5. URL encoder / decoder
6. Base64 encoder / decoder
7. QR code generator and scanner
8. UUID / GUID generator
9. MD5 / SHA-256 hash generator

## 5. SEO & Webmaster Tools — 6
1. Meta tag generator
2. robots.txt generator
3. XML sitemap generator
4. Keyword density checker
5. Open Graph tag generator
6. YouTube thumbnail downloader

## 6. Calculators & Daily Utilities — 6
1. Age calculator
2. EMI / loan calculator
3. BMI calculator
4. Percentage and discount calculator
5. Strong password generator
6. Random number / name picker
7. Stopwatch and countdown timer

**Counting correction:** The original category contains 7 listed capabilities despite an earlier estimated count of 6.

## 7. Video & Audio Tools — 3
1. MP4 to MP3 converter
2. Audio trimmer / ringtone maker
3. Video compressor

**Implementation notes:** Browser-side media processing can be CPU/memory-intensive. Use WebAssembly/FFmpeg only when suitable, lazy-load it, disclose resource requirements, and offer sensible file limits.

## 8. Network & IP Tools — 6
1. What is my IP?
2. WHOIS lookup
3. DNS lookup
4. Ping and traceroute
5. MAC address vendor lookup
6. SSL certificate checker

**Implementation notes:** Browser sandboxes cannot perform arbitrary raw ICMP ping/traceroute or inspect a user's MAC address. Some tools require a backend, public API, or limited browser-compatible alternative. State limitations clearly.

## 9. Financial & Business Tools — 6
1. Real-time currency converter
2. GST / VAT calculator
3. SIP / mutual fund calculator
4. Crypto-to-fiat converter
5. Invoice generator (PDF)
6. Salary / income tax calculator

## 10. Unit & Measurement Converters — 5
1. Length / distance converter
2. Weight converter
3. Temperature converter
4. Data storage converter
5. Time converter

## 11. UI/UX & Web Design Tools — 6
1. Color palette generator
2. CSS gradient generator
3. Box-shadow and border-radius generator
4. SVG to PNG / PNG to SVG converter
5. Dummy image generator
6. Font pairing generator

**Implementation notes:** PNG-to-SVG is not always a clean vector conversion; clarify whether the tool embeds a raster image or performs actual tracing.

## 12. Social Media & Marketing Tools — 5
1. WhatsApp direct link generator
2. YouTube video tag extractor
3. Tweet-to-image converter
4. UTM link builder
5. Social media character counter

## 13. Security & Privacy Tools — 4
1. Password strength checker
2. Data breach checker (Have I Been Pwned API or another authorized source)
3. Temporary / disposable email generator
4. Htpasswd generator

**Implementation notes:** Never send raw passwords to a server. A breach lookup should follow the provider's current privacy-preserving API method and terms. Disposable email may depend on a third-party service and abuse controls.

## 14. AI & Trendy Tools — 4
1. AI text summarizer
2. Grammar and spell checker
3. ChatGPT / Midjourney prompt generator
4. Text-to-emoji translator

**Implementation notes:** Summarization and grammar correction may require an external model/API, introducing costs, latency, rate limits and privacy disclosures. The prompt generator can be client-side.

## 15. Education & Student Tools — 5
1. CGPA to percentage / GPA calculator
2. Citation generator (APA / MLA)
3. Plagiarism checker / text comparison
4. Word unscrambler / anagram solver
5. Percentage difference calculator

**Implementation notes:** GPA conversion depends on the institution's policy; avoid presenting one formula as universal. A simple text comparison is not equivalent to a comprehensive plagiarism database.

## 16. Health & Fitness Calculators — 5
1. Daily calorie / macros calculator
2. Pregnancy due date calculator
3. BMR calculator
4. Ideal weight calculator
5. Water intake calculator

**Implementation notes:** Present results as estimates, explain assumptions, avoid diagnostic claims, and use appropriate medical disclaimers. Minimize storage of sensitive user inputs.

## 17. E-Commerce & Dropshipping Tools — 5
1. PayPal / Stripe fee calculator
2. Profit margin and markup calculator
3. ROI calculator
4. Barcode generator (UPC / EAN formats)
5. CPM calculator

**Implementation notes:** Fees vary by country, account type, payment method and date. Keep fee schedules configurable and show last-updated dates. Do not imply generated barcode numbers are officially licensed or valid for retail without proper assignment.

## 18. YouTube & Content Creator Tools — 5
1. YouTube earnings estimator
2. YouTube video tag / keyword extractor
3. YouTube title and description generator
4. Twitch overlay resizer
5. Instagram / TikTok hashtag generator

**Implementation notes:** Earnings are estimates, not guarantees. Avoid scraping or bypassing platform restrictions; use permitted APIs and user-provided data where possible.

## 19. Fun, Gaming & Social Generators — 5
1. Gamertag / username generator
2. Discord text formatter
3. Kaomoji / Lenny face board
4. Love calculator (entertainment only)
5. Zodiac sign calculator

## 20. Productivity & Remote Work Tools — 4
1. Time zone converter
2. Pomodoro timer
3. In-browser notepad with local saving
4. Meeting overlap calculator

## Count reconciliation
The rough 116 figure was an estimate, not a finalized count. The original categories include some count mismatches:
- Text & Content Tools: 8 listed, not 7
- Calculators & Daily Utilities: 7 listed, not 6
The inventory above lists 118 category entries before deduplication. Several entries overlap, so the final canonical unique-tool total may be lower. Maintain the final count in `PROGRESS_TRACKER.md` as each route is implemented.


## Implementation tracking update

- Milestone 49: JSON Formatter and Validator — implemented at `/tools/json-formatter`. Supports JSON syntax validation, formatted output with 2-space/4-space/tab indentation, minification, copy, `.json` download, sample loading, and output reuse. JSON is processed locally in the browser.
- Verification status: source/page/catalog/route checks and ZIP integrity checked. Dependency installation, TypeScript checks, production build, and browser testing remain pending.

Next reference item: **HTML / CSS / JS minifier** (Category 4, Developer & Coding Tools; Milestone 51).


## Implementation tracking update

- Milestone 50: XML to JSON / JSON to XML Converter — implemented at `/tools/xml-json-converter`. XML is parsed with the browser DOMParser and JSON with JSON.parse. Repeated XML child elements become arrays; attributes are represented using `@attributes`, and mixed text uses `#text`. JSON-to-XML accepts one root property and supports arrays as repeated elements.
- Privacy: conversion runs locally in the browser; source text is not uploaded. XML comments, namespaces, processing instructions, and some XML-specific distinctions are not preserved by the simplified JSON mapping.
- Verification: source/page/catalog/route presence and ZIP integrity checked. Dependency installation, TypeScript checks, production build, and browser testing remain pending.

Next reference item: **HTML / CSS / JS minifier** (Category 4, Developer & Coding Tools; Milestone 51).

- Milestone 51: HTML / CSS / JavaScript Minifier — implemented at `/tools/html-css-js-minifier`. Local lightweight minification modes for HTML, CSS, and JavaScript; copy/download and byte-savings stats. Not a full parser; review output before production use.

Next reference item: **HTML / CSS / JS beautifier** (Category 4, Developer & Coding Tools; Milestone 52).


## Implementation tracking update

- Milestone 52: HTML / CSS / JavaScript Beautifier — implemented at `/tools/html-css-js-beautifier`; local best-effort formatter with configurable indentation, copy, download, and output reuse.

Next reference item: **URL encoder / decoder** (Category 4, Developer & Coding Tools; Milestone 53).


## Milestone 53 — URL Encoder / Decoder (Reference Inventory)

- Route: `/tools/url-encoder-decoder`.
- Supports component and full-URI encoding/decoding using browser URI functions, malformed-input error handling, preview, editable output, copy, `.txt` download, and result reuse.
- Processing is local in the browser. Use matching encode/decode modes.
- Verification: source integration and ZIP integrity checked; runtime/build verification pending.

Next reference item: **Base64 encoder / decoder** (Category 4, Developer & Coding Tools; Milestone 54).


## Implementation progress update — Milestone 54

Base64 Encoder / Decoder is implemented at `/tools/base64-encoder-decoder`. The tool encodes/decodes UTF-8 text locally, handles malformed Base64 and invalid UTF-8 errors, and provides copy/download/output reuse. Base64 is not encryption and binary payloads may not be readable text.

Next reference item: **QR generator / scanner** (Category 4, Developer & Coding Tools; Milestone 55).


## Implementation progress update — Milestone 55

QR Generator / Scanner is implemented at `/tools/qr-generator-scanner`. QR codes can be generated from text/URLs and downloaded as PNG with configurable size, correction level, and colors. Image scanning uses `BarcodeDetector` when the browser supports it; this capability is not universal.

Next reference item: **UUID / GUID generator** (Category 4, Developer & Coding Tools; Milestone 56).


## Milestone 56 — UUID / GUID Generator

Implemented source: `src/app/tools/uuid-guid-generator/page.tsx` and `src/components/tools/uuid-guid-generator-tool.tsx`. Catalog and route are connected. Supports UUID v4 generation in batches, uppercase and no-hyphen options, copy and TXT download. Syntax and ZIP checks only; build and browser testing remain pending.

Next reference-roadmap tool: **MD5 / SHA-256 Hash Generator** (Milestone 57).


## Milestone 57 — MD5 / SHA-256 Hash Generator

Implemented source: `src/app/tools/md5-sha256-hash-generator/page.tsx` and `src/components/tools/md5-sha256-hash-generator-tool.tsx`. Catalog and route are connected. Supports MD5 and SHA-256 hashes for text, copy/download, sample, clear, and output reuse. MD5 is explicitly identified as insecure for security purposes.

Category 4 Developer & Coding Tools reference entries through MD5 / SHA-256 Hash Generator have now been implemented in the source roadmap. Meta tag generator implemented in Milestone 58. Next reference-roadmap tool: **robots.txt generator** (Category 5, SEO & Webmaster Tools; Milestone 59).


## Milestone 58 — Meta Tag Generator

Implemented at `/tools/meta-tag-generator`. Includes title, description, keywords, author, robots, canonical, Open Graph, and Twitter/X tags with copy/download and approximate search preview.

Next reference item: **robots.txt generator** (Category 5, SEO & Webmaster Tools; Milestone 59).


## Milestone 59 — robots.txt Generator

Implemented at `/tools/robots-txt-generator`. Supports user-agent, enabled/disabled Allow and Disallow paths, optional sitemap URL and crawl-delay, live output, copy, reset, and `robots.txt` download. Generation is browser-local. Reminder: robots.txt is not a security boundary and crawler support for Crawl-delay varies. Syntax transpilation, catalog/route presence, and ZIP integrity checked; production build and browser verification pending.

Next reference item: **XML sitemap generator** (Category 5, SEO & Webmaster Tools; Milestone 60).


## Milestone 60 — XML Sitemap Generator

Implemented at `/tools/xml-sitemap-generator`. Generates XML sitemap entries for HTTP/HTTPS URLs, optionally including `lastmod`, `changefreq`, and `priority`. Includes URL protocol, date-format, and priority validation; XML escaping; sample, add/remove, copy, and download. Local browser processing. Syntax transpilation, route/catalog presence, and ZIP integrity checked; production build and browser testing pending.

Next reference item: **Keyword density checker** (Category 5, SEO & Webmaster Tools; Milestone 61).

## Milestone 61 — Keyword Density Checker (Reference Inventory)

- Route: `/tools/keyword-density-checker`.
- Counts word or 2-/3-word phrase occurrences and estimates density relative to total word count.
- Optional common stop-word exclusion; results can be copied or downloaded as CSV.
- Browser-local analysis; density is informational and does not guarantee search rankings.

Next reference item: **Open Graph Generator** (Category 5, SEO & Webmaster Tools; Milestone 62).


## Milestone 62 — Open Graph Generator

- Route: `/tools/open-graph-generator`.
- Generates Open Graph title, description, type, page URL, image URL, site name, and locale tags.
- Includes an approximate share-card preview, URL validation, copy, HTML snippet download, sample and clear controls.
- All form processing runs locally in the browser. Social crawlers may need tags present in the page source/server-rendered HTML; actual previews vary by platform.
- Verification: syntax transpilation and source/catalog/route checks plus ZIP integrity. Full build and browser testing remain pending.

Next reference item: **YouTube thumbnail downloader** (Category 5, SEO & Webmaster Tools; Milestone 63).


## Progress note — Milestone 63

YouTube Thumbnail Downloader has been added at `/tools/youtube-thumbnail-downloader` as the final entry in Category 5. Next reference item in order: **Age Calculator** (Category 6).


## Implementation progress

Milestone 64 implemented: **Age Calculator** (Category 6). Next in the reference order: **EMI / loan calculator** (Milestone 65).

## Milestone 65 — EMI / Loan Calculator (Reference Inventory)

- Route: `/tools/emi-loan-calculator`.
- Calculates estimated monthly EMI, total interest, total repayment, optional processing fee, and downloadable amortization CSV.

Roadmap order is governed by the original reference inventory; after EMI / loan calculator, the next listed tool is **BMI Calculator** (Milestone 66).

## Milestone 66 — BMI Calculator (Reference Inventory)

- Route: `/tools/bmi-calculator`.
- Metric and imperial BMI calculations with adult reference categories and contextual disclaimer.

Next reference item: **Percentage / discount calculator** (Milestone 67).


## Milestone 67 progress — Percentage / Discount Calculator
Implemented at `/tools/percentage-discount-calculator`. Supports discount amount/final price/savings, percentage of a value, part as a percentage of whole, and percentage change. Next item in reference order: **Strong password generator** (Milestone 68).


## Milestone 68 progress — Strong Password Generator
Implemented at `/tools/strong-password-generator`. Generates cryptographically random passwords locally with configurable length and character groups. Next item in the original reference order: **Random number/name picker** (Category 6).


## Milestone 69 progress — Random Number / Name Picker
Implemented at `/tools/random-number-name-picker`. Supports random integer range draws and name-list selection, 1–100 results, optional no-duplicates, Web Crypto randomness, copy, and TXT download. Next reference item: **Stopwatch / countdown timer** (Milestone 70).


Implementation progress: Milestone 70 — Stopwatch / Countdown Timer implemented at `/tools/stopwatch-countdown-timer`. Next in reference order: MP4 to MP3 (Category 7).


## Milestone 71 progress — MP4 to MP3
Implemented at `/tools/mp4-to-mp3`. Uses FFmpeg WebAssembly loaded from jsDelivr to convert local MP4 files to MP3, with bitrate selection, progress display, preview, and download. Source and ZIP checks are not a substitute for a full browser conversion test. Next reference item: **Audio trimmer/ringtone maker** (Category 7, Video & Audio Tools; Milestone 72).


## Implementation progress update — Milestone 72

Audio Trimmer / Ringtone Maker is implemented at `/tools/audio-trimmer-ringtone-maker`. It decodes supported local audio in the browser, allows start/end time selection, previews the chosen range, and exports PCM WAV. The browser's codec support varies and long files can use substantial memory.

Next reference item: **Video compressor** (Category 7, Video & Audio Tools; Milestone 73).


## Progress note — Milestone 73

Video Compressor source has been added to the Category 7 entry. This is not marked tested/released until dependencies are installed, the production build succeeds, and browser conversion tests are completed. Next in roadmap order: Category 8, **What is my IP**.


## Progress note — Milestone 74

`What Is My IP` source is integrated at `/tools/what-is-my-ip`; it is not release-verified until dependencies, build, and browser/network tests pass. The next item in Category 8 is **WHOIS lookup**.


## Milestone 75 — WHOIS Lookup (Reference Inventory)
Implemented at `/tools/whois-lookup`. Uses public RDAP lookup to display domain registration metadata when available, including registrar, dates, status, and nameservers. Domain input is sent to the RDAP provider; registrant contact information may be redacted.

Next reference item: **Ping / latency checker** (Category 8, Network & IP Tools; Milestone 76).


## Milestone 77 — Ping / Traceroute
Implemented at `/tools/ping-traceroute` as a browser-compatible HTTPS reachability timing check. This is explicitly not ICMP ping and does not perform traceroute; true ICMP and hop discovery require a system tool or backend.

Next reference item: **MAC address vendor lookup** (Category 8, Network & IP Tools; Milestone 78).


## Milestone 79 progress — SSL Certificate Checker
Implemented at `/tools/ssl-certificate-checker` using public certificate-transparency records from crt.sh. It displays issuer and validity-date information, but is not a live TLS handshake validator. Next reference item: **Real-time currency converter** (Milestone 80, Category 9).
