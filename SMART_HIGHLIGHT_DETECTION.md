# Smart Highlight Detection (No API Key)

The Video Clip Generator includes a local, browser-based visual activity analyzer.

- Samples low-resolution video frames using the browser's video and canvas APIs.
- Scores changes between adjacent frames, with a small contribution from brightness changes.
- Ranks candidate clip windows and selects non-overlapping windows with higher visual activity.
- Uses FFmpeg WebAssembly to encode the selected sections locally in the browser.
- Does not upload the video to a cloud AI service and does not require an API key.

## Important limitation

This is a lightweight visual-activity heuristic, not a semantic machine-learning model. It may favor action, camera movement, transitions, or scene changes, and it cannot reliably understand narrative meaning, speech, jokes, or whether a moment is important. A future version could optionally use an on-device ML model, which would require downloading model weights and more memory/processing power, but still would not require an API key if the model runs fully locally.

Direct video URLs still need to permit browser CORS access. YouTube, Instagram, and TikTok watch-page URLs are not direct media URLs for this feature.
