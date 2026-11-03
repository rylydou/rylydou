# rylydou

Ryly's GitHub profile. `README.md` is hand-written; every image in it is an SVG drawn on request by a small Bun server (`src/`), hosted at `https://profile.ryly.dev`.

## Commands

- `bun run dev`: server at http://localhost:3000, reloads on save. Add `?now=2026-01-01T02:00-06:00` to `/turtlefetch.svg` to preview another time.
- `bun run check`: type-check.
- `bun run deploy`: copy the code to the homelab and rebuild the container. `bun run logs` follows its logs. Both read `DEPLOY_HOST` and `DEPLOY_DIR` from `.env` (see `.env.example`).

## Layout

- `src/data.ts`: everything the images say (turtlefetch lines, games, projects, mentions, links).
- `src/render.ts`: one function per image, returning an SVG string.
- `src/server.ts`: one route per image. `src/live.ts`: GitHub stats (cached an hour) and the clock.
- `src/svg.ts`: text as glyph outlines, embedded AVIF images. `src/sprites.ts`: pixel art drawn in code.
- `src/images/{games,projects}/<id>.avif`: card images.

## Rules

- GitHub shows the SVGs through `<img>`, so they can't load fonts, files, or scripts. Text becomes paths and images become data URIs; CSS animations are fine.
- Adding or reordering cards means editing both `src/data.ts` and `README.md`. Deploy before pushing a README that points at new images.
- Don't invent stats, placements, or claims for cards. Use what itch.io, GitHub, or Ryly confirms.
- This repo is public: no homelab hostnames, IPs, paths, or tokens. Those go in `.env`.
- Don't publish where Ryly lives or contact details.
- Tabs and semicolons. Prefer Bun APIs over Node ones.
