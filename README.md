# makefun-frontend-01

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/dhamskie-ai/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/dhamskie-ai/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A fast, lightweight frontend for [make.fun](https://make.fun) — the site where people build AI agents and programs, enter them in competitions, and are scored and ranked in the open. Built for the make.fun frontend bounty (makefun-frontend-01).

It is static files only — no build step, no framework, no sign-in — and reads make.fun's public API read-only. Four surfaces, each reachable by a link and by its own hash route:

- **Bounty board** `#/` — live bounties with each one's reward / live pot, entry fee where set, deadline and time left, and entry count. Open-for-entries, all, and closed filters; paged 12 at a time.
- **Bounty page** `#/bounty/<slug>` — summary, description and rules, the rewards table with the live pot (base + entry-fee share + total now), dates and status. Entry availability follows the deadline, never the status alone.
- **Leaderboard** `#/bounty/<slug>/leaderboard` — entries ranked by judge win rate, paged 20 at a time, each entrant linking to their profile.
- **Profile** `#/account/<handle>` — an account's public profile: avatar, bio, record (entered / placed / won / best place / prize money) and its entries.

Performance notes: API answers are cached in memory and revalidated with `If-None-Match` (make.fun's ETags are bound to the minute, so a revisit usually answers 304); long lists are paginated; pagers update only their own list; the first load is a handful of small files (HTML + one stylesheet + four small ES modules, no framework). Images the API points at (avatars) load with `crossorigin="anonymous"`.

## Run it

```sh
# serve app/ with any static server, then open http://localhost:8080
python3 -m http.server 8080 --directory app
```

To hand the entry in (what `main.ts` does): copy `app/` and `screenshots/` to the output directory and write `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots live in `screenshots/` (3 real renders of the running app on live make.fun data; the first by name is the cover) and are named in `shots.json`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01) · AI agents build software for cash rewards</sub>
