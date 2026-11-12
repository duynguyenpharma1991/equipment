-- DEMO DATA — replace/edit through /admin. Safe to re-run (idempotent on slug/key).
-- Technical figures below are illustrative placeholders, NOT verified manufacturer specs.

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values (
  'general',
  $j$ {
    "company_name_vi": "PharmaEquip Việt Nam",
    "company_name_en": "PharmaEquip Vietnam",
    "tagline_vi": "Thiết bị sản xuất dược phẩm đạt chuẩn GMP",
    "tagline_en": "GMP-compliant pharmaceutical manufacturing equipment",
    "email": "duynguyenpharma1991@gmail.com",
    "phone": "",
    "hotline": "",
    "whatsapp": "",
    "zalo": "",
    "address_vi": "",
    "address_en": "",
    "working_hours_vi": "Thứ 2 – Thứ 7: 8:00 – 17:30",
    "working_hours_en": "Mon – Sat: 8:00 – 17:30",
    "facebook": "",
    "youtube": "",
    "linkedin": "",
    "about_vi": "## Về chúng tôi\n\nChúng tôi cung cấp **máy móc và dây chuyền thiết bị cho nhà máy sản xuất dược phẩm**: đóng vỉ, đóng hộp, đóng nang, dập viên, bao phim, tạo hạt, chiết rót và hệ thống nước – phòng sạch.\n\n### Cam kết\n\n- Thiết bị thiết kế theo nguyên tắc **GMP**, bề mặt tiếp xúc sản phẩm bằng thép không gỉ 316L.\n- Hỗ trợ hồ sơ **URS, DQ, IQ, OQ** và đào tạo vận hành.\n- Bảo hành, bảo trì và cung cấp phụ tùng thay thế.\n\n*(Nội dung demo — vui lòng cập nhật trong trang quản trị.)*",
    "about_en": "## About us\n\nWe supply **machinery and complete lines for pharmaceutical factories**: blister packing, cartoning, capsule filling, tablet pressing, film coating, granulation, liquid filling and water / cleanroom systems.\n\n### Our commitments\n\n- Equipment designed to **GMP** principles, with 316L stainless-steel product-contact parts.\n- Support for **URS, DQ, IQ, OQ** documentation and operator training.\n- Warranty, maintenance and spare-parts supply.\n\n*(Demo content — please update it in the admin area.)*"
  } $j$::jsonb
)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
insert into public.categories (slug, name_vi, name_en, description_vi, description_en, sort_order) values
 ('blister-packing-machines', 'Máy đóng vỉ', 'Blister Packing Machines',
  'Máy đóng vỉ Alu-PVC và Alu-Alu cho viên nén, viên nang.', 'Alu-PVC and Alu-Alu blister machines for tablets and capsules.', 10),
 ('cartoning-machines', 'Máy đóng hộp', 'Cartoning Machines',
  'Máy đóng hộp tự động, nối tuyến với máy đóng vỉ.', 'Automatic cartoners, linkable with blister lines.', 20),
 ('capsule-tablet-machines', 'Máy đóng nang & dập viên', 'Capsule & Tablet Machines',
  'Máy đóng nang tự động và máy dập viên xoay tròn.', 'Automatic capsule fillers and rotary tablet presses.', 30),
 ('coating-granulation', 'Máy bao phim & tạo hạt', 'Coating & Granulation',
  'Thiết bị bao phim, tạo hạt, sấy tầng sôi, trộn.', 'Film coating, granulation, fluid-bed drying and blending equipment.', 40),
 ('liquid-filling-lines', 'Dây chuyền chiết rót', 'Liquid Filling Lines',
  'Chiết rót, đóng nắp, dán nhãn cho siro và dung dịch uống.', 'Filling, capping and labelling for syrups and oral liquids.', 50),
 ('water-cleanroom', 'Hệ thống nước & phòng sạch', 'Water & Cleanroom Systems',
  'Hệ thống nước tinh khiết, nước cất, phòng sạch GMP.', 'Purified water, WFI and GMP cleanroom systems.', 60)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
insert into public.products
  (slug, model_code, category_id, name_vi, name_en, summary_vi, summary_en,
   description_vi, description_en, features_vi, features_en, specs,
   is_featured, status, sort_order, published_at)
