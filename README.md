# Avri Energy

Website, API and admin panel for an electrical EPC and renewable energy company.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Express 5 · MySQL 8 · Drizzle

```
client/   the public website          :3000
server/   REST API, MySQL, uploads    :4000
admin/    login + dashboard           :3001
brochure/ company profile PDF build   (standalone scripts, no deps)
```

Three npm workspaces, one lockfile. `client/` and `admin/` share most of their
dependencies, so a single install keeps `next` from drifting between them.

## Getting started

```bash
npm install                       # once, at the root

# Create the database and a user for it (needs MySQL admin rights):
#   CREATE DATABASE avri_energy CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
#   CREATE USER 'avri'@'127.0.0.1' IDENTIFIED BY '…';
#   GRANT ALL PRIVILEGES ON avri_energy.* TO 'avri'@'127.0.0.1';

cp client/.env.example client/.env
cp server/.env.example server/.env    # fill in DB_PASSWORD and JWT_SECRET
cp admin/.env.example  admin/.env

npm run db:migrate                # create the tables
npm run db:seed                   # the five blog categories
npm run admin:create              # your first admin login (prompts, no echo)

npm run dev                       # all three, in one terminal
```

| Command | What it does |
| --- | --- |
| `npm run dev` | client :3000, admin :3001, API :4000 |
| `npm run build` | builds all three |
| `npm run typecheck` | `tsc --noEmit` in each workspace |
| `npm run lint` | eslint where configured |
| `npm run db:check` | is MySQL reachable, are the tables there |
| `npm run db:generate` | regenerate migration SQL after editing the schema |
| `npm run db:migrate` / `db:seed` / `db:studio` | apply, seed, browse |
| `npm run admin:create` | add an admin user |

## Where content lives

There are two kinds of content, and the boundary is deliberate:

**In the code**, deployed with it — services, industries, projects, the product
catalogue, gallery, certifications, testimonials, FAQs, careers copy. These
change once or twice a year and belong in a diff someone can review. Edit
`client/lib/site.ts` (and `client/lib/products.ts` for the catalogue).

**In the database**, edited in the admin panel — clients, blog articles, job
openings, and the two kinds of inbound message. These change on a business
cadence and should never need a developer.

Moving something from the first list to the second means a table, an API, an
admin screen and a form. Worth it for a job opening; not worth it for the list
of services.

## The admin panel

Served at `/admin` on the same domain as the site, which is what keeps the
session cookie first-party and the auth simple.

| Screen | What it does |
| --- | --- |
| Overview | Counts, latest enquiries and applications, failed-email warnings |
| Enquiries | Contact and quote submissions, status, internal notes |
| Applications | Applicants per role, status, **CV download**, notes |
| Jobs | Post, edit, open and close roles |
| Blog posts | Write, edit, publish, schedule, feature |
| Clients | Add clients, upload logos, authorise and publish |

### Clients need permission, not just a checkbox

A client logo is that company's trademark. Publishing one without written
consent is a real legal exposure, so the model makes it hard to do by accident:

- `is_authorized` defaults to false, and turning it on requires a note saying
  **how** permission was given, plus who ticked it and when;
- withdrawing authorisation also unpublishes;
- publishing an unauthorised client is refused by the admin UI, by the API, and
  by a `CHECK` constraint in MySQL — so it fails even from a SQL console.

The flag is only as good as the person ticking it. It exists to make the
question unavoidable, not to answer it.

## Forms and email

Contact, quote and job applications all follow the same rule: **the database
write decides the response, and email happens afterwards.**

So if SMTP is down, the visitor still gets "we have your enquiry" — which is
true, the row exists — the record is still in the admin panel, and the message
is retried. Delivery state lives on the row (`email_status`), failures are
badged in the dashboard, and there is a Resend button.

Nothing is ever lost because a mail server had a bad afternoon. This is the
main reason submissions are stored *as well as* emailed.

Email goes out over Gmail SMTP. Two things to know:

- it needs 2-Step Verification and a 16-character **App Password**, not the
  account password;
- **use a Workspace mailbox on `avrienergy.com`**, not a personal `@gmail.com`.
  Gmail rewrites the `From` header to whatever account authenticated, so a
  personal address means notifications appear to come from that person and
  SPF/DKIM will not align with the domain — a fast route to the spam folder.

