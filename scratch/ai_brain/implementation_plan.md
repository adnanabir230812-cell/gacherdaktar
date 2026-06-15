# Implementation Plan - Fixing Chat API Timeout and Creating Progress Log

We will fix the chatbot's timeout issues and ensure that it fallback-logs to Google Gemini API keys reliably. We will also introduce a persistent progress log file in the project directory to keep track of all developments so they never get lost.

## Proposed Changes

### Frontend Chat API

#### [MODIFY] [route.ts](file:///C:/Users/Lenovo/.gemini/antigravity/scratch/krishisathi/frontend/src/app/api/chat/route.ts)
- Increase the overall request time budget from `8500ms` to `9500ms` (since Vercel serverless timeout on Hobby tier is 10 seconds).
- Optimize individual API timeouts to maximize the chance of success:
  - MiMo API timeout: `3500ms` (instead of `3000ms`).
  - FreeLLM API timeout: `3000ms`.
  - Gemini Direct key timeout: `3000ms` (instead of `2500ms`).
- Fix the key skipping threshold: reduce `timeLimit < 2000` check to `timeLimit < 1000` before skipping keys, allowing Gemini keys to be tried even if less than 2 seconds remain.
- Ensure the key iteration loop does not abort prematurely on subsequent keys when time is tight.

### Project Documentation

#### [NEW] [progress_log.md](file:///C:/Users/Lenovo/.gemini/antigravity/scratch/krishisathi/progress_log.md)
- Create a persistent log file containing the history of recent changes, current status of features, and next steps.

## Verification Plan

### Automated Verification
- Run Node.js scripts to simulate chat requests and verify that the fallback chain runs correctly.
- Test that invalid API keys or timeouts gracefully trigger the next option in the chain instead of breaking early.

### Manual Verification
- Verify the chat response on the local Next.js dev server.
