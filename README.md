# GreySlate Architecture

Architecture portfolio, project journal, and protected studio editor. The app runs on Cloudflare Workers with Vinext, stores project records in D1, and stores editor uploads in R2.

## Architecture

- **Runtime:** Cloudflare Workers
- **Database:** D1, bound as `DB`
- **Image storage:** R2, bound as `BUCKET`
- **Editor identity:** Cloudflare Access
- **Source and CI:** GitHub Actions
- **Domain and TLS:** Cloudflare custom domain

The public portfolio remains open. Cloudflare Access must protect `/studio-editor*` and `/api/editor*`. The Worker reads the authenticated Access identity and allows edits only when it matches the `GREYSLATE_EDITOR_EMAIL` secret.

## Local development

Requires Node.js 22.13 or later.

```sh
npm ci
cp .dev.vars.example .dev.vars
npm run db:migrate:local
npm run dev
```

Open the URL printed by Vinext. The ignored `.dev.vars` file supplies a localhost-only editor identity. Production never uses this local override.

Run the complete verification suite with:

```sh
npm run check
```

## First Cloudflare deployment

Authenticate and create the production resources in the client-owned Cloudflare account:

```sh
npx wrangler login
npx wrangler d1 create greyslate-production
npx wrangler r2 bucket create greyslate-images
```

Copy the D1 UUID returned by Cloudflare into `wrangler.json`, replacing the all-zero `database_id`. The R2 bucket name already matches the command above.

Apply the schema and deploy:

```sh
npm run db:migrate:remote
npm run deploy
npx wrangler secret put GREYSLATE_EDITOR_EMAIL
```

Enter the approved editor email when prompted. Secrets and `.dev.vars` must never be committed.

Then complete the dashboard steps in [Cloudflare handover](docs/CLOUDFLARE-HANDOVER.md): attach the custom domain, protect the editor paths with Access, disable unprotected alternate hostnames, and configure GitHub deployment credentials.

## Routine deployment

For a local authenticated release:

```sh
npm run check
npm run db:migrate:remote
npm run deploy
```

For GitHub deployment, run the **Deploy to Cloudflare** workflow after adding its two repository secrets. The workflow is manual by design so a source push cannot publish until the client account is fully configured.

## Content management

Open `/studio-editor` on the production domain and authenticate through Cloudflare Access. The editor can:

- create drafts and publish projects;
- upload and credit project photographs;
- add dated construction updates;
- choose the featured homepage project;
- update the studio location and inquiry email; and
- hide the illustrative sample projects.

Project records live in D1 and uploaded photographs live in R2. They are runtime data and are not included in Git commits.

Brand assets and fixed homepage copy remain in source:

- `public/images/greyslate-logo.png`
- `components/brand.tsx`
- `app/page.tsx`

See [launch content](docs/LAUNCH-CONTENT.md), [project vocabulary](docs/CONTEXT.md), and [Cloudflare handover](docs/CLOUDFLARE-HANDOVER.md).
