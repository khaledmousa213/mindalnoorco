# Mind Alnoor Co. — product catalog website

A public catalog for Mind Alnoor Co. (medical diagnostic imaging equipment) plus a
password-protected admin area for entering products.

- **Frontend:** React + Vite + Tailwind, deployed as a static site on **Cloudflare Pages**
- **Data / auth / files:** **Firebase** (Firestore, Authentication, Storage)
- **Quote-request emails:** a Cloudflare Pages Function using **Resend**

Products, categories, and quote requests all live in Firestore, so anything you add in
the admin area is immediately visible to visitors — no redeploy needed.

---

## 1. Firebase setup (existing project)

The site uses your existing Firebase project. In the [console](https://console.firebase.google.com):

1. **Build → Firestore Database** — create it if it doesn't exist yet (Native mode).
2. **Build → Authentication → Sign-in method** — enable **Email/Password**.
3. **Build → Storage** — enable it if it isn't already. Note the bucket name shown
   (it may be `<project>.appspot.com` or `<project>.firebasestorage.app`).
4. **Project settings → General → Your apps** — if there's no Web app (`</>`), add one,
   then copy its config values (used in step 2 below).
5. Create your admin login: **Authentication → Users → Add user** (email + password).
6. Copy that user's **UID**, then in **Firestore** add a collection `admins` with a
   document whose **ID is that UID** (any field, e.g. `role: "owner"`). Only UIDs listed
   here can write products.
7. Deploy the security rules and index from this repo:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use <your-project-id>
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
   > **If this Firebase project is already used by another app or website:**
   > `firestore.rules` and `storage.rules` in this repo are written for a project
   > dedicated to this site and will **replace** whatever rules the project has now.
   > Merge the `products` / `categories` / `quoteRequests` / `admins` and `products/**`
   > blocks into your existing rule files instead of deploying these as-is. The
   > `firestore:indexes` deploy only adds the one index and won't remove others.

## 2. Local development

```bash
npm install
cp .env.example .env.local     # then paste your Web app config (step 1.4) into the VITE_FIREBASE_* values
npm run dev                     # http://localhost:3000
```

`npm run lint` type-checks, `npm run build` produces `dist/`.

## 3. Seed the starter catalog (optional)

Loads 5 categories and 8 sample products so the site isn't empty.

1. **Firebase console → Project settings → Service accounts → Generate new private key.**
   Save it as `serviceAccountKey.json` in the project root (git-ignored).
2. `npm run seed`

The samples use stock photos and placeholder specs — edit or delete them in the admin area.

## 4. Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.**
   - Framework preset: **Vite** (or none)
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Settings → Environment variables → Production** — add every `VITE_FIREBASE_*` value.
4. For quote-request emails, also add (these stay server-side, no `VITE_` prefix):
   | Variable | Value |
   |---|---|
   | `RESEND_API_KEY` | API key from <https://resend.com> |
   | `QUOTE_NOTIFY_TO` | where leads should land, e.g. `sales@mindalnoor.com` |
   | `QUOTE_NOTIFY_FROM` | a verified Resend sender, e.g. `Mind Alnoor <site@mindalnoor.com>` |

   Without these, quote requests are still saved to the admin **Requests** tab — only the
   email notification is skipped. (Alternative on the Blaze plan: install Firebase's
   *Trigger Email from Firestore* extension and remove `functions/api/quote-notify.ts` +
   the `fetch('/api/quote-notify')` call in `src/lib/quotes.ts`.)

### Custom domain (mindalnoor.com)

The domain currently resolves via Firebase. To serve the site from Cloudflare Pages:

1. **Cloudflare Pages → your project → Custom domains → Set up a domain** → add
   `mindalnoor.com` and `www.mindalnoor.com`. Cloudflare shows the DNS records to use.
2. Point the domain's DNS at Cloudflare (either move the zone to Cloudflare, or add the
   CNAME/A records it gives you at your current DNS provider). Remove the old Firebase
   Hosting A records for the apex so they don't conflict.
3. In **Firebase → Authentication → Settings → Authorized domains**, add `mindalnoor.com`,
   `www.mindalnoor.com`, and your `*.pages.dev` preview domain — otherwise admin sign-in
   is blocked on those hosts.
4. In **Firebase → Storage → Rules** the bucket is already public-read; no CORS change is
   needed for `<img>`/`<a>` use. (If you later fetch files with JS, add a CORS entry for
   `https://mindalnoor.com`.)

The `public/_redirects` file already routes client-side URLs so deep links work.

## 5. Using the admin area

Go to `/admin/login` and sign in with the account from step 1.6.

- **Products** — add / edit / reorder / publish / feature. Upload photos and a PDF
  datasheet directly. A product only appears on the public site once **Published** is on.
- **Categories** — the groups used for the catalog filter and the header menu.
- **Requests** — every quote / contact submission, with new → contacted → closed status.

## Project layout

```
functions/api/quote-notify.ts   Cloudflare Pages Function (Resend email)
scripts/seed*.ts                 one-time Firestore seed
src/lib/                          Firebase wrappers (products, categories, quotes, auth, storage)
src/pages/                        public pages + src/pages/admin/*
src/components/                   Header, Footer, ProductCard, FilterBar, quote modal/form
firestore.rules / storage.rules   security rules
src/lib/company.ts                edit your phone / email / address here
```
