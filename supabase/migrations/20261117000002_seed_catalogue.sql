insert into public.categories (name, slug, icon, sort) values
  ('Mobility aids', 'mobility-aids', 'accessibility', 1),
  ('Health monitoring', 'health-monitoring', 'activity', 2),
  ('Personal care & hygiene', 'personal-care', 'droplets', 3),
  ('Nutrition & groceries', 'nutrition', 'apple', 4),
  ('Home & bedroom', 'home-bedroom', 'bed', 5),
  ('First aid', 'first-aid', 'cross', 6),
  ('Clothing & comfort', 'clothing', 'shirt', 7),
  ('Local crafts & gifts', 'crafts-gifts', 'gift', 8);

insert into public.stores (name, slug, description, phone, town, region, verified)
values ('Sambea Care Essentials', 'sambea-care-essentials',
  'Everyday care supplies chosen by the Sambea Son and Daughter Home Care team in Assin Foso. Delivery across Assin Foso and the Central Region.',
  '', 'Assin Foso', 'Central Region', true);

with s as (select id from public.stores where slug = 'sambea-care-essentials'),
c as (select id, slug from public.categories)
insert into public.products (store_id, category_id, title, description, price, compare_at_price, stock, tags)
select s.id, c.id, v.title, v.description, v.price, v.compare_at, v.stock, v.tags
from s, (values
  ('mobility-aids', 'Foldable aluminium walking frame', 'Lightweight walking frame with adjustable height and non-slip rubber tips. Folds flat for travel and storage.', 420.00, 480.00, 12, array['walker','elderly']),
  ('mobility-aids', 'Adjustable walking stick with quad base', 'Four-point base stands on its own and gives extra stability on uneven ground.', 150.00, null::numeric, 20, array['cane','balance']),
  ('mobility-aids', 'Standard folding wheelchair', 'Steel frame, padded seat, detachable footrests. Suitable for home and short outings.', 2350.00, 2600.00, 4, array['wheelchair']),
  ('health-monitoring', 'Digital upper-arm blood pressure monitor', 'One-button reading with large display and memory for two users. Batteries included.', 380.00, null, 15, array['bp','hypertension']),
  ('health-monitoring', 'Glucometer starter kit', 'Blood glucose meter with 25 test strips, lancets and a carry case.', 290.00, 320.00, 18, array['diabetes']),
  ('health-monitoring', 'Fingertip pulse oximeter', 'Reads oxygen saturation and pulse rate in seconds.', 160.00, null, 25, array['spo2']),
  ('personal-care', 'Adult diapers — large (pack of 10)', 'Breathable, high-absorbency adult briefs with wetness indicator.', 95.00, null, 60, array['incontinence']),
  ('personal-care', 'Disposable bed pads (pack of 20)', 'Protect mattresses and chairs. 60 × 90 cm.', 85.00, null, 40, array['bed','hygiene']),
  ('personal-care', 'No-rinse bathing wipes (pack of 8)', 'Warmable cleansing cloths for bed baths.', 55.00, null, 50, array['bathing']),
  ('home-bedroom', 'Shower chair with backrest', 'Rust-proof aluminium shower seat with height adjustment.', 340.00, null, 8, array['bathroom','safety']),
  ('home-bedroom', 'Pressure-relief air mattress overlay', 'Alternating air cells reduce the risk of bed sores. Includes quiet pump.', 890.00, 990.00, 5, array['bedsores']),
  ('first-aid', 'Home first aid kit (75 pieces)', 'Plasters, gauze, bandages, gloves, antiseptic wipes and scissors in a sturdy case.', 135.00, null, 30, array['first aid']),
  ('nutrition', 'Nutritional supplement drink — vanilla (400 g)', 'Complete nutrition for older adults and people recovering from illness.', 175.00, null, 22, array['nutrition']),
  ('clothing', 'Non-slip grip socks (3 pairs)', 'Cushioned socks with rubber grips to reduce falls at home.', 60.00, null, 45, array['falls'])
) as v(cat, title, description, price, compare_at, stock, tags)
join c on c.slug = v.cat;

-- `featured` is admin-only; seed it as an internal change.
select set_config('app.internal', 'on', true);
update public.products set featured = true where title in ('Digital upper-arm blood pressure monitor','Foldable aluminium walking frame','Home first aid kit (75 pieces)','Pressure-relief air mattress overlay');
