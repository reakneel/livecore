# Changelog

## [0.1.0] — 2026-09-06

### Added

- Standalone Vite + React + TypeScript application shell
- TanStack Router SPA routing
- LiveCore Console UI with Demo and Bilibili modes
- Bilibili room discovery and live-state validation
- Bilibili WebSocket transport with authentication and heartbeat
- Nested packet, zlib and Brotli decoding
- Unified LiveEvent handling for chat and common live-room interactions
- Exponential-backoff + jitter reconnect
- Session isolation for room switching and stale async work
- Browser configuration persistence and responsive console layout
- Open Graph and favicon assets
- Vitest unit-test setup
- GitHub Actions CI for typecheck, tests and production build
- Vercel SPA fallback configuration

### Security / Runtime Boundaries

- No Bilibili account Cookie is embedded in the frontend.
- No model API key is exposed to the browser.
- AI reply generation safely degrades until an independent backend proxy is provided.
- Automatic outbound Bilibili actions are not enabled by default.

### Validation

The application commit `82861b16c07c2427f4d491a36394a677b6a6f19b` passed dependency installation, TypeScript typecheck, unit tests and production build in GitHub Actions. The documentation follow-up also triggered CI.

### Known limitations

- Browser access to Bilibili HTTP/WebSocket endpoints depends on deployment network and CORS policies.
- Deployments requiring a proxy should use an independent edge/backend service.
- AI backend integration, multi-room management and additional platforms are post-0.1.0 work.
