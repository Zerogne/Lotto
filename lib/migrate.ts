const SCHEMA_SQL = `
create table if not exists lotteries (
  id           uuid primary key default gen_random_uuid(),
  car_name     text not null,
  car_brand    text default '',
  car_model    text default '',
  car_image    text default '/images/car-placeholder.svg',
  car_images   text[] default '{}',
  ticket_price integer not null,
  max_tickets  integer not null,
  tickets_sold integer default 0,
  end_date     date not null,
  draw_date    date,
  status       text default 'active' check (status in ('active','drawing','ended')),
  description  text default '',
  prize_value  bigint default 0,
  created_at   timestamptz default now()
);

create table if not exists tickets (
  code          text not null,
  phone         text not null,
  lottery_id    uuid references lotteries(id) on delete cascade,
  lottery_name  text default '',
  purchase_date date default current_date,
  created_at    timestamptz default now(),
  primary key   (code, lottery_id)
);

create table if not exists winners (
  id           uuid primary key default gen_random_uuid(),
  lottery_id   uuid references lotteries(id),
  car_name     text default '',
  car_image    text default '/images/car-placeholder.svg',
  winner_phone text default '',
  ticket_code  text default '',
  draw_date    date,
  prize_value  bigint default 0,
  created_at   timestamptz default now()
);

alter table lotteries add column if not exists car_images text[] default '{}';

alter table lotteries disable row level security;
alter table tickets   disable row level security;
alter table winners   disable row level security;
`;

export { SCHEMA_SQL };

export async function runMigrations(): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ref = supabaseUrl.replace("https://", "").replace(".supabase.co", "");

  if (!token) {
    return {
      ok: false,
      error: "SUPABASE_MANAGEMENT_TOKEN байхгүй байна. .env файлд нэмнэ үү.",
    };
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: SCHEMA_SQL }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `Management API алдаа (${res.status}): ${text}` };
  }

  return { ok: true };
}
