# Mock•Kicks

A mock sneaker store built with Next.js, with **no backend**: no database, no
payment provider, and no environment variables. Products are hardcoded, and
users, carts, and orders are stored in the browser's `localStorage`. It is
designed to be deployed to Vercel as-is.

## Demo accounts

| Role     | Username | Password   |
| -------- | -------- | ---------- |
| Admin    | `admin`  | `admin123` |
| Customer | `demo`   | `demo123`  |

You can also create a new account from `/register`.

## Features

- Product catalogue with search and category filter
- Thai / English language toggle (TH / EN), persisted per browser
- Cart, checkout, and order history (persisted per browser)
- Admin dashboard at `/admin` for users, items, and orders
- Mock checkout — placing an order records it only, no card is charged

> All data lives in `localStorage`, so it is per-browser and per-device.
> Clearing site data resets the store back to the seeded products and demo
> accounts.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import it at <https://vercel.com/new>.
3. Keep the default framework preset (**Next.js**) and click **Deploy**.

No environment variables or build settings are required. If the repository
contains this folder as a subdirectory, set **Root Directory** to that folder.

## Structure

```
app/
  page.tsx            home + product grid
  login/ register/    authentication
  cart/               shopping cart
  checkout/           shipping form + mock order placement
  orders/             order history and detail
  admin/              admin dashboard
  context/            auth, cart, and language providers
components/
  Navbar.tsx Footer.tsx
lib/
  store.ts            hardcoded products + localStorage persistence
  translations.ts     TH / EN strings
public/               static images
```
