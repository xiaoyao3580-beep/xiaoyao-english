update public.vote_topics
set allow_multiple = false
where topic_number = 3;

drop index if exists public.idx_vote_submissions_one_per_topic;

do $$
begin
  if not exists (
    select 1
    from public.vote_submissions
    group by topic_number
    having count(*) > 1
  ) then
    create unique index idx_vote_submissions_one_per_topic
    on public.vote_submissions(topic_number);
  end if;
end;
$$;

notify pgrst, 'reload schema';
