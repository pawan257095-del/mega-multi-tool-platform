# Tool Smoke-Test Checklist

Run from the project root after `npm install`, `npm run typecheck`, `npm run lint`, and `npm run build`.

## Every route
- [ ] Open the tool route from the catalog.
- [ ] Confirm the page loads without runtime/console errors.
- [ ] Confirm title, description, and category match the selected tool.
- [ ] Check mobile-width layout and dark mode.

## Text and developer tools
- [ ] Empty input, normal input, long input, Unicode input, and malformed input.
- [ ] Copy buttons and reset buttons.
- [ ] JSON/XML/URL/Base64 validators reject invalid input and do not crash.
- [ ] Hash and password utilities handle empty input and large input safely.

## File conversion tools
- [ ] No file selected; show an actionable message.
- [ ] Correct file type, wrong file type, empty file, and oversized file.
- [ ] Corrupt/malformed PDF, image, office file, and archive.
- [ ] Multi-file merge/split, page counts, and output download.
- [ ] Unicode filenames and text containing ₹, Hindi, emoji, and typographic punctuation.
- [ ] Confirm object URLs are revoked after download and temporary buffers are released where feasible.

## Calculators and finance tools
- [ ] Zero, negative, fractional, extremely large, and non-numeric values.
- [ ] Confirm no `NaN` or `Infinity` is presented as a valid result.
- [ ] Verify formulas against known test cases.
- [ ] Confirm estimates include assumptions and disclaimers.

## Network/API tools
- [ ] Provider success, provider HTTP error, timeout, offline mode, malformed JSON, and rate limit.
- [ ] Validate input format before requesting a provider.
- [ ] Ensure user-provided URL/host inputs cannot access arbitrary internal services through server-side fetches.
- [ ] Ensure provider secrets are server-side only.
- [ ] Confirm unsupported tools show a clear unavailable status rather than fake data.

## Invoice PDF regression cases
- [ ] Default invoice with INR currency.
- [ ] Seller/customer fields containing ₹, em dash, smart quotes, emoji, and Hindi.
- [ ] 1, 25, and 60 line items; totals and notes should remain visible.
- [ ] Long invoice number, long descriptions, and notes.
- [ ] Tax and discount at 0, valid rates, and values over 100.
- [ ] Verify the PDF opens and text is readable in a PDF viewer.
