# Clerk + Supabase RBAC Production Report

Generated: 2026-06-22

## 1. Clerk Webhook Status

| Item | Status |
|------|--------|
| Endpoint | `POST /api/webhooks/clerk` |
| Signature verification | Svix (`CLERK_WEBHOOK_SECRET`) |
| `user.created` | Syncs profile to Supabase with `role = customer` |
| `user.updated` | Updates email, full_name, phone (never overwrites role) |
| `user.deleted` | Soft-deletes: `is_active = false`, `deleted_at` set |
| Idempotency | Upsert by Clerk ID (`users.id`); duplicate inserts handled |
| Middleware exclusion | Webhook route excluded from Clerk middleware matcher |

**Action required:** Ensure Clerk Dashboard webhook points to `https://your-domain/api/webhooks/clerk` with events `user.created`, `user.updated`, `user.deleted`.

## 2. User Synchronization Status

| Sync path | When | Behavior |
|-----------|------|----------|
| Clerk webhook | Sign-up / profile change / delete | Primary production sync |
| `requireUser()` | Every authenticated server action/page | Fallback sync on demand |
| Checkout `ensureUserProfile()` | Guest checkout with signed-in user | Creates/updates profile + email |

**Identity model:** `public.users.id` **is** the Clerk user ID (`user_…`). No separate `clerk_user_id` column — Clerk ID is the canonical primary key.

**New columns:** `email`, `updated_at`, `is_active`, `deleted_at`

## 3. Backfill Status

Script: `pnpm run db:backfill-users`

- Fetches all Clerk users via Clerk REST API
- Inserts missing Supabase records with `role = customer`
- Updates profile fields for existing users
- **Preserves** existing `super_admin`, `admin`, and `staff` roles

**Action required:** Run once after deploying migration:

```bash
pnpm run db:backfill-users
```

## 4. Role System Status

| Role | Hierarchy | Permissions summary |
|------|-----------|----------------------|
| `super_admin` | 4 | Full platform access including users, roles, settings, audit |
| `admin` | 3 | Products, inventory, orders, payments, bookings, contact, blog — **no** user/role/settings management |
| `staff` | 2 | View/update orders, inventory adjustments, view bookings/inquiries — **no** payments, products, settings |
| `customer` | 1 | Own profile, orders, bookings, addresses |

Permission definitions: `lib/admin-permissions.ts`  
Enforcement: `lib/admin-auth.ts` + server actions + middleware

Automated verification: `pnpm run verify:rbac` (40 checks, all passing)

## 5. Authorization Status

| Layer | Mechanism | Status |
|-------|-----------|--------|
| Middleware | Clerk session + Supabase role/active check | ✅ |
| Admin pages | `requireAdminPage(permission)` | ✅ |
| Server actions | `requirePermission()` / `requireSuperAdmin()` | ✅ |
| Customer pages | `requireUser()` + `.eq("user_id", userId)` | ✅ |
| Admin UI | Permission-gated sections in `AdminDashboard` | ✅ |
| User management | Super admin only; role changes audited | ✅ |

### Server action permission map

| Action | Permission | staff | admin | super_admin |
|--------|------------|-------|-------|-------------|
| adjustInventory | inventory:write | ✅ | ✅ | ✅ |
| updateOrderStatus | orders:write | ✅ | ✅ | ✅ |
| reviewPayment | payments:write | ❌ | ✅ | ✅ |
| saveProduct | products:write | ❌ | ✅ | ✅ |
| updateBookingStatus | bookings:write | ❌ | ✅ | ✅ |
| updateContactInquiryStatus | customers:write | ❌ | ✅ | ✅ |
| saveSiteSettings | settings:write | ❌ | ❌ | ✅ |
| updateUserRole | super_admin only | ❌ | ❌ | ✅ |
| setUserActiveStatus | super_admin only | ❌ | ❌ | ✅ |

## 6. RLS Status

RLS policies exist on all sensitive tables. The application uses **service role** for business logic (authorization enforced in app code).

Migration `20260622120000_rbac_production.sql` adds:

- Active-user checks on profile policies
- Bookings policy by `user_id` with email fallback for legacy rows
- Super-admin-only audit log read policy
- Partial unique index on email for active users

**Defense-in-depth note:** RLS is ready if Clerk JWT → Supabase integration is added later. Today, all access control is enforced server-side.

## 7. Security Findings

| Finding | Severity | Status |
|---------|----------|--------|
| No dev auth bypasses found | — | ✅ Clean |
| No hardcoded admin users | — | ✅ Clean |
| Staff could approve payments (before) | High | ✅ Fixed |
| Staff could change site settings (before) | High | ✅ Fixed |
| super_admin = admin permissions (before) | Medium | ✅ Fixed |
| No user.deleted webhook (before) | Medium | ✅ Fixed |
| Missing email in users table | Medium | ✅ Fixed |
| New users blocked by middleware before sync | Medium | ✅ Fixed (allow missing profile) |
| Guest checkout creates orders with null user_id | Low | Intentional — orders link when user is signed in |

## 8. Fixes Applied

1. **Database migration** — users schema, indexes, bookings.user_id, RLS updates
2. **Webhook handler** — full create/update/delete lifecycle with soft delete
3. **User sync** — email sync, idempotent upsert, role preservation
4. **Role permissions** — distinct super_admin / admin / staff matrices
5. **Admin dashboard** — permission-gated UI sections
6. **User management** — search, filter, role assignment, disable/reactivate (super admin)
7. **Audit logging** — role changes and user status changes logged with actor
8. **Customer dashboard** — order timeline, payments, receipts on order detail
9. **Bookings** — `user_id` on create; account page queries by user_id + email fallback
10. **Backfill script** — one-time Clerk → Supabase sync
11. **RBAC verification script** — automated permission matrix tests

## 9. Remaining Blockers

| Blocker | Action |
|---------|--------|
| **Apply DB migration** | Run `supabase/migrations/20260622120000_rbac_production.sql` in Supabase SQL Editor (or via CLI) |
| **Configure Clerk webhook** | Add `user.deleted` event if not already subscribed |
| **Run backfill** | `pnpm run db:backfill-users` after migration |
| **Promote first super admin** | `UPDATE public.users SET role = 'super_admin' WHERE email = 'your@email.com';` |
| **Clerk JWT → Supabase** (optional) | Not required for current architecture; RLS is defense-in-depth only |

## Production Checklist

- [ ] Migration applied to production Supabase
- [ ] Clerk webhook configured with all three user events
- [ ] Backfill script executed
- [ ] At least one super_admin assigned in database
- [ ] `pnpm run verify:rbac` passes in CI
- [ ] Test sign-up → verify user appears in Supabase `users` table
- [ ] Test staff login → confirm payment/product/settings sections hidden and actions blocked
