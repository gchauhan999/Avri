# Avri Energy

Website, API and admin panel for an electrical EPC and renewable energy company.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Laravel 12 ·
Filament 5 · MySQL 8

```
client/   the public website                    :3000   Next.js
backend/  the admin panel and the public API    :8000   Laravel
brochure/ company profile PDF build             (standalone scripts, no deps)
```

Two applications, and the split is along a real seam: `client/` renders pages
for visitors, `backend/` owns the data and everyone who edits it. They meet at
one narrow public API — a dozen endpoints — and at `/uploads`, which the website
proxies through so images stay same-origin.

There is no admin API. The panel is Filament, which renders on the Laravel
server and talks to the database directly, so the admin surface is not reachable
from a browser at all.

## Getting started

You need PHP 8.2+ with Composer, Node 20.19+, and MySQL 8.

```bash
# The database (needs MySQL admin rights):
#   CREATE DATABASE avri_energy CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

npm install                                  # the website's dependencies
composer install -d backend                  # the backend's

cp client/.env.example client/.env
cp backend/.env.example backend/.env         # fill in the database credentials
php backend/artisan key:generate

php backend/artisan migrate                  # the seven tables
php backend/artisan db:seed                  # the five blog categories
php backend/artisan storage:link             # so uploaded images are served
php backend/artisan avri:make-admin          # your first login

npm run dev                                  # website :3000, backend :8000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | the website on :3000 and the backend on :8000 |
| `npm run queue` | the queue worker — nothing is emailed without it |
| `npm run build` | builds the website |
| `npm run typecheck` | `tsc --noEmit` in the website |
| `npm run test:backend` | the backend's test suite |
| `php backend/artisan migrate` | apply migrations |
| `php backend/artisan avri:make-admin` | add an admin user |

The admin panel is at **http://localhost:8000/admin**.

### The queue is not optional

Enquiry and application notifications are queued, so the visitor is never left
waiting on SMTP. Nothing is sent until a worker runs — in development that means
`npm run queue` in a second terminal; in production, a supervisor process or a
`queue:work` cron.

## Backend layout

`backend/` is a standard Laravel application; the only parts worth pointing at
are the ones that are not standard:

```
backend/
  app/
    Filament/Resources/      the admin panel — one folder per thing you edit
    Models/                  the seven tables, and the rules that guard them
    Http/Controllers/Api/    the public API the website reads
    Http/Requests/           validation, worded to match the website's own
    Services/                images, résumé checks, sanitising, cache pings
    Jobs/                    queued notifications
    Mail/                    what the team and the applicant receive
  database/migrations/       the schema
  storage/app/uploads/       logos and covers — symlinked to public/uploads
  storage/app/resumes/       CVs — deliberately not symlinked anywhere
```

Three conventions differ from a fresh Laravel install, each for a reason:

**Admins are `admin_users`, not `users`.** The table predates this application
and the API shares it. `config/auth.php` points at `App\Models\AdminUser`, whose
hash column is `password_hash`; there is no `users` table at all, so nobody can
authenticate against the wrong one.

**The queue table is `queue_jobs`.** `jobs` already means job openings here. The
default would have Laravel writing queue payloads into the careers table.

**Business rules live on the models, not in the panel.** The client
authorisation gate, article sanitising, one-featured-post, publish stamping —
all in `booted()` hooks. A rule that only runs when one particular page is used
is not a rule; sanitising in particular is a security control and has to hold
for a seeder or an import too.

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

Filament, served at `/admin` by the Laravel application. It renders on the
server and reads the database directly, so there is no admin API to secure and
nothing for a browser to call behind your back.

| Screen | What it does |
| --- | --- |
| Enquiries | Contact and quote submissions, status, internal notes |
| Applications | Applicants per role, status, **CV download**, notes |
| Jobs | Post, edit, open and close roles |
| Articles | Write, edit, publish, schedule, feature |
| Clients | Add clients, upload logos, authorise and publish |
| Admin users | Accounts and roles — super admins only |

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

Set `MAIL_MAILER=log` in development. Messages are then written to
`backend/storage/logs` instead of being sent, and the row records what happened
either way.

## Résumés are personal data

Treat `backend/storage/app/resumes/` accordingly.

- Résumés are **never** reachable from the web. They live on a private disk
  with no symlink into `public/`, unlike `storage/app/uploads`, which is
  symlinked so images can be served. The
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

So this needs a Node host for the website and a PHP host for the backend.
Plain static hosting will not serve either.

Recommended shape, behind one reverse proxy on `avrienergy.com`:

```
/          → client   :3000   Next.js
/admin     → backend  :8000   Laravel + Filament
/api       → backend  :8000   the public API
/uploads   → backend  :8000   logos and covers (résumés are NOT here)
```

Keeping both on one origin is what makes the session cookie first-party,
removes CORS from the browser path, and keeps the backend's origin out of the
page source.

Checklist before going live:

- [ ] `APP_KEY` generated, `APP_DEBUG=false`, `APP_ENV=production`
- [ ] `storage/` on a volume that survives a deploy, and `storage:link` run
- [ ] Trusted proxies configured behind nginx, or rate limiting sees one IP
      for every visitor
- [ ] `CORS_ORIGINS` set to the real domains
- [ ] Gmail App Password on a Workspace mailbox
- [ ] `REVALIDATE_SECRET` matching in `client/.env` and `backend/.env`
- [ ] A queue worker running under supervisor — without one, nothing is emailed
- [ ] HTTPS everywhere; the admin panel must not be reachable over HTTP
- [ ] Nightly `mysqldump` + off-box copy of `backend/storage/app/`

## Configuration

Every value is documented in the two `.env.example` files. Nothing about the
company is hardcoded.

`NEXT_PUBLIC_*` values are inlined at **build time** — restart the dev server
or rebuild after changing them. And they must be written as literal member
expressions (`process.env.NEXT_PUBLIC_FOO`); Next substitutes them as text, so
`process.env[key]` resolves to `undefined` in the browser.

`backend/.env` holds every real secret: the application key, the database
password, the SMTP credentials. `client/.env` holds none that matter — the
website never authenticates anyone.

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
