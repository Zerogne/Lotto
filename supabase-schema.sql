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
  tickets_sold integer default 0,
  end_date     date not null,
  draw_date    date,
  status       text default 'active' check (status in ('active','drawing','ended')),
  description  text,
  prize_value  bigint default 0,
  created_at   timestamptz default now()
);

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
  lottery_id         uuid references lotteries(id) on delete set null,
  purchase_group_id  uuid,
  created_at         timestamptz default now()
);

-- Disable Row Level Security so service_role key has full access from the API
alter table lotteries disable row level security;
alter table tickets   disable row level security;
alter table winners   disable row level security;
alter table sms_logs  disable row level security;
