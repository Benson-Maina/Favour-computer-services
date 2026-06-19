insert into public.site_settings (key, value) values
('payment', '{"paybill_number":"247247","account_number":"FAVOUR-U13","instructions":"Complete your payment using the Paybill Number below and upload your payment confirmation."}'),
('business', '{"name":"Favour Computer Services","phone":"0726548592","email":"bensonmurage254@gmail.com","location":"F&F Building, Next to Odeon Cinema, Shop U13, Nairobi, Kenya"}')
on conflict (key) do update set value = excluded.value;

insert into public.categories (name, slug, description, image_url) values
('Laptops','laptops','Business, student, creative, and gaming laptops','https://images.unsplash.com/photo-1496181133206-80ce9b88a853'),
('Desktops','desktops','Office PCs, gaming PCs, and workstations','https://images.unsplash.com/photo-1593640408182-31c70c8268f5'),
('Phones','phones','Original smartphones with warranty','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'),
('Storage','storage','SSD, HDD, flash drives, and memory cards','https://images.unsplash.com/photo-1597872200969-2b65d56bd16b'),
('Accessories','accessories','Keyboards, mouse, monitors, chargers, routers, and headsets','https://images.unsplash.com/photo-1629429407756-9d5b5c143c3d'),
('CCTV','cctv','Cameras, DVR, NVR, and complete CCTV kits','https://images.unsplash.com/photo-1558002038-1055907df827')
on conflict (slug) do nothing;

insert into public.brands (name, slug) values
('HP','hp'),('Dell','dell'),('Lenovo','lenovo'),('Samsung','samsung'),('Kingston','kingston'),('Hikvision','hikvision'),('Logitech','logitech'),('TP-Link','tp-link')
on conflict (slug) do nothing;

insert into public.products (sku, name, slug, description, price, compare_at_price, sale_price, stock, low_stock_threshold, supplier_name, supplier_contact, rating, review_count, images, specs, featured, new_arrival, best_selling, seo_title, seo_description)
values
('HP-EB840G8','HP EliteBook 840 G8 Core i7','hp-elitebook-840-g8-core-i7','Premium business laptop with fast SSD storage and all-day portability.',78500,86000,75900,8,5,'HP Official Distributor','0700 123 456',4.8,37,'["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed"]','{"Processor":"Intel Core i7 11th Gen","RAM":"16GB","Storage":"512GB NVMe SSD"}',true,true,true,'HP EliteBook Nairobi','Buy HP EliteBook laptops in Nairobi.'),
('DE-5420I5','Dell Latitude 5420 Core i5','dell-latitude-5420-core-i5','Reliable productivity laptop for office, school, and online meetings.',62500,null,null,12,6,'Dell Kenya','0711 234 567',4.7,28,'["https://images.unsplash.com/photo-1541807084-5c52b6b3adef"]','{"Processor":"Intel Core i5 11th Gen","RAM":"8GB","Storage":"256GB SSD"}',true,true,false,'Dell Latitude Nairobi','Buy Dell Latitude laptops in Nairobi.'),
('SM-A35-256GB','Samsung Galaxy A35 5G 256GB','samsung-galaxy-a35-5g-256gb','Fast 5G smartphone with strong battery life and dependable camera performance.',43500,46500,42900,15,8,'Samsung Nairobi','0733 112 233',4.7,45,'["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c"]','{"Storage":"256GB","RAM":"8GB","Network":"5G"}',true,false,true,'Samsung phones Nairobi','Buy Samsung phones in Nairobi.'),
('KS-NV2-1TB','Kingston NV2 1TB NVMe SSD','kingston-nv2-1tb-nvme-ssd','High-speed NVMe drive for laptop upgrades and faster boot times.',9800,null,null,30,10,'Kingston Kenya','0709 445 667',4.9,54,'["https://images.unsplash.com/photo-1628557118391-56cd62c9f2cb"]','{"Capacity":"1TB","Interface":"PCIe NVMe","Form":"M.2 2280"}',true,false,true,'SSD Nairobi','Buy SSD drives in Nairobi.'),
('HK-4CCTV-KIT','Hikvision 4 Camera CCTV Kit','hikvision-4-camera-cctv-kit','Complete CCTV kit for homes, shops, and offices.',32500,null,null,7,5,'Hikvision Kenya','0710 332 210',4.8,31,'["https://images.unsplash.com/photo-1563013544-824ae1b704d3"]','{"Cameras":"4","Recorder":"4-channel DVR","Remote":"Mobile viewing"}',true,false,false,'CCTV Kit Nairobi','Buy CCTV kits and installation in Nairobi.')
on conflict (slug) do nothing;

insert into public.testimonials (name, role, quote, rating) values
('Grace Wanjiku','Boutique owner, Nairobi CBD','Favour Computer Services installed CCTV in my shop and configured mobile viewing the same day.',5),
('Peter Mwangi','Accountant','I bought a Dell laptop and upgraded to SSD. The machine is fast and genuine.',5),
('Faith Njeri','Church media team','Their live streaming setup improved our Sunday service broadcast quality immediately.',5);

insert into public.blog_categories (name, slug) values
('Buying Guides','buying-guides'),('Repairs','repairs'),('Security','security')
on conflict (slug) do nothing;

insert into public.blog_posts (title, slug, excerpt, content, tags, featured_image, published, published_at, seo_title, seo_description) values
('Best Laptops for Business Buyers in Nairobi','best-laptops-for-business-in-nairobi','Choose secure, fast, and durable laptops for office teams.','Business buyers should prioritize build quality, SSD storage, RAM, warranty support, and ports.','{"Laptops Nairobi","Business laptops"}','https://images.unsplash.com/photo-1496181133206-80ce9b88a853',true,now(),'Best Laptops Nairobi','Business laptop buying guide for Nairobi.'),
('Why an SSD Upgrade Is the Fastest Way to Revive an Old Computer','ssd-upgrade-benefits','SSD upgrades reduce boot times and improve app loading.','Replacing a mechanical drive with an SSD gives the biggest speed improvement per shilling.','{"SSD Nairobi","Computer Repairs"}','https://images.unsplash.com/photo-1597872200969-2b65d56bd16b',true,now(),'SSD Upgrade Nairobi','SSD upgrade benefits for laptops and desktops.'),
('CCTV Installation Checklist for Nairobi Shops and Offices','cctv-installation-checklist-nairobi','Plan camera placement, storage, remote viewing, and cabling.','Good CCTV installation starts with camera placement, night visibility, recorder storage, power backup, internet availability, and secure mobile access.','{"CCTV Installation Nairobi","Security cameras"}','https://images.unsplash.com/photo-1558002038-1055907df827',true,now(),'CCTV Installation Nairobi','CCTV checklist for Nairobi businesses.')
on conflict (slug) do nothing;

insert into public.faqs (question, answer, category, sort_order) values
('Do you offer shop pickup?','Yes. You can pick up from Shop U13 at F&F Building next to Odeon Cinema in Nairobi.','Orders',1),
('Do you accept card payments?','No. Orders use Paybill payment instructions and payment confirmation upload.','Payments',2),
('Can I order through WhatsApp?','Yes. Product and service pages include WhatsApp inquiry buttons.','Orders',3);
