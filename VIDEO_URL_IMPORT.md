# Video URL import and export flow

## How it works

1. The user pastes a direct video-file URL and clicks **Load URL**.
2. The browser posts the URL to `POST /api/video-source`.
3. The Node.js route validates HTTP/HTTPS, resolves DNS and rejects private/restricted network targets, follows a small redirect limit while re-validating each destination, checks the response status/content type, and streams no more than 500 MB to the browser.
4. The browser loads the returned bytes into the existing video editor. Trimming and clip generation continue to use FFmpeg.wasm locally.
5. Output files are provided as browser download links (`blob:` URLs). They are not permanently hosted and are available only in the current page session.

## Important limits

- The route is for **direct media-file URLs**, not platform watch pages. YouTube/Vimeo/Instagram/etc. watch links can offer embeds where permitted, but this endpoint intentionally does not download their media.
- The source host must expose a recognizable video content type or a video-file extension. Some signed URLs and unusual media hosts may still fail.
- The route blocks private/local addresses and limits response size, but a production deployment should also add rate limiting and abuse monitoring. Serverless platforms may impose response-duration or bandwidth limits below the app's 500 MB limit.
- No paid API key is used. Server-side import can use your hosting bandwidth, so only deploy this endpoint on a host whose policies and limits permit it.
