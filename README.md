# GreySlate Architecture

An architecture portfolio, project journal, and private studio editor. The website runs on Vinext and Cloudflare Workers, with D1 for project records and R2 for editor uploads.

## Run locally

Use Node.js 22.13 or later. Run these commands from this repository, not the enclosing workspace:

```sh
npm run install:ci
npm run typecheck
npm test
npm run build
```

For the first local run, initialize D1 using the configuration produced by the build:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_high_blacklash.sql
npm run dev
```

Open the local URL printed by the dev server. To try the editor locally, copy `.dev.vars.example` to `.dev.vars` before starting the dev server, then open `/studio-editor` and use the local mock sign-in. Do not use that mock account for hosting. Keep real environment values out of Git.

## Edit content

- **Portfolio:** Sign in at `/studio-editor` with the authorized editor account. Save a draft with a title and slug, then add project details, approved photos, and dated progress before publishing.
- **Homepage image:** Use **Feature on homepage** on the project whose cover should lead the portfolio.
- **Studio settings:** Set the public inquiry email and studio location. Disable illustrative projects after publishing the real portfolio. The inquiry form opens an email draft; it does not send or store messages.
- **Brand and copy:** The approved wordmark is at `public/images/greyslate-logo.png`. The header and footer use `components/brand.tsx`; the homepage copy is in `app/page.tsx`.

See the [launch checklist](docs/LAUNCH-CONTENT.md) for the remaining content and [project glossary](docs/CONTEXT.md) for terminology.

## GitHub and hosting

Create a private GitHub repository and use it for source control and pull requests. This repository already has Git history; do not initialize a second repository around it. The GitHub Actions workflow checks types, runs tests, and builds on pushes to `main` and on pull requests. It does not deploy or require hosting credentials.

The live site is hosted separately on ChatGPT Sites. Its identity and D1/R2 bindings are tracked in `.openai/hosting.json`; the hosted editor account is configured through the `GREYSLATE_EDITOR_EMAIL` runtime setting. GitHub Pages cannot run this app's editor or server routes. Editor-created project records and uploaded images are hosted data and are not backed up by a Git push.

Production migrations are managed through the Sites deployment workflow. For any schema change, generate a new migration with `npm run db:generate` and commit the SQL and Drizzle metadata. Keep applied migrations unchanged.
