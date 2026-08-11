# Different Minds — Phase 1

## Get it live on the web (GitHub Pages)

This project is set up to auto-build and publish a live webpage every time
you push to GitHub — no ongoing cost, hosted free by GitHub.

**One-time setup:**

1. Create a new repository on GitHub (e.g. `different-minds`) — leave it empty,
   don't add a README/gitignore there.
2. In this project folder, run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/different-minds.git
   git push -u origin main
   ```
3. On GitHub, go to your repo → **Settings → Pages** → under "Build and
   deployment", set **Source** to **GitHub Actions**.
4. Go to the **Actions** tab in your repo — you should see "Deploy web build
   to GitHub Pages" running. Wait for it to finish (green tick).
5. Back in **Settings → Pages**, your live URL will be shown at the top —
   something like `https://YOUR-USERNAME.github.io/different-minds/`.

**After that:** every time you push new code to the `main` branch, the
webpage rebuilds and updates itself automatically within a minute or two —
nothing else to run.


A UK-focused app to help people find the fastest legitimate route to an ADHD
assessment (NHS Right to Choose vs private vs standard NHS), track
appointments, and generate the paperwork needed.

## What's built (Phase 1)

- **Home** — overview + quick links
- **Clinics** — directory of NHS Right to Choose and private ADHD assessment
  providers, searchable/sortable by your postcode
- **RTC Wizard** — a 3-step form that generates a ready-to-send Right to
  Choose referral letter for your GP
- **Appointments** — an on-device appointment tracker with a reminder
  notification the day before each appointment

## No paid APIs

Everything runs with **zero ongoing cost**:
- Clinic data is a local, hand-maintained dataset (`src/data/clinics.ts`) —
  update it by hand as provider info changes
- Postcode lookup uses **postcodes.io**, a free, open-data UK postcode API
  with no key and no usage limits
- Appointments and reminders are stored **entirely on-device**
  (AsyncStorage + local notifications) — no backend, no database, no
  hosting bill

## Running it

```bash
npm install
npm start
```

Then scan the QR code with the Expo Go app on your phone, or press `a` for
an Android emulator.

## Keeping the clinic data current

Provider waiting times and availability change often (some NHS ICBs pause
bookings with providers without much notice). For now, `src/data/clinics.ts`
is the single source of truth — update the entries by hand periodically.
A future phase could crowd-source updates from users, but that needs
moderation to keep it accurate and trustworthy.

## What's next (not built yet)

- Benefits/claims guidance (PIP, Access to Work, etc.)
- Email drafting (connect Gmail/Outlook, draft GP/employer/benefits emails
  for the user to review and send)
- Community group chat (needs a moderation plan before building — this is a
  vulnerable user base)
- Funding/hardship support — likely via a separate charity structure rather
  than the app holding money directly (see notes from planning conversation)
