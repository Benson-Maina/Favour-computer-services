insert into public.site_settings (key, value) values
('payment', '{"paybill_number":"247247","account_number":"FAVOUR-U13","instructions":"Complete payment using the business Paybill and submit your payment reference for verification."}'),
('business', '{"name":"Favour Computer Services","phone":"0726548592","email":"bensonmurage254@gmail.com","location":"F&F Building, Next to Odeon Cinema, Shop U13, Nairobi, Kenya"}')
on conflict (key) do update set value = excluded.value;
