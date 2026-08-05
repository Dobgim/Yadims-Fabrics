-- =====================================================================
-- Seed data for YADIMS Fabrics & Seams
--
-- Mirrors src/data/catalogue.ts and src/data/content.ts so a freshly
-- provisioned database matches what the storefront shows before Supabase
-- is connected. Safe to re-run: every insert is idempotent on its slug.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------
insert into public.categories (name, slug, description, image_url, position, is_featured) values
  ('Lace', 'lace', 'Corded, beaded and chantilly laces chosen for their hand-finished detail and drape.', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1400&q=80', 1, true),
  ('Silk & Satin', 'silk-satin', 'Mulberry silks, duchess satins and crepe-backed weaves with a liquid fall.', 'https://images.unsplash.com/photo-1524292332709-b33366a7f165?auto=format&fit=crop&w=1400&q=80', 2, true),
  ('Bridal', 'bridal', 'Tulle, mikado and beaded appliqué for the gown that only happens once.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=80', 3, true),
  ('African Prints', 'african-prints', 'Wax prints, kente-inspired weaves and hand-stamped adire from trusted mills.', 'https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&w=1400&q=80', 4, true),
  ('Velvet', 'velvet', 'Silk-blend and stretch velvets with a deep, even pile.', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=80', 5, false),
  ('Linen & Cotton', 'linen-cotton', 'Breathable naturals for tailoring, resortwear and everyday elegance.', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1400&q=80', 6, false),
  ('Chiffon & Georgette', 'chiffon-georgette', 'Featherweight sheers that move with the wearer.', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80', 7, false),
  ('Brocade & Jacquard', 'brocade-jacquard', 'Woven-in motifs with metallic thread, cut for ceremony.', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1400&q=80', 8, false)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Collections
-- ---------------------------------------------------------------------
insert into public.collections (name, slug, tagline, description, cover_image_url, accent_image_url, position, is_featured) values
  ('Luxury Lace', 'luxury-lace', 'Hand-finished, endlessly detailed',
   'Our most requested house category. French-corded, Swiss-embroidered and beaded laces selected for the weight of the cord and the honesty of the finish — the two things a photograph cannot show you.',
   'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1400&q=80',
   'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80', 1, true),
  ('Wedding Collection', 'wedding', 'For the day everything is measured against',
   'Everything a wedding party needs under one roof: gown fabrics, aso-ebi in matched dye lots, and lining that behaves under studio light.',
   'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
   'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=80', 2, true),
  ('Traditional Collection', 'traditional', 'Heritage cloth, honestly sourced',
   'Wax prints, brocade and hand-stamped adire bought directly from mills and artisan houses we have worked with for years.',
   'https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&w=1400&q=80',
   'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1400&q=80', 3, true),
  ('Evening Collection', 'evening', 'Cloth that catches the light',
   'Duchess satin, silk velvet and metallic jacquard — fabrics with enough body to hold a silhouette across a long night.',
   'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=80',
   'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1400&q=80', 4, true),
  ('Bridal Collection', 'bridal', 'Ivory, blush and every white in between',
   'Twelve distinct whites, swatched side by side, so you can choose against skin tone rather than against a screen.',
   'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=80',
   'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80', 5, true),
  ('Premium Collection', 'premium', 'The top of the house',
   'Limited-length bolts from European and Asian mills. When a premium piece sells out, it rarely returns.',
   'https://images.unsplash.com/photo-1524292332709-b33366a7f165?auto=format&fit=crop&w=1400&q=80',
   'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1400&q=80', 6, true),
  ('New Arrivals', 'new-arrivals', 'Just off the bolt',
   'The most recent additions to the shelves, updated as stock lands.',
   'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80',
   'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1400&q=80', 7, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Products
--
-- category_id / collection_id are resolved by slug so this file has no
-- dependency on generated UUIDs.
-- ---------------------------------------------------------------------
insert into public.products (
  name, slug, sku, short_description, description, price, compare_at_price, currency, unit,
  material, width_cm, weight_gsm, care_instructions, origin, colors, tags, images,
  stock_quantity, category_id, collection_id, status, is_featured, is_new_arrival,
  rating_average, rating_count
)
select
  v.name, v.slug, v.sku, v.short_description, v.description, v.price, v.compare_at_price,
  'XAF', 'yard', v.material, v.width_cm, v.weight_gsm, v.care_instructions, v.origin,
  v.colors, v.tags, v.images, v.stock_quantity,
  (select id from public.categories c where c.slug = v.category_slug),
  (select id from public.collections co where co.slug = v.collection_slug),
  'active', v.is_featured, v.is_new_arrival, v.rating_average, v.rating_count
from (values
  ('Alençon Corded Lace', 'alencon-corded-lace-ivory', 'YF-0001',
   'French-style corded lace with a scalloped double border.',
   'A true Alençon construction: fine net ground, dense floral motif, and a raised cotton cord tracing every outline. Both selvedges are finished with a deep scallop, so a skirt hem or sleeve edge needs no additional trim. Cuts cleanly and holds an appliqué without fraying.',
   48000::numeric, 56000::numeric, 'Nylon / Cotton cord', 130::numeric, 150::numeric,
   'Dry clean only. If pressing at home, use a cool iron over a cotton press cloth and never rest the plate on the cord.',
   'Milled in France, finished in Lyon',
   array['Ivory','Champagne','Blush','Powder Blue'], array['lace','bridal','premium'],
   array['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80'],
   42, 'lace', 'luxury-lace', true, false, 4.9::numeric, 28),

  ('Beaded Chantilly Lace', 'beaded-chantilly-lace', 'YF-0002',
   'Hand-beaded chantilly with glass seed beads and matte sequins.',
   'Each motif is beaded by hand — the reason no two metres are quite identical. Glass seed beads catch tungsten and daylight differently, which is why we recommend swatching under the light you will actually be photographed in. Sold in continuous lengths.',
   76500::numeric, null::numeric, 'Nylon net, glass bead, sequin', 125::numeric, 190::numeric,
   'Dry clean by a specialist familiar with beaded goods. Store rolled, never folded.',
   'Hand-beaded in India',
   array['Ivory','Silver','Antique Gold'], array['lace','beaded','premium','bridal'],
   array['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=80'],
   14, 'lace', 'premium', true, false, 5.0::numeric, 11),

  ('Mulberry Silk Charmeuse', 'mulberry-silk-charmeuse', 'YF-0003',
   '19 momme charmeuse with a lacquered face and matte reverse.',
   'Grade 6A mulberry filament woven at 19 momme — heavy enough to fall in a clean column, light enough for a bias cut. The satin face has a wet shine; the reverse is a soft crepe, so a single fabric gives you two finishes in one garment.',
   39500::numeric, null::numeric, '100% Mulberry silk', 140::numeric, 92::numeric,
   'Dry clean recommended. Hand wash cold with pH-neutral soap if you must; hang to dry away from direct sun.',
   'Woven in Hangzhou',
   array['Champagne','Emerald','Onyx','Bordeaux','Pearl'], array['silk','premium','evening'],
   array['https://images.unsplash.com/photo-1524292332709-b33366a7f165?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1400&q=80'],
   68, 'silk-satin', 'premium', true, false, 4.8::numeric, 34),

  ('Italian Bridal Mikado', 'italian-bridal-mikado', 'YF-0005',
   'Crisp mikado with a subdued lustre and remarkable body.',
   'Mikado sits between satin and faille: it has the sheen of one and the structure of the other. Pleats hold their fold, seams press flat, and the surface is matte enough that studio flash reads as light rather than glare.',
   58000::numeric, null::numeric, 'Silk / Wool blend', 145::numeric, 250::numeric,
   'Dry clean only. Store hanging, on a padded hanger.',
   'Woven in Italy',
   array['Ivory','Diamond White','Oyster'], array['bridal','premium','structured'],
   array['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80'],
   21, 'bridal', 'bridal', true, false, 4.9::numeric, 17),

  ('Premium Wax Print — Royal', 'premium-wax-print-royal', 'YF-0007',
   'Full six-yard piece, true wax, matched dye lots available.',
   'Genuine double-sided wax with the crackle veining that only comes from a real resist process — the colour reads identically from either face. Sold as a full six-yard piece; tell us your headcount and we will hold matching dye lots for an aso-ebi party.',
   22000::numeric, null::numeric, '100% Cotton', 118::numeric, 160::numeric,
   'Machine wash cold, inside out, with like colours. Iron while slightly damp.',
   'Printed in Ghana',
   array['Indigo','Ochre','Emerald','Crimson'], array['wax','traditional','cotton'],
   array['https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1400&q=80'],
   86, 'african-prints', 'traditional', true, false, 4.8::numeric, 41),

  ('Hand-Stamped Adire', 'hand-stamped-adire', 'YF-0008',
   'Artisan indigo resist-dyed by hand, no two lengths alike.',
   'Stamped and dyed by an artisan cooperative we buy from directly. The irregularities are the point — slight bleeding at a motif edge is evidence of a hand process, not a fault. Expect gentle indigo transfer on first wear.',
   26500::numeric, null::numeric, 'Cotton', 115::numeric, null::numeric,
   'Hand wash separately in cold water for the first three washes. Dry in shade.',
   'Hand-dyed in Abeokuta, Nigeria',
   array['Indigo','Deep Navy','Slate'], array['adire','artisan','traditional'],
   array['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&w=1400&q=80'],
   30, 'african-prints', 'traditional', false, true, 4.9::numeric, 15),

  ('Silk-Blend Velvet', 'silk-blend-velvet', 'YF-0009',
   'Fluid viscose-pile velvet with genuine depth of colour.',
   'A viscose pile on a silk ground, which is what gives this its liquid drape — it pours rather than stands. The pile has a clear direction, so cut every piece facing the same way or the panels will read as two different colours.',
   44000::numeric, 49000::numeric, 'Silk / Viscose', 140::numeric, 260::numeric,
   'Dry clean only. Steam from the reverse, hanging; never press the pile flat.',
   'Woven in Italy',
   array['Emerald','Bordeaux','Midnight','Espresso'], array['velvet','evening','premium'],
   array['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1400&q=80'],
   27, 'velvet', 'evening', true, false, 4.9::numeric, 23),

  ('Washed European Linen', 'washed-european-linen', 'YF-0011',
   'Stone-washed flax that arrives already softened.',
   'Pre-washed at the mill, so it has done most of its shrinking and all of its softening before you cut it. Mid-weight — substantial enough for a structured shirt or unlined jacket, still breathable in real heat.',
   21500::numeric, null::numeric, '100% Linen', 145::numeric, 185::numeric,
   'Machine wash warm. Tumble dry low and remove slightly damp; the creases are part of it.',
   'Woven in Lithuania',
   array['Natural','Sage','Terracotta','Chalk','Ink'], array['linen','natural','tailoring'],
   array['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=1400&q=80'],
   110, 'linen-cotton', 'premium', false, true, 4.8::numeric, 46),

  ('Metallic Brocade — Gold', 'metallic-brocade-gold', 'YF-0015',
   'Woven-in metallic motif with a substantial ceremonial weight.',
   'The pattern is woven rather than printed, so it appears on both faces and will never crack or lift. Weighty enough for agbada, kaftan and full ceremonial skirts, and the metallic thread stays supple instead of scratching.',
   41000::numeric, null::numeric, 'Viscose / Metallic thread', 140::numeric, 240::numeric,
   'Dry clean only. Press on the reverse at a low temperature.',
   'Woven in India',
   array['Antique Gold','Rose Gold','Emerald Gold'], array['brocade','ceremony','traditional'],
   array['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80'],
   38, 'brocade-jacquard', 'traditional', true, false, 4.8::numeric, 20),

  ('Bouclé Tweed — Cream', 'tweed-boucle-cream', 'YF-0024',
   'Loopy bouclé with a fine metallic thread running through.',
   'A classic jacketing bouclé with just enough metallic to lift it under evening light. Loosely woven, so overlock or bind every edge as you cut. Rewards a fringed trim rather than a turned hem.',
   38500::numeric, null::numeric, 'Wool / Cotton / Metallic', 145::numeric, 300::numeric,
   'Dry clean only. Steam gently to reshape.',
   'Woven in France',
   array['Cream Gold','Black White','Blush Silver'], array['tweed','tailoring','premium'],
   array['https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=1400&q=80',
         'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80'],
   24, 'linen-cotton', 'premium', true, false, 4.9::numeric, 10)
) as v(
  name, slug, sku, short_description, description, price, compare_at_price, material,
  width_cm, weight_gsm, care_instructions, origin, colors, tags, images, stock_quantity,
  category_slug, collection_slug, is_featured, is_new_arrival, rating_average, rating_count
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------
insert into public.gallery_items (title, caption, image_url, category, aspect, position) values
  ('The Bolt Wall', 'Nine hundred bolts, sorted by hand every Monday morning.', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=80', 'Store', 'portrait', 0),
  ('Front of House', 'Packaged lengths held for collection, against the full display wall.', '/shop/display-wall.jpg', 'Store', 'portrait', 1),
  ('Lace Table', 'Where every lace decision actually gets made.', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80', 'Fabric Displays', 'portrait', 2),
  ('Silk Column', 'Nineteen momme charmeuse, falling as it should.', 'https://images.unsplash.com/photo-1524292332709-b33366a7f165?auto=format&fit=crop&w=1200&q=80', 'Fabric Displays', 'portrait', 3),
  ('Twelve Whites', 'Our bridal swatch board — no two the same.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80', 'New Stock', 'landscape', 4),
  ('Wax Arrival', 'A Ghanaian delivery, still in its wrap.', 'https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&w=1200&q=80', 'New Stock', 'portrait', 5),
  ('Velvet Corner', 'Silk-blend velvet in four house colours.', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80', 'Fabric Displays', 'portrait', 6),
  ('The Kounde Wedding', 'Our mikado, cut by Atelier Mbala.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 'Customer Showcase', 'landscape', 7),
  ('Trunk Show', 'Designers previewing next season''s laces.', 'https://images.unsplash.com/photo-1558769132-92e717d613cd?auto=format&fit=crop&w=1200&q=80', 'Events', 'landscape', 8)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------
insert into public.settings (key, value) values
  ('shipping', '{"free_threshold": 50000, "douala_fee": 2500, "national_fee": 4500, "currency": "XAF"}'::jsonb),
  ('store', '{"name": "YADIMS Fabrics & Seams", "tagline": "The Art of Fine Fabrics", "city": "Yaoundé", "address": "Tam-Tam, Opposite Bali Hotel"}'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Promote your first account to admin
--
-- Sign up through /sign-up, then run this with your address:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------
