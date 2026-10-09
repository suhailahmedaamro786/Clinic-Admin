# Clinic-Admin

Secure admin dashboard for the SkinCare Clinic appointment website.

## Stack
- Next.js 15 / React 19
- Supabase Auth for sign-in
- Supabase Postgres for appointment records
- Server API verifies the signed-in user's ID against `admin_users` before returning patient data

## Required Vercel environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (same project URL)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never add a `NEXT_PUBLIC_` prefix)

## Setup
1. Deploy this repository as its own Vercel project.
2. Add the environment variables above and redeploy.
3. In the same Supabase project used by the website, run `supabase/schema.sql` from the website repository in the SQL Editor.
4. In Supabase Authentication, create the clinic administrator user with email/password.
5. Add that user's Auth UUID to `public.admin_users` using the SQL Editor:

```sql
insert into public.admin_users (auth_user_id, role)
values ('PASTE_AUTH_USER_UUID_HERE', 'clinic_admin');
```

Only add trusted staff accounts. Do not make patient tables publicly readable. The dashboard currently lists appointments and filters by status; booking status changes and outbound notifications are not yet implemented.
