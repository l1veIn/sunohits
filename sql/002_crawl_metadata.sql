-- Table: crawl_metadata
create table if not exists crawl_metadata (
  id integer primary key default 1,
  last_run_at timestamp with time zone default now(),
  status text check (status in ('success', 'fail', 'running')),
  processed_pages text,
  last_error_message text,
  constraint single_row check (id = 1)
);

-- Insert initial row if not exists
insert into crawl_metadata (id, status, processed_pages)
values (1, 'success', '0/0')
on conflict (id) do nothing;