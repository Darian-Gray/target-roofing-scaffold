-- Internal Prospect Intake Form submissions (replaces WordPress Gravity Form 5).
-- Server-only access: RLS on, no anon/authenticated grants; the site writes with the service role.
-- Applied to project rciyoqdtejxcjqnvbsoi on 2026-10-06.
create table if not exists public.prospect_intakes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text not null,
  created_by text not null,
  salesperson text not null,
  salesperson_email text not null,
  project_name text not null,
  bid_due_date date,
  comments text,
  notified boolean not null default false
);
alter table public.prospect_intakes enable row level security;
revoke all on public.prospect_intakes from anon, authenticated;
