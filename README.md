# Frequent Flyer Portal

A responsive frontend demo for an airline frequent flyer member directory. It is built with React and Vite and focuses on member record management, clear feedback, accessibility, and resilient browser-side storage.

## Features

- Overview dashboard with member, active-member, tier, and points summaries.
- Member directory with search, tier/status filters, sorting, details, create, edit, delete, and CSV export.
- Form validation for required name, email, phone, points, and duplicate email addresses.
- Input sanitization with DOMPurify before values are stored.
- Safe React text rendering; no `dangerouslySetInnerHTML` is used.
- Empty-state messaging when no records match.
- Loading feedback for asynchronous save operations.
- Online/offline status indicator and local-first behavior for unreliable connectivity.
- Defensive localStorage parsing and save-error handling.
- Keyboard focus indicators, semantic labels, ARIA status/dialog attributes, and reduced-motion support.
- Simulated analytics console message on primary actions.


## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Demo data and persistence

The first run loads sample member records. Changes are saved in this browser's `localStorage` under `ffp-members-v1`. Use the browser's site storage controls to reset the demo data.

This is a frontend-only capstone demo. It does **not** connect to a real airline backend, database, authentication provider, flight booking system, or loyalty-points ledger. Do not enter real customer personal information. A production system needs server-side authentication/authorization, API validation and sanitization, audit logging, encrypted transport, database constraints, backups, and role-based access control.

## Edge-case behavior

- Empty search/filter results show a "No data found" state.
- Invalid form values block submission and show field-level errors.
- Duplicate email addresses are rejected.
- Slow saves show a loading state and disable repeated submission.
- Offline state is visible; local browser records remain usable and changes are saved locally.
- Corrupt or unavailable localStorage falls back to seed data or displays a save error instead of crashing.
- Unexpected values are normalized/validated before persistence.
- Reduced-motion preference is respected.

## Security notes

DOMPurify is used to strip markup from user-entered text, and all member data is rendered as ordinary React text. This is not a substitute for backend validation. If an API is added, validate and sanitize on the server too, use parameterized database queries, enforce authorization on every operation, and avoid trusting client-provided points or member IDs.

## Project structure

```text
src/
  data/seedMembers.js
  utils/sanitize.js
  utils/storage.js
  utils/validation.js
  App.jsx
  main.jsx
  styles.css
```