Set `MAIL_ENABLED=false` in development. Submissions are then stored and marked
`skipped` rather than failing.

## Résumés are personal data

Treat `server/storage/resumes/` accordingly.

- Résumés are **never** under a static mount. `storage/resumes` is a *sibling*
  of `storage/public`, not a child, so no `express.static` can reach them. The
  only way to read one is an authenticated download route.
- Uploads are checked three ways: extension, MIME type, and the file's actual
  leading bytes (`%PDF-`, `PK\x03\x04`, `\xD0\xCF\x11\xE0`). The last one is
  what catches `payload.exe` renamed to `resume.pdf`, which passes the others.
- Filenames on disk are generated UUIDs. The applicant's filename is stored in
  the database and only ever reappears, sanitised, in a `Content-Disposition`
  header.
- Deleting an application deletes the file too.

**Set `STORAGE_ROOT` outside the deployed code in production** — something like
`/var/lib/avri/storage`. If it sits inside the deploy directory, a rebuild or a
fresh clone orphans every résumé ever submitted.

**Back it up.** The files exist in exactly one place. A nightly `mysqldump`
plus an off-box copy of `storage/` should be in place before launch, not after
the first disk failure.

Under India's DPDP Act this is personal data with a purpose and a retention
period. Decide how long rejected applications are kept, and say so in the
privacy policy.

## Deployment

The public site is **Node-rendered**, not a static export. That changed when
the blog and careers sections were added: under `output: "export"` a crawler
receives an empty shell and the article text only appears once JavaScript runs
— the wrong trade for the two sections whose entire purpose is to rank.

So this needs a Node host. Plain static hosting will not serve it.

Recommended shape, behind one reverse proxy on `avrienergy.com`:

```
/          → client  :3000    Next.js
/admin     → admin   :3001    Next.js (basePath: "/admin")
/api       → server  :4000    Express
/uploads   → server  :4000    logos and covers (résumés are NOT here)
```

Keeping all three on one origin is what makes the session cookie first-party,
removes CORS from the browser path, and keeps the API origin out of the page
source. If the API ever moves to a different registrable domain, the cookie
design needs revisiting.

Checklist before going live:

- [ ] `JWT_SECRET` — fresh, at least 32 bytes (`openssl rand -base64 48`)
- [ ] `STORAGE_ROOT` outside the deploy directory
- [ ] `TRUST_PROXY=1` behind nginx, or rate limiting sees one IP for everyone
- [ ] `CORS_ORIGINS` set to the real domains
- [ ] Gmail App Password on a Workspace mailbox
- [ ] `REVALIDATE_SECRET` matching in `client/.env` and `server/.env`
- [ ] HTTPS everywhere; the admin panel must not be reachable over HTTP
- [ ] Nightly `mysqldump` + off-box copy of `storage/`
- [ ] `SEED_ADMIN_*` removed from `.env` after the first login

## Configuration

Every value is documented in the three `.env.example` files. Nothing about the
company is hardcoded.

`NEXT_PUBLIC_*` values are inlined at **build time** — restart the dev server
or rebuild after changing them. And they must be written as literal member
expressions (`process.env.NEXT_PUBLIC_FOO`); Next substitutes them as text, so
`process.env[key]` resolves to `undefined` in the browser.

`server/.env` holds real secrets: the database password, the JWT signing key,
the SMTP credentials. `admin/.env` holds none, by design — the session is an
httpOnly cookie set by the API, so the admin app never handles a token.

## Brand

| Token | Value |
| --- | --- |
| Primary green | `#1E7F3F` → `brand-500` |
| Orange accent | `#F57C00` → `accent-500` |
| Typography | near-black `ink-900` on white |

Defined as Tailwind v4 theme tokens in `client/app/globals.css`. The admin
panel copies the palette but not the components — marketing cards and scroll
animations are wrong for tables somebody reads for an hour.

## Still placeholder

Before launch, replace:

- headline statistics (`stats` in `client/lib/site.ts`) — currently invented
- project details and testimonials
- certification codes and validity
- both legal documents — templates, and they need a lawyer's review
