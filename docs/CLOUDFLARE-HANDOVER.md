# Cloudflare Production Handover

Use a Cloudflare account owned by the client. Give the developer temporary access rather than making a personal account the permanent owner.

## 1. Provision resources

From the repository root:

```sh
npm ci
npx wrangler login
npx wrangler d1 create greyslate-production
npx wrangler r2 bucket create greyslate-images
```

Replace the all-zero D1 `database_id` in `wrangler.json` with the returned UUID. Do not rename the `DB` or `BUCKET` bindings without updating the application.

## 2. Initialize and deploy

```sh
npm run check
npm run db:migrate:remote
npm run deploy
npx wrangler secret put GREYSLATE_EDITOR_EMAIL
```

Set the secret to the exact email address that should manage the portfolio. Test the temporary `workers.dev` deployment before connecting the domain.

## 3. Connect the domain

In **Workers & Pages > greyslate-architecture > Settings > Domains & Routes**, add the client's apex domain or preferred `www` hostname. Follow the DNS records Cloudflare supplies and choose one canonical hostname. Redirect the other hostname to it.

Cloudflare provisions TLS automatically after DNS validation. Do not cancel the previous hosting until the custom domain, editor, images, and contact link have been tested.

## 4. Protect the editor

Enable Cloudflare Zero Trust, then create a self-hosted Access application for the production hostname. Protect both path groups:

```text
example.com/studio-editor*
example.com/api/editor*
```

Create an **Allow** policy for the exact editor email. One-time PIN is sufficient for a single editor; an existing Google or Microsoft identity provider can also be used.

The public homepage, project pages, `/media/*`, and static assets must remain outside Access. After the custom domain is working, disable the public `workers.dev` route or protect matching editor paths there too. Otherwise that alternate hostname could bypass the custom-domain Access policy.

The application also compares the Access identity with `GREYSLATE_EDITOR_EMAIL`. Both controls must agree.

## 5. Configure GitHub deployment

Create a scoped Cloudflare API token that can deploy Workers and update the GreySlate D1 database and R2 bucket. Add these GitHub repository secrets:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

In GitHub, open **Actions > Deploy to Cloudflare > Run workflow**. The workflow checks the source, applies unapplied D1 migrations, builds, and deploys. Keep the production environment protected with required reviewers if the repository has multiple collaborators.

## 6. Acceptance checks

- Apex and `www` behavior is intentional and HTTPS is valid.
- Homepage, filters, project pages, gallery and contact link work on mobile and desktop.
- `/studio-editor` requires Access authentication.
- An unapproved email cannot enter the editor.
- The approved editor can create a draft, upload an image, publish, unpublish and edit studio settings.
- Uploaded images remain available after a new deployment.
- Search engines cannot index the editor page.
- The temporary Sites URL remains available until all real content has been verified on Cloudflare.

## 7. Operations and backup

Keep original project photographs outside the website in the client's own drive. Before schema changes or major content work, export D1:

```sh
npx wrangler d1 export DB --remote --output greyslate-d1-backup.sql
```

Store backups outside the Git repository because they can contain client content. Review Worker, D1 and R2 usage monthly in the Cloudflare dashboard. At the expected traffic level, the project should remain inside the free allowances; the Workers Paid plan is the fallback if request CPU limits are reached.