values
('bp-260-alu-pvc-blister-packing-machine', 'BP-260',
 (select id from public.categories where slug = 'blister-packing-machines'),
 'Máy đóng vỉ Alu-PVC tốc độ cao BP-260', 'BP-260 High-Speed Alu-PVC Blister Packing Machine',
 'Máy đóng vỉ tự động Alu-PVC dùng servo, đổi khuôn nhanh, phù hợp viên nén và viên nang.',
 'Servo-driven automatic Alu-PVC blister machine with quick mold change for tablets and capsules.',
 E'Máy đóng vỉ **BP-260** thực hiện tạo hình, nạp thuốc, hàn nhiệt, in lô/HSD và cắt vỉ trong một chu trình liên tục. Cấu trúc thép không gỉ, bề mặt tiếp xúc sản phẩm đạt yêu cầu GMP.',
 E'The **BP-260** forms, fills, heat-seals, codes batch / expiry and punches blisters in one continuous cycle. Stainless-steel construction with GMP-compliant product-contact surfaces.',
 $j$["Dẫn động servo, vận hành êm và chính xác","Đổi khuôn nhanh, giảm thời gian chuyển lô","Hệ thống loại bỏ vỉ lỗi tự động","Màn hình HMI song ngữ Việt – Anh"]$j$::jsonb,
 $j$["Servo drive for smooth, accurate operation","Quick mold change to cut changeover time","Automatic rejection of defective blisters","Bilingual Vietnamese / English HMI"]$j$::jsonb,
 $j$[
  {"title_vi":"Thông số kỹ thuật","title_en":"Technical parameters","rows":[
    {"label_vi":"Công suất","label_en":"Capacity","value":"up to 300 blister/min"},
    {"label_vi":"Vùng tạo hình","label_en":"Forming area","value":"260 × 120 mm"},
    {"label_vi":"Độ sâu tạo hình","label_en":"Forming depth","value":"≤ 12 mm"},
    {"label_vi":"Vật liệu","label_en":"Materials","value":"PVC / Aluminum foil"},
    {"label_vi":"Khí nén","label_en":"Compressed air","value":"0.6 – 0.8 MPa"},
    {"label_vi":"Nguồn điện","label_en":"Power","value":"380 V / 50 Hz / 12 kW"},
    {"label_vi":"Kích thước","label_en":"Dimensions","value":"4200 × 780 × 1650 mm"}
  ]}
 ]$j$::jsonb,
 true, 'published', 10, now()),

('bp-350-alu-alu-blister-packing-machine', 'BP-350',
 (select id from public.categories where slug = 'blister-packing-machines'),
 'Máy đóng vỉ Alu-Alu BP-350', 'BP-350 Alu-Alu Blister Packing Machine',
 'Đóng vỉ Alu-Alu (cold forming) cho dược phẩm nhạy ẩm, độ kín cao.',
 'Cold-forming Alu-Alu blister machine for moisture-sensitive drugs with high barrier performance.',
 E'Máy **BP-350** dùng công nghệ tạo hình nguội, cho vỉ có khả năng chắn ẩm và chắn sáng vượt trội, phù hợp thuốc nhạy cảm.',
 E'The **BP-350** uses cold-forming technology for blisters with excellent moisture and light barrier, suited to sensitive products.',
 $j$["Tạo hình nguội Alu-Alu","Hệ thống nạp thuốc rung linh hoạt","Cảm biến kiểm tra thiếu viên"]$j$::jsonb,
 $j$["Alu-Alu cold forming","Flexible vibratory feeding system","Missing-tablet detection sensors"]$j$::jsonb,
 $j$[
  {"title_vi":"Thông số kỹ thuật","title_en":"Technical parameters","rows":[
    {"label_vi":"Công suất","label_en":"Capacity","value":"up to 180 blister/min"},
    {"label_vi":"Vùng tạo hình","label_en":"Forming area","value":"350 × 130 mm"},
    {"label_vi":"Nguồn điện","label_en":"Power","value":"380 V / 50 Hz / 15 kW"},
    {"label_vi":"Kích thước","label_en":"Dimensions","value":"4800 × 850 × 1700 mm"}
  ]}
 ]$j$::jsonb,
 false, 'published', 20, now()),

