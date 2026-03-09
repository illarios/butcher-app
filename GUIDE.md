# Κρεοπωλείο Μάρκος — App Guide

A Greek butcher shop e-commerce app built with Next.js 14, Supabase, and Tailwind CSS.

---

## Table of Contents

1. [How the App Works](#how-the-app-works)
2. [Creating a Customer Account](#creating-a-customer-account)
3. [Creating an Admin Account](#creating-an-admin-account)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Running the App Locally](#running-the-app-locally)
6. [Pages & Routes](#pages--routes)
7. [Admin Panel Features](#admin-panel-features)
8. [Database Setup](#database-setup)

---

## How the App Works

The app is a full e-commerce shop for a Greek butcher. Customers can browse products, add them to a cart, place orders for pickup or delivery, and earn loyalty points. The owner manages everything from an admin panel.

**Key flows:**

1. **Customer** → browses products → adds to cart → checks out → gets email confirmation → tracks order
2. **Admin** → receives push notification → moves order through statuses on a Kanban board → customer gets notified at each step

**Tech stack:**
- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (database + auth + real-time + storage)
- **Email**: Resend
- **Push notifications**: Web Push API (VAPID)
- **State**: Zustand (cart lives in localStorage)

---

## Creating a Customer Account

### Via the UI (normal sign up)

1. Go to `/register`
2. Fill in: full name, phone, email, password
3. Submit — a profile is created automatically in the database
4. You receive 50 welcome loyalty points
5. Log in at `/login`

### Via Supabase Dashboard (manual)

1. Go to your Supabase project → **Authentication → Users**
2. Click **"Add user"**
3. Enter email + password, confirm email if needed
4. A profile row is auto-created in the `profiles` table via a database trigger

---

## Creating an Admin Account

There is no admin sign-up page. To make someone an admin:

### Step 1 — Create a regular account

Create the account via `/register` or through the Supabase Authentication dashboard as described above.

### Step 2 — Promote to admin via SQL

Go to your Supabase project → **SQL Editor** and run:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = '<user-uuid>';
```

To find the user's UUID:

```sql
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';
```

Or look it up in **Authentication → Users** in the Supabase dashboard.

### Step 3 — Log in and go to /admin

The admin panel is at `/admin`. The layout checks that the logged-in user has `role = 'admin'` in the `profiles` table. If not, it redirects to `/login`.

> **Note:** There is no role UI inside the app. Role changes must be done directly in the database.

---

## Environment Variables Setup

Create a `.env.local` file in the project root with the following:

```env
# Supabase (get from Supabase project → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email — Resend (https://resend.com)
RESEND_API_KEY=re_your_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Web Push (generate VAPID keys with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-vapid-key
VAPID_PRIVATE_KEY=your-private-vapid-key
VAPID_EMAIL=mailto:you@yourdomain.com

# Admin email for order alert emails
ADMIN_EMAIL=admin@yourdomain.com
```

To generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

---

## Running the App Locally

```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app runs at `http://localhost:3000`.
The admin panel is at `http://localhost:3000/admin`.

> **Note:** PWA service worker is disabled in development. To test PWA features, run a production build.

---

## Pages & Routes

### Shop (public)

| Route | Description |
|-------|-------------|
| `/` | Home page — hero, categories, featured products, recipes |
| `/products` | Product catalog with filters |
| `/products/[slug]` | Product detail page — weight selector, add to cart |
| `/recipes` | Recipe listing |
| `/recipes/[slug]` | Recipe detail with steps and linked products |
| `/checkout` | Checkout — pickup or delivery, loyalty points |
| `/checkout/success` | Order confirmation |
| `/offline` | Shown when app is offline (PWA) |

### Account (requires login)

| Route | Description |
|-------|-------------|
| `/account/orders` | Order history |
| `/account/orders/[id]` | Order detail |
| `/account/profile` | Edit name, phone, address |
| `/account/loyalty` | Points balance and history |

### Auth

| Route | Description |
|-------|-------------|
| `/login` | Log in |
| `/register` | Sign up |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Set new password (via email link) |

### Admin (requires `role = 'admin'`)

| Route | Description |
|-------|-------------|
| `/admin/orders` | Kanban board — manage all orders |
| `/admin/products` | Create, edit, delete products |
| `/admin/inventory` | Update stock levels (grams) |
| `/admin/delivery-zones` | Manage delivery areas and fees |
| `/admin/customers` | View customers, adjust loyalty points |
| `/admin/analytics` | Revenue and order metrics |

---

## Admin Panel Features

### Orders Kanban (`/admin/orders`)

- Shows all orders from the last 7 days
- 6 columns: **Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered**
- Drag a card or click to open order details and update status
- When you change status, the customer is notified (push + in-app notification)

### Products (`/admin/products`)

- Add/edit/delete products
- Set price per kg, weight options (min/max/step), category, images, featured status
- Add "cuts" (e.g. bone-in, boneless) with extra pricing per kg

### Inventory (`/admin/inventory`)

- Set current stock in grams for each product
- Products show as out-of-stock when `stock_grams = 0`

### Delivery Zones (`/admin/delivery-zones`)

- Create zones with postal codes, delivery fee, and minimum order amount
- Enable or disable zones at any time

### Customers (`/admin/customers`)

- View all registered customers
- Manually add or remove loyalty points

---

## Database Setup

Migrations are in `supabase/migrations/`. Run them in order against your Supabase project.

### Via Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

### Manually via SQL Editor

Copy and run each file in order:

| File | What it does |
|------|-------------|
| `001_initial_schema.sql` | All tables, RLS policies, order number generator |
| `002_profile_trigger.sql` | Auto-create profile on signup |
| `003_recipe_columns.sql` | Recipe ingredients/steps as JSONB |
| `004_profile_birthday.sql` | Birthday field on profiles |
| `005_admin_role.sql` | `role` column + `is_admin()` function + admin RLS |
| `006_notifications.sql` | In-app notifications with realtime |
| `007_indexes.sql` | Performance indexes |
| `008_product_images.sql` | Product image handling |
| `009_push_subscriptions.sql` | Web push subscriptions table |

### Important: Enable Realtime on notifications table

In Supabase → **Database → Replication**, enable realtime for the `notifications` table so customers see live order updates.

---

## Loyalty Points

- Customers earn **1 point per €1 spent**
- **100 points = €1 discount** at checkout
- Welcome bonus: **50 points** on registration
- Tiers are tracked in the `loyalty_tier` column of `profiles` (bronze / silver / gold)
- Admin can manually adjust points from `/admin/customers`

---

## Image Conventions

Local product images are stored in `public/images/products/` and mapped by product slug in:

- `lib/localImages.ts` — maps product slugs to image paths (used in catalog, product detail, cart, recipes)
- `lib/recipeImages.ts` — maps recipe slugs to image paths (used in recipe pages and homepage)

To add a new image for a product, upload the file to `public/images/products/` and add the slug → path entry to `lib/localImages.ts`.
