insert into public.site_settings (key, value) values
('business_name', '"Favour Computer Services"'),
('business_phone', '"0726548592"'),
('business_whatsapp', '"254726548592"'),
('business_email', '"bensonmurage254@gmail.com"'),
('business_location', '"F&F Building, Next to Odeon Cinema, Shop U13, Nairobi, Kenya"'),
('business_description', '"Quality electronics, CCTV systems, repairs, networking, and live streaming services in Nairobi."'),
('paybill_number', '"247247"'),
('paybill_account', '"FAVOUR-U13"'),
('payment_instructions', '"Complete payment using the business Paybill and submit your payment reference for verification."')
on conflict (key) do update set value = excluded.value;