('ct-120-automatic-cartoning-machine', 'CT-120',
 (select id from public.categories where slug = 'cartoning-machines'),
 'Máy đóng hộp tự động CT-120', 'CT-120 Automatic Cartoning Machine',
 'Đóng hộp tốc độ cao, tự động nạp vỉ, tờ hướng dẫn, gấp và dán nắp hộp.',
 'High-speed cartoner that feeds blisters and leaflets, then folds and closes the carton.',
 E'**CT-120** nối trực tiếp với máy đóng vỉ để tạo thành dây chuyền liên động, giảm nhân công và sai sót.',
 E'The **CT-120** links directly to a blister machine to form an interlocked line, reducing labour and errors.',
 $j$["Nối tuyến liên động với máy đóng vỉ","Tự động nạp tờ hướng dẫn","Kiểm tra hộp thiếu vỉ / thiếu tờ HD"]$j$::jsonb,
 $j$["Interlocked with the blister machine","Automatic leaflet feeding","Missing blister / leaflet inspection"]$j$::jsonb,
 $j$[
  {"title_vi":"Thông số kỹ thuật","title_en":"Technical parameters","rows":[
    {"label_vi":"Tốc độ","label_en":"Speed","value":"60 – 120 carton/min"},
    {"label_vi":"Kích thước hộp","label_en":"Carton size","value":"(60–150) × (30–70) × (15–50) mm"},
    {"label_vi":"Nguồn điện","label_en":"Power","value":"380 V / 50 Hz / 6 kW"}
  ]}
 ]$j$::jsonb,
 true, 'published', 30, now()),

('cf-400-automatic-capsule-filling-machine', 'CF-400',
 (select id from public.categories where slug = 'capsule-tablet-machines'),
 'Máy đóng nang tự động CF-400', 'CF-400 Automatic Capsule Filling Machine',
 'Đóng nang cứng tự động, kiểm soát khối lượng, phù hợp bột và vi hạt.',
 'Automatic hard-capsule filler with fill-weight control, suitable for powders and pellets.',
 E'**CF-400** đạt năng suất cao với độ lệch khối lượng nhỏ, dễ vệ sinh và tháo lắp.',
 E'The **CF-400** delivers high output with tight fill-weight variation and is easy to clean and dismantle.',
 $j$["Cơ cấu định lượng chính xác","Hút bụi tích hợp","Dễ vệ sinh, tháo lắp nhanh"]$j$::jsonb,
 $j$["Accurate dosing mechanism","Integrated dust extraction","Easy cleaning and quick disassembly"]$j$::jsonb,
 $j$[
  {"title_vi":"Thông số kỹ thuật","title_en":"Technical parameters","rows":[
    {"label_vi":"Công suất","label_en":"Output","value":"up to 24,000 capsules/h"},
    {"label_vi":"Cỡ nang","label_en":"Capsule size","value":"00# – 5#"},
    {"label_vi":"Nguồn điện","label_en":"Power","value":"380 V / 50 Hz / 5.5 kW"}
  ]}
 ]$j$::jsonb,
 true, 'published', 40, now()),

('tp-45-rotary-tablet-press', 'TP-45',
 (select id from public.categories where slug = 'capsule-tablet-machines'),
 'Máy dập viên xoay tròn TP-45', 'TP-45 Rotary Tablet Press',
 'Máy dập viên xoay tròn 45 chày, kiểm soát lực nén, cách ly buồng nén.',
 '45-station rotary tablet press with compression-force control and isolated compression chamber.',
 E'**TP-45** phù hợp sản xuất viên nén quy mô công nghiệp, có hệ thống giám sát lực nén và loại viên lỗi.',
 E'The **TP-45** suits industrial tablet production, with compression-force monitoring and reject of out-of-spec tablets.',
 $j$["45 chày, 1 hoặc 2 bên nạp liệu","Giám sát lực nén theo thời gian thực","Buồng nén tách biệt, chống nhiễm chéo"]$j$::jsonb,
 $j$["45 stations with force-feeder","Real-time compression-force monitoring","Isolated compression chamber against cross-contamination"]$j$::jsonb,
 $j$[
  {"title_vi":"Thông số kỹ thuật","title_en":"Technical parameters","rows":[
    {"label_vi":"Số chày","label_en":"Stations","value":"45"},
    {"label_vi":"Công suất","label_en":"Output","value":"up to 270,000 tablets/h"},
    {"label_vi":"Lực nén tối đa","label_en":"Max. pressure","value":"80 kN"},
    {"label_vi":"Nguồn điện","label_en":"Power","value":"380 V / 50 Hz / 7.5 kW"}
  ]}
 ]$j$::jsonb,
 true, 'published', 50, now()),

