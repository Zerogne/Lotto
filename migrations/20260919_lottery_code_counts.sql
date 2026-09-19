-- Run this in the SQL Editor of the Supabase project used by Vercel.
-- Lotteries that have already issued codes keep their original code count.
alter table public.lotteries
  add column if not exists code_digits smallint not null default 5
  check (code_digits in (4, 5));

alter table public.lotteries
  add column if not exists codes_per_ticket smallint not null default 10
  check (codes_per_ticket in (5, 10));

-- Empty 4-digit lotteries can safely switch to 5 codes per ticket.
update public.lotteries as lottery
set codes_per_ticket = 5
where lottery.code_digits = 4
  and lottery.codes_per_ticket = 10
  and not exists (
    select 1 from public.tickets as ticket where ticket.lottery_id = lottery.id
  );

-- Make the new columns available to Supabase's REST API immediately.
notify pgrst, 'reload schema';
