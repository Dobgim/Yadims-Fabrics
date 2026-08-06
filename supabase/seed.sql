-- =====================================================================
-- Seed data for YADIMS Fabrics & Seams
--
-- Mirrors src/data/catalogue.ts so a freshly provisioned database matches
-- what the storefront already shows. Safe to re-run: every insert is
-- idempotent on its slug.
--
-- Image paths point at files committed in `public/`, so they resolve on
-- any deployment without depending on a third-party CDN.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Categories — the fabric types actually stocked
-- ---------------------------------------------------------------------
insert into public.categories (name, slug, description, image_url, position, is_featured) values
  ('Italian Silk', 'italian-silk', 'Charmeuse, mikado and duchess satin woven in Como. Bought direct, which is why it sits below imported equivalents.', '/fabrics/cat-silk.jpg', 1, true),
  ('Stone & Beaded Lace', 'stone-beaded-lace', 'Hand-set stones, pearls and glass beading on a net ground. The most requested cloth in the shop.', '/fabrics/cat-stone-lace.jpg', 2, true),
  ('Jacquard', 'jacquard', 'Motifs woven into the cloth rather than printed on it, so the pattern reads from both faces and never lifts.', '/fabrics/cat-jacquard.jpg', 3, true),
  ('Brocade & Organza Brocade', 'brocade', 'Metallic-thread brocade with the weight for ceremony, plus organza brocade where the motif floats on a sheer ground.', '/fabrics/cat-brocade.jpg', 4, true),
  ('Organza', 'organza', 'Crisp sheers that hold their own volume — where chiffon falls, organza stands.', '/fabrics/cat-organza.jpg', 5, true),
  ('Crepe', 'crepe', 'Matte, pebbled and forgiving. The workhorse of a well-made wardrobe.', '/fabrics/cat-crepe.jpg', 6, true),
  ('Chiffon', 'chiffon', 'Featherweight sheers that move with the wearer.', '/fabrics/cat-chiffon.jpg', 7, true),
  ('Linen', 'linen', 'Stone-washed European flax that arrives already softened. Breathable in real heat.', '/fabrics/cat-linen-new.jpg', 8, true),
  ('Ankara', 'ankara', 'Genuine double-sided wax, sold as a full six-yard piece. Matched dye lots held for aso-ebi parties.', '/fabrics/cat-wax.jpg', 9, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Collections — grouped by what the cloth is for
-- ---------------------------------------------------------------------
insert into public.collections (name, slug, tagline, description, cover_image_url, accent_image_url, position, is_featured) values
  ('Stone & Beaded Lace', 'stone-lace', 'Hand-set, endlessly detailed',
   'The most requested cloth in the shop. Stones, pearls and glass beading set by hand on a fine net ground.',
   '/fabrics/col-stone-lace-cover.jpg', '/fabrics/col-stone-lace-accent.jpg', 1, true),
  ('Wedding Collection', 'wedding', 'For the day everything is measured against',
   'Everything a wedding party needs under one roof: gown fabrics, aso-ebi in matched dye lots, and lining that behaves under studio light.',
   '/fabrics/col-wedding.jpg', '/fabrics/col-wedding-accent.jpg', 2, true),
  ('Traditional Collection', 'traditional', 'Heritage cloth, honestly sourced',
   'Wax prints, brocade and hand-stamped adire bought directly from the mills and artisan houses that make them.',
   '/fabrics/col-traditional.jpg', '/fabrics/col-traditional-accent.jpg', 3, true),
  ('Evening Collection', 'evening', 'Cloth that catches the light',
   'Duchess satin, silk crepe and metallic jacquard — fabrics with enough body to hold a silhouette across a long night.',
   '/fabrics/col-evening.jpg', '/fabrics/col-evening-accent.jpg', 4, true),
  ('Bridal Collection', 'bridal', 'Ivory, blush and every white in between',
   'Twelve distinct whites, swatched side by side, so you can choose against skin tone rather than against a screen.',
   '/fabrics/col-bridal.jpg', '/fabrics/col-bridal-accent.jpg', 5, true),
  ('Premium Collection', 'premium', 'The top of the house',
   'Limited-length bolts from European and Asian mills. When a premium piece sells out, it rarely returns.',
   '/fabrics/col-premium.jpg', '/fabrics/col-premium-accent.jpg', 6, true),
  ('New Arrivals', 'new-arrivals', 'Just off the bolt',
   'The most recent additions to the shelves, updated as stock lands.',
   '/fabrics/col-new.jpg', '/fabrics/col-new-accent.jpg', 7, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Products
--
-- One representative line per category. category_id / collection_id are
-- resolved by slug so this file has no dependency on generated UUIDs.
-- Add the rest of the shelf through the dashboard.
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
  ('Italian Silk Charmeuse', 'italian-silk-charmeuse', 'YF-0001',
   '19 momme charmeuse with a lacquered face and matte crepe reverse.',
   'Grade 6A filament woven at 19 momme in Como. Heavy enough to fall in a clean column, light enough for a bias cut. The satin face has a wet shine; the reverse is a soft crepe, so a single fabric gives you two finishes in one garment.',
   46500::numeric, 52000::numeric, '100% Mulberry silk', 140::numeric, 92::numeric,
   'Dry clean recommended. Hand wash cold with pH-neutral soap if you must; hang to dry away from direct sun.',
   'Woven in Como, Italy',
   array['Champagne','Emerald','Onyx','Bordeaux','Pearl'], array['italian silk','charmeuse','premium'],
   array['/fabrics/p-silk-teal.jpg','/fabrics/p-silk-navy.jpg'],
   54, 'italian-silk', 'premium', true, false, 4.9::numeric, 12),

  ('Stone-Beaded French Lace', 'stone-beaded-french-lace', 'YF-0002',
   'Hand-set stones and pearls on a fine French net.',
   'Every stone is set by hand, which is the reason no two metres are quite identical. The net ground is fine enough to disappear against skin, so the beading appears to sit directly on the wearer.',
   96500::numeric, null::numeric, 'Nylon net, glass stone, pearl', 130::numeric, 240::numeric,
   'Dry clean by a specialist familiar with beaded goods. Store rolled, never folded.',
   'Net milled in France, beaded by hand in India',
   array['Ivory','Champagne','Silver','Blush'], array['stone lace','beaded','bridal','premium'],
   array['/fabrics/p-stone-pearl.jpg','/fabrics/p-stone-bridal.jpg'],
   11, 'stone-beaded-lace', 'stone-lace', true, false, 5.0::numeric, 7),

  ('Metallic Jacquard', 'metallic-jacquard', 'YF-0003',
   'Woven-in metallic motif with real ceremonial weight.',
   'The pattern is woven rather than printed, so it appears on both faces and will never crack or lift. Weighty enough for agbada, kaftan and full ceremonial skirts.',
   44500::numeric, null::numeric, 'Viscose / Metallic thread', 145::numeric, 250::numeric,
   'Dry clean only. Press on the reverse at a low temperature.',
   'Woven in India',
   array['Antique Gold','Rose Gold','Emerald Gold','Royal Multi'], array['jacquard','metallic','evening'],
   array['/fabrics/p-jacquard-metallic.jpg','/fabrics/p-jacquard-pattern.jpg'],
   34, 'jacquard', 'evening', true, false, 4.8::numeric, 10),

  ('Organza Brocade', 'organza-brocade', 'YF-0004',
   'A brocade motif floating on a sheer organza ground.',
   'All the presence of a brocade with none of the weight — the metallic motif is woven onto a crisp organza, so the cloth stands away from the body while remaining translucent between the figures.',
   52000::numeric, null::numeric, 'Organza ground, metallic thread', 135::numeric, 120::numeric,
   'Dry clean. Steam only; a hot plate will flatten the ground.',
   'Woven in India',
   array['Champagne Gold','Ivory Silver','Blush Gold','Emerald Gold'], array['brocade','organza','premium'],
   array['/fabrics/p-organza-peach.jpg','/fabrics/p-brocade-detail.jpg'],
   16, 'brocade', 'premium', true, true, 5.0::numeric, 6),

  ('Silk Organza', 'silk-organza', 'YF-0005',
   'True silk organza — crisper, finer and far more alive than polyester.',
   'Silk organza has a spring that no synthetic reproduces: it creases sharply, holds a pleat, and recovers. Used as interfacing by couture houses as often as it is used as a face fabric.',
   34500::numeric, null::numeric, '100% Silk organza', 140::numeric, 40::numeric,
   'Dry clean. Press on the lowest setting under a cloth.',
   'Woven in China',
   array['Ivory','Champagne','Powder Blue','Onyx'], array['organza','silk','premium','sheer'],
   array['/fabrics/p-organza-blue.jpg','/fabrics/p-organza-black.jpg'],
   29, 'organza', 'premium', true, false, 4.9::numeric, 7),

  ('Silk Crepe', 'silk-crepe', 'YF-0006',
   'Matte silk crepe with a fine pebbled surface and heavy fall.',
   'The fabric to reach for when a garment must look expensive without shining. A dry, pebbled hand, a weight that falls straight, and no glare under camera.',
   37500::numeric, null::numeric, '100% Silk crepe', 140::numeric, 110::numeric,
   'Dry clean. Press on the reverse at a low temperature.',
   'Woven in Italy',
   array['Sage','Ivory','Terracotta','Onyx','Bordeaux'], array['crepe','silk','premium'],
   array['/fabrics/p-crepe-sage.jpg','/fabrics/p-crepe-ivory.jpg'],
   43, 'crepe', 'premium', true, false, 4.9::numeric, 11),

  ('Silk Chiffon', 'silk-chiffon', 'YF-0007',
   'Featherweight silk sheer with a faint grainy texture.',
   'Airy, matte and slightly crisp rather than slippery. Ideal for layered overskirts, floating sleeves and anything meant to move on its own.',
   29500::numeric, null::numeric, '100% Silk', 140::numeric, 45::numeric,
   'Dry clean. Press on the lowest setting under a cloth.',
   'Woven in China',
   array['Blush','Ivory','Dusty Rose','Charcoal','Sea Glass'], array['chiffon','silk','sheer'],
   array['/fabrics/p-chiffon-blue.jpg','/fabrics/p-chiffon-lilac.jpg'],
   58, 'chiffon', 'evening', true, false, 4.7::numeric, 10),

  ('Washed European Linen', 'washed-european-linen', 'YF-0008',
   'Stone-washed flax that arrives already softened.',
   'Pre-washed at the mill, so it has done most of its shrinking and all of its softening before you cut it. Mid-weight — substantial enough for a structured shirt or unlined jacket, still breathable in real heat.',
   23500::numeric, null::numeric, '100% Linen', 145::numeric, 185::numeric,
   'Machine wash warm. Tumble dry low and remove slightly damp; the creases are part of it.',
   'Woven in Lithuania',
   array['Natural','Cream','Sage','Terracotta','Ink'], array['linen','natural','tailoring'],
   array['/fabrics/p-linen-cream.jpg','/fabrics/p-linen-natural.jpg'],
   104, 'linen', 'premium', true, false, 4.8::numeric, 21),

  ('Premium Wax Print — Royal', 'premium-wax-print-royal', 'YF-0009',
   'Full six-yard piece, true wax, matched dye lots available.',
   'Genuine double-sided wax with the crackle veining that only comes from a real resist process — the colour reads identically from either face. Sold as a full six-yard piece.',
   24000::numeric, null::numeric, '100% Cotton', 118::numeric, 160::numeric,
   'Machine wash cold, inside out, with like colours. Iron while slightly damp.',
   'Printed in Ghana',
   array['Indigo','Ochre','Emerald','Crimson'], array['ankara','wax','traditional'],
   array['/fabrics/p-wax-1.jpg','/fabrics/p-wax-3.jpg'],
   86, 'ankara', 'traditional', true, false, 4.8::numeric, 24)
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
  ('The Bolt Wall', 'Floor to ceiling, sorted by weight rather than colour.', '/fabrics/g-shop-2.jpg', 'Store', 'portrait', 0),
  ('Silk Shelf', 'Charmeuse and duchess satin, folded on the bias.', '/fabrics/g-shelf-silk.jpg', 'Fabric Displays', 'portrait', 1),
  ('The Lace Table', 'Where every bridal decision actually gets made.', '/fabrics/g-lace-table.jpg', 'Fabric Displays', 'landscape', 2),
  ('Cotton Rolls', 'Solid cottons and poplins in forty shades.', '/fabrics/g-cotton-rolls.jpg', 'New Stock', 'portrait', 3),
  ('Stone Lace, Under Light', 'Hand-set stones on a fine net ground.', '/fabrics/p-stone-pearl.jpg', 'Fabric Displays', 'square', 4),
  ('Wax, Worn', 'A six-yard piece, cut and sewn by a customer.', '/fabrics/p-wax-1.jpg', 'Customer Showcase', 'portrait', 5),
  ('At the Machine', 'The part nobody photographs and everybody feels.', '/fabrics/g-tailor-1.jpg', 'Events', 'landscape', 6),
  ('Finishing', 'A hem pressed before it leaves the counter.', '/fabrics/g-tailor-2.jpg', 'Customer Showcase', 'portrait', 7),
  ('Opening Up', 'The shop at eight in the morning.', '/fabrics/g-shop-3.jpg', 'Events', 'landscape', 8)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------
insert into public.settings (key, value) values
  ('shipping', '{"free_threshold": 50000, "local_fee": 2500, "national_fee": 4500, "currency": "XAF"}'::jsonb),
  ('store', '{"name": "YADIMS Fabrics & Seams", "tagline": "The Art of Fine Fabrics", "city": "Yaoundé", "address": "Tam-Tam, Opposite Bali Hotel"}'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Promote your first account to admin
--
-- Sign up through /sign-up, then run this with your address:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------