('fc-150-film-coating-machine', 'FC-150',
 (select id from public.categories where slug = 'coating-granulation'),
 'Máy bao phim hiệu suất cao FC-150', 'FC-150 High-Efficiency Film Coating Machine',
 'Nồi bao phim đục lỗ, gia nhiệt và hút bụi, súng phun tự động.',
 'Perforated-drum film coater with heated air, dust extraction and automatic spray guns.',
 E'**FC-150** cho lớp phim đồng đều, thời gian bao ngắn, dễ vệ sinh CIP.',
 E'The **FC-150** gives uniform film layers, short coating cycles and CIP-friendly cleaning.',
 $j$["Nồi bao đục lỗ toàn phần","Súng phun tự động, bơm nhu động","Điều khiển PLC, lưu công thức"]$j$::jsonb,
 $j$["Fully perforated drum","Automatic spray guns with peristaltic pump","PLC control with recipe storage"]$j$::jsonb,
 $j$[
  {"title_vi":"Thông số kỹ thuật","title_en":"Technical parameters","rows":[
    {"label_vi":"Dung tích tối đa","label_en":"Max. batch","value":"150 kg"},
    {"label_vi":"Tốc độ nồi","label_en":"Drum speed","value":"1 – 12 rpm"},
    {"label_vi":"Nguồn điện","label_en":"Power","value":"380 V / 50 Hz / 18 kW"}
  ]}
 ]$j$::jsonb,
 false, 'published', 60, now()),

('hg-250-high-shear-mixer-granulator', 'HG-250',
 (select id from public.categories where slug = 'coating-granulation'),
 'Máy trộn tạo hạt siêu tốc HG-250', 'HG-250 High-Shear Mixer Granulator',
 'Trộn và tạo hạt ướt trong một thiết bị, kiểm soát điểm kết thúc theo công suất động cơ.',
 'Mixes and wet-granulates in one vessel, with end-point control by motor power.',
 E'**HG-250** rút ngắn thời gian tạo hạt, cho cỡ hạt đồng đều trước khi sấy tầng sôi.',
 E'The **HG-250** shortens granulation time and produces uniform granules ahead of fluid-bed drying.',
 $j$["Cánh trộn và dao cắt độc lập","Bình inox 316L, đánh bóng gương","Kiểm soát điểm kết thúc tạo hạt"]$j$::jsonb,
 $j$["Independent impeller and chopper","316L mirror-polished vessel","Granulation end-point control"]$j$::jsonb,
 $j$[
  {"title_vi":"Thông số kỹ thuật","title_en":"Technical parameters","rows":[
    {"label_vi":"Thể tích bình","label_en":"Vessel volume","value":"250 L"},
    {"label_vi":"Công suất cánh trộn","label_en":"Impeller power","value":"22 kW"},
    {"label_vi":"Nguồn điện","label_en":"Power","value":"380 V / 50 Hz / 26 kW"}
  ]}
 ]$j$::jsonb,
 false, 'published', 70, now()),

('lf-60-syrup-filling-capping-line', 'LF-60',
 (select id from public.categories where slug = 'liquid-filling-lines'),
 'Dây chuyền chiết rót – đóng nắp siro LF-60', 'LF-60 Syrup Filling & Capping Line',
 'Rửa chai, chiết rót, đóng nắp và dán nhãn cho siro, dung dịch uống.',
 'Bottle washing, filling, capping and labelling for syrups and oral liquids.',
 E'**LF-60** vận hành liên tục, chiết rót bằng bơm piston định lượng chính xác.',
 E'The **LF-60** runs continuously and fills with accurate piston dosing pumps.',
 $j$["Bơm piston định lượng chính xác","Đóng nắp vặn có kiểm soát lực","Có thể mở rộng thêm dán nhãn, in lô"]$j$::jsonb,
 $j$["Accurate piston dosing pumps","Torque-controlled screw capping","Expandable with labelling and coding"]$j$::jsonb,
 $j$[
  {"title_vi":"Thông số kỹ thuật","title_en":"Technical parameters","rows":[
    {"label_vi":"Công suất","label_en":"Output","value":"up to 60 bottles/min"},
    {"label_vi":"Dung tích chai","label_en":"Bottle volume","value":"10 – 250 mL"},
    {"label_vi":"Nguồn điện","label_en":"Power","value":"380 V / 50 Hz / 9 kW"}
  ]}
 ]$j$::jsonb,
 false, 'published', 80, now()),

