-- Prevent duplicate winner confirmation from repeated or concurrent admin requests.
create unique index if not exists winners_one_per_lottery
  on public.winners (lottery_id);

notify pgrst, 'reload schema';
