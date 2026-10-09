# Clinic-Admin

Secure admin dashboard for the SkinCare Clinic appointment website.

## Stack
- Next.js 15 / React 19
- Supabase Auth for sign-in
- Supabase Postgres for appointment records
- Server API verifies the signed-in user's ID against `admin_users` before returning or modifying patient data

## Required Vercel environment variables
- `NEXT_PUBLIC_SUPABASE_URL` — project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — public/publishable key (safe for browser use)
- `SUPABASE_URL` — same project URL
- `SUPABASE_SECRET_KEY` — server-only secret key; never add a `NEXT_PUBLIC_` prefix

The legacy names `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are also supported by the code.

## Setup
1. Deploy this repository as its own Vercel project.
2. Add the environment variables above and redeploy.
3. Use the same Supabase project as the public website.
4. In Supabase Authentication, create the clinic administrator user with email/password.
5. Copy the user's Auth UUID and add it to `public.admin_users` in the SQL Editor:

```sql
insert into public.admin_users (auth_user_id, role)
values ('PASTE_AUTH_USER_UUID_HERE', 'clinic_admin')
on conflict (auth_user_id) do update set role = excluded.role;
```

Only add trusted staff accounts. Do not make patient tables publicly readable. Appointment status changes are supported; automated email/WhatsApp notifications and AI-agent booking integration still need to be configured separately.