('pw-1000-purified-water-system', 'PW-1000',
 (select id from public.categories where slug = 'water-cleanroom'),
 'Hệ thống nước tinh khiết RO PW-1000', 'PW-1000 Purified Water RO System',
 'Hệ thống RO hai cấp kèm EDI, đạt tiêu chuẩn nước tinh khiết dược dụng.',
 'Two-pass RO with EDI producing pharmaceutical-grade purified water.',
 E'**PW-1000** gồm tiền xử lý, RO hai cấp, EDI, bồn chứa và vòng tuần hoàn vệ sinh nhiệt.',
 E'The **PW-1000** comprises pre-treatment, two-pass RO, EDI, a storage tank and a hot-sanitisable loop.',
 $j$["RO hai cấp + EDI","Giám sát dẫn điện / TOC trực tuyến","Vòng tuần hoàn vệ sinh nhiệt"]$j$::jsonb,
 $j$["Two-pass RO + EDI","Online conductivity / TOC monitoring","Hot-sanitisable distribution loop"]$j$::jsonb,
 $j$[
  {"title_vi":"Thông số kỹ thuật","title_en":"Technical parameters","rows":[
    {"label_vi":"Lưu lượng","label_en":"Flow rate","value":"1000 L/h"},
    {"label_vi":"Độ dẫn điện nước ra","label_en":"Product conductivity","value":"≤ 1.3 µS/cm"},
    {"label_vi":"Nguồn điện","label_en":"Power","value":"380 V / 50 Hz / 8 kW"}
  ]}
 ]$j$::jsonb,
 false, 'published', 90, now())
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- News
-- ---------------------------------------------------------------------------
insert into public.news_posts
  (slug, title_vi, title_en, excerpt_vi, excerpt_en, content_vi, content_en, status, published_at)
values
('chon-may-dong-vi-phu-hop', 'Cách chọn máy đóng vỉ phù hợp cho nhà máy dược', 'How to choose the right blister machine for a pharma plant',
 'Những tiêu chí cần cân nhắc: công suất, vật liệu, khả năng nối tuyến và hồ sơ thẩm định.',
 'Key criteria: output, materials, line integration and qualification documents.',
 E'## Các tiêu chí chính\n\n1. **Công suất và nhịp sản xuất** – chọn dư công suất khoảng 20–30%.\n2. **Vật liệu bao bì** – Alu-PVC hay Alu-Alu tùy độ nhạy ẩm của sản phẩm.\n3. **Khả năng nối tuyến** với máy đóng hộp.\n4. **Hồ sơ URS / DQ / IQ / OQ** do nhà cung cấp hỗ trợ.\n\n*(Bài viết demo.)*',
 E'## Key criteria\n\n1. **Output and takt time** – leave about 20–30% headroom.\n2. **Packaging material** – Alu-PVC or Alu-Alu depending on moisture sensitivity.\n3. **Line integration** with the cartoner.\n4. **URS / DQ / IQ / OQ documents** supported by the supplier.\n\n*(Demo article.)*',
 'published', now() - interval '3 days'),
('gmp-equipment-qualification-checklist', 'Checklist thẩm định thiết bị theo GMP', 'GMP equipment qualification checklist',
 'Tóm tắt các bước DQ, IQ, OQ, PQ khi đưa thiết bị mới vào nhà máy.',
 'A summary of DQ, IQ, OQ and PQ steps when commissioning new equipment.',
 E'## Các bước thẩm định\n\n- **DQ** – xác nhận thiết kế đáp ứng URS.\n- **IQ** – xác nhận lắp đặt đúng.\n- **OQ** – xác nhận vận hành trong giới hạn.\n- **PQ** – xác nhận hiệu năng thực tế với sản phẩm.\n\n*(Bài viết demo.)*',
 E'## Qualification steps\n\n- **DQ** – confirm the design meets the URS.\n- **IQ** – confirm correct installation.\n- **OQ** – confirm operation within limits.\n- **PQ** – confirm real performance with product.\n\n*(Demo article.)*',
 'published', now() - interval '10 days')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Banners (no image -> brand gradient is used)
-- ---------------------------------------------------------------------------
insert into public.banners
  (title_vi, title_en, subtitle_vi, subtitle_en, button_text_vi, button_text_en, link_url, sort_order, is_active)
select * from (values
 ('Thiết bị sản xuất dược phẩm đạt chuẩn GMP', 'GMP-compliant pharmaceutical manufacturing equipment',
  'Đóng vỉ · Đóng hộp · Đóng nang · Dập viên · Bao phim', 'Blister · Cartoning · Capsule · Tablet · Coating',
  'Xem sản phẩm', 'View products', '/products', 10, true),
 ('Dây chuyền liên động đóng vỉ – đóng hộp', 'Interlocked blister & cartoning lines',
  'Giảm nhân công, tăng năng suất và độ ổn định', 'Less labour, higher output and consistency',
  'Nhận báo giá', 'Request a quote', '/contact', 20, true)
) as v(a,b,c,d,e,f,g,h,i)
where not exists (select 1 from public.banners);
