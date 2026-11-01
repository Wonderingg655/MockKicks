# Mock•Kicks

A mock sneaker store built with Next.js — no backend, no database, no payment
provider. Products are hardcoded, and users, carts, and orders are stored in the
browser's `localStorage`. It is designed to be deployed to Vercel as-is.

## Demo accounts

| Role     | Username | Password   |
| -------- | -------- | ---------- |
| Admin    | `admin`  | `admin123` |
| Customer | `demo`   | `demo123`  |

You can also create a new account from `/register`.

## Features

- Product catalogue with search and category filter
- Cart, checkout, and order history (persisted per browser)
- Admin dashboard at `/admin` for users, items, and orders
- Everything runs client-side; there are no API routes or server secrets

> All data lives in `localStorage`, so it is per-browser and per-device. Clearing
> site data resets the store back to the seeded products and demo users.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

1. Push this folder (the `e-mock` repository) to GitHub/GitLab/Bitbucket.
2. Import the repository at <https://vercel.com/new>.
3. Keep the default framework preset (**Next.js**) and click **Deploy**.

No environment variables or build settings are required.

## Structure

```
app/
  page.tsx            home + product grid
  login/ register/    authentication
  cart/               shopping cart
  checkout/           shipping form + mock order placement
  orders/             order history and detail
  admin/              admin dashboard
  context/            auth and cart providers
lib/
  store.ts            hardcoded products + localStorage persistence
public/               static images
```
