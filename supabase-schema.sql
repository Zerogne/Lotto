-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

create table if not exists lotteries (
  id           uuid primary key default gen_random_uuid(),
  car_name     text not null,
  car_brand    text,
  car_model    text,
  car_image    text default '/images/car-placeholder.svg',
  car_images   text[] default '{}',
  ticket_price integer not null,
  max_tickets  integer not null,
  code_digits  smallint not null default 5 check (code_digits in (4, 5)),
  codes_per_ticket smallint not null default 10 check (codes_per_ticket in (5, 10)),
  tickets_sold integer default 0,
  end_date     date not null,
  draw_date    date,
  status       text default 'active' check (status in ('active','drawing','ended')),
  description  text,
  prize_value  bigint default 0,
  created_at   timestamptz default now()
);

alter table lotteries add column if not exists code_digits smallint not null default 5 check (code_digits in (4, 5));
alter table lotteries add column if not exists codes_per_ticket smallint not null default 10 check (codes_per_ticket in (5, 10));

create table if not exists tickets (
  code               text not null,
  phone              text not null,
  lottery_id         uuid references lotteries(id) on delete cascade,
  lottery_name       text,
  purchase_date      date default current_date,
  purchase_group_id  uuid,
  created_at         timestamptz default now(),
  primary key        (code, lottery_id)
);

alter table tickets add column if not exists purchase_group_id uuid;

create table if not exists winners (
  id           uuid primary key default gen_random_uuid(),
  lottery_id   uuid references lotteries(id),
  car_name     text,
  car_image    text,
  winner_phone text,
  ticket_code  text,
  draw_date    date,
  prize_value  bigint default 0,
  created_at   timestamptz default now()
);

create table if not exists sms_logs (
  id                 uuid primary key default gen_random_uuid(),
  phone              text not null,
  message            text not null,
  ok                 boolean not null,
  detail             text,
  sms_id             text,
  lottery_id         uuid references lotteries(id) on delete set null,
  purchase_group_id  uuid,
  created_at         timestamptz default now()
);

alter table sms_logs add column if not exists sms_id text;

update lotteries as lottery
set codes_per_ticket = 5
where lottery.code_digits = 4
  and lottery.codes_per_ticket = 10
  and not exists (
    select 1 from tickets as ticket where ticket.lottery_id = lottery.id
  );

-- Disable Row Level Security so service_role key has full access from the API
alter table lotteries disable row level security;
alter table tickets   disable row level security;
alter table winners   disable row level security;
alter table sms_logs  disable row level security;

-- Performance: the admin tickets page filters/sorts/groups by these columns on
-- every request. Without indexes, every query is a full table scan that gets
-- slower as more tickets are added.
create index if not exists idx_tickets_purchase_group_id on tickets (purchase_group_id);
create index if not exists idx_tickets_lottery_id on tickets (lottery_id);
create index if not exists idx_tickets_phone on tickets (phone);
create index if not exists idx_tickets_created_at on tickets (created_at desc);

-- Aggregated view: one row per purchase batch instead of one row per code
-- (each unit purchased stores 10 code rows). Lets the admin tickets page
-- search/paginate/group in Postgres instead of pulling every code row into
-- the app and doing it in JavaScript.
-- coalesce() matches the app's fallback for legacy rows that predate
-- purchase_group_id (falls back to the row's own code so they don't all
-- collapse into a single group under a shared NULL key).
create or replace view ticket_purchase_groups as
select
  coalesce(purchase_group_id::text, code) as purchase_group_id,
  phone,
  lottery_id,
  lottery_name,
  array_agg(code order by code) as codes,
  count(*) as codes_count,
  max(created_at) as last_created_at
from tickets
group by coalesce(purchase_group_id::text, code), phone, lottery_id, lottery_name;

-- Without this, the view runs with its creator's (elevated) permissions
-- instead of the querying role's, bypassing RLS if it's ever re-enabled.
alter view ticket_purchase_groups set (security_invoker = on);
