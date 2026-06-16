# Dicezzle Analytics Plan

Dicezzle includes a small analytics wrapper in `assets/js/site.js`. It does not include an analytics provider, analytics ID, secret, tracking pixel, login, or personal information collection by default.

## Goals

- Understand basic game health without collecting personal information.
- Keep analytics optional and easy to disable.
- Avoid dark patterns, aggressive funnels, or manipulative retention loops.

## Wrapper

The global wrapper is:

```js
window.DicezzleAnalytics.track(eventName, detail)
```

The wrapper only accepts a fixed allowlist and dispatches a local `dicezzle:analytics` browser event. A future provider can attach `window.dicezzleAnalyticsProvider(payload)` outside source control or through deployment configuration.

## Event allowlist

- `game_start`
- `dice_place`
- `merge_complete`
- `star_created`
- `star_clear`
- `game_over`
- `share_click`
- `copy_result`
- `restart_click`
- `tutorial_dismiss`

## Privacy rules

- Do not collect names, emails, account IDs, IP addresses in custom payloads, device fingerprints, or exact user-entered text.
- Do not add analytics IDs directly to source files.
- Do not use analytics to create pressure loops, forced ads, login gates, streak pressure, coins, gems, or gacha.
- Keep payloads coarse: mode, score band, rank, die value, or chain count is acceptable.

## Future provider checklist

- Add provider through environment/configuration, not committed secrets.
- Document provider, data retention, and opt-out behavior before launch.
- Update `content/privacy.md` before enabling production analytics.
