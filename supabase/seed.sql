-- Seed data for initial setup

-- ============================================================
-- DELIVERY ZONES
-- ============================================================
INSERT INTO delivery_zones (name, postal_codes, min_order_amount, delivery_fee, estimated_delivery_minutes) VALUES
('Κέντρο',           ARRAY['10431','10432','10433','10434','10436','10437','10438','10439','11471','11472','11473','11474','11475','11476'], 15.00, 2.50, 45),
('Βόρεια Προάστια',  ARRAY['15121','15122','15123','15124','15125','15126','15127','15128','14121','14122','14123'],                        20.00, 3.00, 60),
('Νότια Προάστια',   ARRAY['16671','16672','16673','16674','16675','16676','17121','17122','17123','17124'],                                20.00, 3.00, 60);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, description, display_order) VALUES
('Μοσχάρι',          'mosxari',          'Φρέσκα μοσχαρίσια κρέατα και κοπές',         1),
('Αρνί & Κατσίκι',   'arni-katsiki',     'Αμνοερίφια — αρνί, πρόβατο, ζυγούρι, γίδα', 2),
('Χοιρινό',          'xoirino',          'Φρέσκα χοιρινά κρέατα και κοπές',            3),
('Πουλερικά',        'poulerika',        'Κοτόπουλο, κόκορας και πουλερικά',            4),
('Παρασκευάσματα',   'paraskeyasmata',   'Έτοιμα παρασκευάσματα από το χασάπη',        5);

-- ============================================================
-- PRODUCTS
-- ============================================================

-- ── ΜΟΣΧΑΡΙ (cuts) ──────────────────────────────────────────
INSERT INTO products (category_id, name, slug, description, origin, price_per_kg, stock_grams, product_type) VALUES
((SELECT id FROM categories WHERE slug='mosxari'), 'Ελιά',                             'mosxari-elia',                     'Μοσχαρίσια ελιά',                              'Ελλάδα', 17.90, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Σπάλα μοσχαρίσια',                'mosxari-spala',                    'Μοσχαρίσια σπάλα',                             'Ελλάδα', 17.90, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Κιλότο',                           'mosxari-kiloto',                   'Μοσχαρίσιο κιλότο',                            'Ελλάδα', 17.90, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Στρογγυλό',                        'mosxari-strongilo',                'Μοσχαρίσιο στρογγυλό',                         'Ελλάδα', 17.90, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Τρανς',                            'mosxari-trans',                    'Μοσχαρίσιο τρανς',                             'Ελλάδα', 17.90, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Ουρά',                             'mosxari-oura',                     'Μοσχαρίσια ουρά',                              'Ελλάδα', 17.90,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Ποντίκι',                          'mosxari-pontiki',                  'Μοσχαρίσιο ποντίκι',                           'Ελλάδα', 18.50,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Χτένι',                            'mosxari-xteni',                    'Μοσχαρίσιο χτένι',                             'Ελλάδα', 18.50,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Τορτουκίτα',                       'mosxari-tortukita',                'Μοσχαρίσια τορτουκίτα',                        'Ελλάδα', 18.50,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Νουά',                             'mosxari-noua',                     'Μοσχαρίσιο νουά',                              'Ελλάδα', 18.50,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Σπαλομύτα',                        'mosxari-spalomita',                'Μοσχαρίσια σπαλομύτα',                         'Ελλάδα', 18.50,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Σιδηρόδρομος (με κόκκαλο)',        'mosxari-sidirodromos',             'Μοσχάρι σιδηρόδρομος με κόκκαλο',             'Ελλάδα', 14.90, 12000, 'cut'),
((SELECT id FROM categories WHERE slug='mosxari'), 'Στήθος μοσχαρίσιο με κόκκαλο',    'mosxari-stithos-kokkalo',          'Μοσχαρίσιο στήθος με κόκκαλο',                'Ελλάδα', 14.90, 12000, 'cut');

-- ── ΑΡΝΙ & ΚΑΤΣΙΚΙ ──────────────────────────────────────────
INSERT INTO products (category_id, name, slug, description, origin, price_per_kg, stock_grams, product_type) VALUES
((SELECT id FROM categories WHERE slug='arni-katsiki'), 'Αρνί',                           'arni',                      'Φρέσκο αρνί',                          'Ελλάδα', 18.80,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='arni-katsiki'), 'Πρόβατο Μπούτι & Σπάλα',        'provato-bouti-spala',       'Πρόβατο μπούτι και σπάλα',             'Ελλάδα', 12.90, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='arni-katsiki'), 'Φιλέτο μπούτι πρόβατο',         'provato-fileto-bouti',      'Φιλέτο μπούτι πρόβατο',               'Ελλάδα', 13.80,  6000, 'cut'),
((SELECT id FROM categories WHERE slug='arni-katsiki'), 'Παϊδάκι πρόβατο',               'provato-paidaki',           'Παϊδάκι πρόβατο',                     'Ελλάδα', 13.80,  6000, 'cut'),
((SELECT id FROM categories WHERE slug='arni-katsiki'), 'Γίδα',                           'gida',                      'Φρέσκια γίδα',                         'Ελλάδα', 14.90,  6000, 'cut'),
((SELECT id FROM categories WHERE slug='arni-katsiki'), 'Ζυγούρι',                        'zygouri',                   'Ζυγούρι',                              'Ελλάδα', 15.50,  6000, 'cut');

-- ── ΧΟΙΡΙΝΟ (cuts) ──────────────────────────────────────────
INSERT INTO products (category_id, name, slug, description, origin, price_per_kg, stock_grams, product_type) VALUES
((SELECT id FROM categories WHERE slug='xoirino'), 'Μπριζόλα χοιρινή',                   'xoirino-brizola',               'Χοιρινή μπριζόλα',                    'Ελλάδα',  7.90, 12000, 'cut'),
((SELECT id FROM categories WHERE slug='xoirino'), 'Μπριζόλα λαιμού',                    'xoirino-brizola-laimou',        'Μπριζόλα λαιμού',                     'Ελλάδα',  7.90, 12000, 'cut'),
((SELECT id FROM categories WHERE slug='xoirino'), 'Σταβλίσια χοιρινή',                  'xoirino-stavlisia',             'Σταβλίσια χοιρινή',                   'Ελλάδα',  7.90, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='xoirino'), 'Σπάλα χοιρινή',                      'xoirino-spala',                 'Χοιρινή σπάλα',                       'Ελλάδα',  7.30, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='xoirino'), 'Μπούτι χοιρινό',                     'xoirino-bouti',                 'Χοιρινό μπούτι',                      'Ελλάδα',  7.30, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='xoirino'), 'Σνίτσελ χοιρινό',                    'xoirino-snitsel',               'Χοιρινό σνίτσελ',                     'Ελλάδα',  9.90,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='xoirino'), 'Κότσι χοιρινό',                      'xoirino-kotsi',                 'Χοιρινό κότσι',                       'Ελλάδα',  9.90,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='xoirino'), 'Πανσέτα',                            'xoirino-panseta',               'Χοιρινή πανσέτα',                     'Ελλάδα',  7.80, 10000, 'cut'),
((SELECT id FROM categories WHERE slug='xoirino'), 'Μπριζόλες λαιμού χωρίς κόκκαλο',    'xoirino-brizola-laimou-boneless','Μπριζόλες λαιμού χωρίς κόκκαλο',     'Ελλάδα',  9.90,  8000, 'cut');

-- ── ΠΟΥΛΕΡΙΚΑ (cuts) ────────────────────────────────────────
INSERT INTO products (category_id, name, slug, description, origin, price_per_kg, stock_grams, product_type) VALUES
((SELECT id FROM categories WHERE slug='poulerika'), 'Κοτόπουλο ΚΙΤΡΙΝΟ ολόκληρο',      'kotopoulo-olokliro',            'Κίτρινο κοτόπουλο ολόκληρο',          'Ελλάδα',  4.50, 20000, 'cut'),
((SELECT id FROM categories WHERE slug='poulerika'), 'Μπούτι κοτόπουλο',                 'kotopoulo-bouti',               'Μπούτι κοτόπουλου',                   'Ελλάδα',  4.80, 15000, 'cut'),
((SELECT id FROM categories WHERE slug='poulerika'), 'Στήθος κοτόπουλο',                 'kotopoulo-stithos',             'Στήθος κοτόπουλου',                   'Ελλάδα',  7.90, 12000, 'cut'),
((SELECT id FROM categories WHERE slug='poulerika'), 'Κόκορας',                          'kokorasp',                      'Φρέσκος κόκορας',                     'Ελλάδα',  7.90,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='poulerika'), 'Φτερούγες κοτόπουλου',             'kotopoulo-fteruges',            'Φτερούγες κοτόπουλου',                'Ελλάδα',  3.80, 12000, 'cut'),
((SELECT id FROM categories WHERE slug='poulerika'), 'Φιλέτο μπούτι κοτόπουλο',         'kotopoulo-fileto-bouti',        'Φιλέτο μπούτι κοτόπουλου',            'Ελλάδα',  9.90,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='poulerika'), 'Φιλέτο στήθος κοτόπουλο',         'kotopoulo-fileto-stithos',      'Φιλέτο στήθος κοτόπουλου',            'Ελλάδα',  9.90,  8000, 'cut'),
((SELECT id FROM categories WHERE slug='poulerika'), 'Ολόκληρο κοτόπουλο ξεκοκαλισμένο','kotopoulo-olokliro-xekok',      'Ολόκληρο κοτόπουλο ξεκοκαλισμένο',   'Ελλάδα',  8.80,  8000, 'cut');

-- ── ΠΑΡΑΣΚΕΥΑΣΜΑΤΑ — Μοσχάρι ────────────────────────────────
INSERT INTO products (category_id, name, slug, description, origin, price_per_kg, stock_grams, product_type) VALUES
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Μπιφτέκι μοσχαρίσιο',             'mosxari-bifteki',           'Μπιφτέκι από μοσχαρίσιο κρέας',       'Ελλάδα', 14.80,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Κεμπάπ μοσχάρι/αρνί',             'mosxari-arni-kebap',        'Κεμπάπ από μοσχάρι και αρνί',         'Ελλάδα', 14.80,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Ρολό μοσχάρι',                     'mosxari-rolo',              'Ρολό από μοσχαρίσιο κρέας',           'Ελλάδα', 14.90,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Γύρος μοσχάρι',                    'mosxari-gyros',             'Γύρος μοσχαρίσιος',                   'Ελλάδα', 14.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Μοσχαρίσιο λουκάνικο',             'mosxari-loukaniko',         'Λουκάνικο μοσχαρίσιο',                'Ελλάδα', 14.90,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Σουτζούκι του χασάπη',             'mosxari-soutzouki',         'Παραδοσιακό σουτζούκι',               'Ελλάδα', 17.80,  4000, 'preparation');

-- ── ΠΑΡΑΣΚΕΥΑΣΜΑΤΑ — Χοιρινό ────────────────────────────────
INSERT INTO products (category_id, name, slug, description, origin, price_per_kg, stock_grams, product_type) VALUES
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Κοντοσούβλια χοιρινό',             'xoirino-kontosouvlia',      'Κοντοσούβλια χοιρινά',                'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Πανάρισμα σνίτσελ χοιρινό',        'xoirino-panarisma-snitsel', 'Χοιρινό σνίτσελ παναρισμένο',         'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Μπριζολάκια μαριναρισμένα',         'xoirino-brizolakia-marina', 'Μπριζολάκια χοιρινά μαριναρισμένα',   'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Πανσέτα BBQ',                       'xoirino-panseta-bbq',       'Πανσέτα BBQ',                         'Ελλάδα',  8.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Γύρος χοιρινός',                    'xoirino-gyros',             'Γύρος χοιρινός',                      'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Σουβλάκι χοιρινό',                  'xoirino-souvlaki',          'Σουβλάκι χοιρινό',                    'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Κότσι μαριναρισμένο με μπύρα',      'xoirino-kotsi-bira',        'Κότσι χοιρινό μαριναρισμένο με μπύρα','Ελλάδα',  7.90,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Κότσι με μαρινάδα και πατάτες BBQ', 'xoirino-kotsi-patates-bbq', 'Κότσι χοιρινό με μαρινάδα και πατάτες baby BBQ', 'Ελλάδα', 7.90, 6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Σπετσοφάι',                          'xoirino-spetsofai',         'Σπετσοφάι',                           'Ελλάδα',  8.90,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Λουκάνικο χοιρινό με πράσο',        'xoirino-loukaniko-praso',   'Χοιρινό λουκάνικο με πράσο',          'Ελλάδα',  9.90,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Λουκάνικο καυτερό χοιρινό',         'xoirino-loukaniko-kaytero', 'Καυτερό χοιρινό λουκάνικο',           'Ελλάδα',  9.90,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Λουκάνικο ανάμικτο χοιρινό/μοσχάρι','mixed-loukaniko',           'Ανάμικτο λουκάνικο χοιρινό/μοσχάρι', 'Ελλάδα', 11.90,  6000, 'preparation');

-- ── ΠΑΡΑΣΚΕΥΑΣΜΑΤΑ — Κοτόπουλο ──────────────────────────────
INSERT INTO products (category_id, name, slug, description, origin, price_per_kg, stock_grams, product_type) VALUES
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Μπιφτέκι κοτόπουλο',                 'kotopoulo-bifteki',         'Μπιφτέκι κοτόπουλου',                 'Ελλάδα', 11.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Ρολό κοτόπουλο',                      'kotopoulo-rolo',            'Ρολό κοτόπουλου',                     'Ελλάδα', 11.80,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Κοτομπουκιές',                        'kotopoulo-kotompoukies',    'Κοτομπουκιές',                        'Ελλάδα', 11.80,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Σνίτσελ κοτόπουλο',                   'kotopoulo-snitsel',         'Σνίτσελ κοτόπουλου',                  'Ελλάδα', 11.80,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Γύρος κοτόπουλο',                     'kotopoulo-gyros',           'Γύρος κοτόπουλου',                    'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Κοντοσούβλια κοτόπουλο',              'kotopoulo-kontosouvlia',    'Κοντοσούβλια κοτόπουλου',             'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Σουβλάκι κοτόπουλο',                  'kotopoulo-souvlaki',        'Σουβλάκι κοτόπουλου',                 'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Στήθος κοτόπουλο μαριναρισμένο',      'kotopoulo-stithos-marina',  'Μαριναρισμένο στήθος κοτόπουλου',     'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Μπούτι κοτόπουλο μαριναρισμένο',      'kotopoulo-bouti-marina',    'Μαριναρισμένο μπούτι κοτόπουλου',     'Ελλάδα',  9.90,  8000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Ταψάκι γλυκόξινο κοτόπουλο',          'kotopoulo-glukoksino',      'Ταψάκι κοτόπουλο γλυκόξινο',          'Ελλάδα',  9.90,  6000, 'preparation'),
((SELECT id FROM categories WHERE slug='paraskeyasmata'), 'Ταψάκι κοτόπουλο με κρέμα τυριών',    'kotopoulo-krema-tirion',    'Ταψάκι κοτόπουλο με κρέμα τυριών',    'Ελλάδα',  9.90,  6000, 'preparation');

-- ============================================================
-- RECIPES
-- ============================================================
INSERT INTO recipes (title, slug, description, prep_time_minutes, cook_time_minutes, servings, difficulty, meat_category, ingredients, steps, image_url) VALUES

-- ── Μοσχάρι ─────────────────────────────────────────────────
(
  'Μοσχαρίσιο Κιλότο στον Φούρνο',
  'mosxari-kiloto-fourno',
  'Παραδοσιακό μοσχαρίσιο κιλότο ψητό στον φούρνο με δεντρολίβανο και σκόρδο.',
  20, 120, 6, 'medium', 'mosxari',
  '[{"name":"Κιλότο μοσχαρίσιο","quantity":"1.5 kg"},{"name":"Ελαιόλαδο","quantity":"80 ml"},{"name":"Σκόρδο","quantity":"4 σκελίδες"},{"name":"Δεντρολίβανο","quantity":"2 κλωνάρια"},{"name":"Αλάτι & Πιπέρι","quantity":"κατά βούληση"}]',
  '[{"step":"Αλατοπιπερώνουμε καλά το κρέας από παντού."},{"step":"Ζεσταίνουμε λάδι σε κατσαρόλα και σοτάρουμε το κρέας μέχρι να ροδίσει από όλες τις πλευρές (~5 λεπτά)."},{"step":"Προσθέτουμε σκόρδο, δεντρολίβανο και 200 ml νερό."},{"step":"Ψήνουμε σκεπαστό στους 180°C για 1.5–2 ώρες μέχρι να μαλακώσει."},{"step":"Αφήνουμε να ξεκουραστεί 10 λεπτά πριν κόψουμε."}]',
  NULL
),
(
  'Μοσχαρίσιος Κιμάς με Πατάτες στον Φούρνο',
  'mosxari-kimas-patates-fourno',
  'Ένα απλό και χορταστικό οικογενειακό φαγητό με μοσχαρίσιο κιμά και πατάτες.',
  15, 60, 5, 'easy', 'mosxari',
  '[{"name":"Μοσχαρίσιος κιμάς","quantity":"700 g"},{"name":"Πατάτες","quantity":"800 g"},{"name":"Κρεμμύδι","quantity":"1 μεγάλο"},{"name":"Ντομάτα τριμμένη","quantity":"400 ml"},{"name":"Ελαιόλαδο","quantity":"60 ml"},{"name":"Αλάτι, πιπέρι, ρίγανη","quantity":"κατά βούληση"}]',
  '[{"step":"Κόβουμε τις πατάτες σε κύβους και τις στρώνουμε σε ταψί."},{"step":"Σοτάρουμε κιμά με κρεμμύδι, προσθέτουμε ντομάτα και μυρωδικά."},{"step":"Σκεπάζουμε τις πατάτες με τον κιμά."},{"step":"Ψήνουμε στους 190°C για 55–60 λεπτά μέχρι να ροδίσουν."}]',
  NULL
),

-- ── Χοιρινό ─────────────────────────────────────────────────
(
  'Χοιρινό Κότσι με Μπύρα',
  'xoirino-kotsi-bira-sintagi',
  'Μαριναρισμένο χοιρινό κότσι με μπύρα, μέλι και μουστάρδα — τραγανή επιφάνεια, μαλακό εσωτερικό.',
  15, 150, 4, 'medium', 'xoirino',
  '[{"name":"Κότσι χοιρινό","quantity":"1.2 kg"},{"name":"Μπύρα","quantity":"330 ml"},{"name":"Μέλι","quantity":"2 κ.σ."},{"name":"Μουστάρδα","quantity":"1 κ.σ."},{"name":"Σκόρδο","quantity":"3 σκελίδες"},{"name":"Ελαιόλαδο","quantity":"50 ml"}]',
  '[{"step":"Αναμειγνύουμε μπύρα, μέλι, μουστάρδα και σκόρδο για τη μαρινάδα."},{"step":"Μαρινάρουμε το κότσι για τουλάχιστον 2 ώρες (ή όλη τη νύχτα)."},{"step":"Ψήνουμε στους 160°C για 2.5 ώρες, αναποδογυρίζοντας κάθε 45 λεπτά."},{"step":"Γλασάρουμε με τη μαρινάδα τα τελευταία 20 λεπτά για τραγανή επιφάνεια."}]',
  NULL
),
(
  'Χοιρινές Μπριζόλες με Μουστάρδα και Θυμάρι',
  'xoirino-brizola-moustarda-thymari',
  'Γρήγορη και νόστιμη συνταγή για χοιρινές μπριζόλες με ξινή μαρινάδα.',
  10, 20, 4, 'easy', 'xoirino',
  '[{"name":"Χοιρινές μπριζόλες λαιμού","quantity":"4 τεμ. (~800 g)"},{"name":"Μουστάρδα Ντιζόν","quantity":"2 κ.σ."},{"name":"Θυμάρι","quantity":"1 κ.γ."},{"name":"Λεμόνι","quantity":"1"},{"name":"Ελαιόλαδο","quantity":"3 κ.σ."},{"name":"Αλάτι & Πιπέρι","quantity":"κατά βούληση"}]',
  '[{"step":"Αναμειγνύουμε μουστάρδα, θυμάρι, χυμό λεμονιού και ελαιόλαδο."},{"step":"Αλείφουμε καλά τις μπριζόλες και αφήνουμε 30 λεπτά."},{"step":"Ψήνουμε σε καυτή σχάρα ή τηγάνι 4–5 λεπτά ανά πλευρά."},{"step":"Αφήνουμε να ξεκουραστούν 3 λεπτά πριν σερβίρουμε."}]',
  NULL
),

-- ── Πουλερικά ───────────────────────────────────────────────
(
  'Κοτόπουλο Ριγανάτο',
  'kotopoulo-riganato',
  'Το κλασικό ελληνικό κοτόπουλο με ρίγανη, λεμόνι και ελαιόλαδο.',
  15, 75, 4, 'easy', 'poulerika',
  '[{"name":"Κοτόπουλο ΚΙΤΡΙΝΟ ολόκληρο","quantity":"1.2 kg"},{"name":"Ρίγανη","quantity":"2 κ.σ."},{"name":"Ελαιόλαδο","quantity":"80 ml"},{"name":"Λεμόνι","quantity":"2"},{"name":"Σκόρδο","quantity":"4 σκελίδες"},{"name":"Αλάτι & Πιπέρι","quantity":"κατά βούληση"}]',
  '[{"step":"Χαράζουμε το κοτόπουλο σε αρκετά σημεία."},{"step":"Αναμειγνύουμε ελαιόλαδο, χυμό λεμονιού, ρίγανη, σκόρδο, αλάτι, πιπέρι."},{"step":"Αλείφουμε καλά το κοτόπουλο και το αφήνουμε 30 λεπτά."},{"step":"Ψήνουμε στους 200°C για 60–75 λεπτά, αλείφοντας κάθε 20 λεπτά."}]',
  NULL
),
(
  'Φιλέτο Κοτόπουλο με Κρέμα Μανιταριών',
  'kotopoulo-fileto-krema-manitarion',
  'Τρυφερό φιλέτο κοτόπουλου με πλούσια κρέμα μανιταριών — έτοιμο σε 30 λεπτά.',
  10, 25, 4, 'easy', 'poulerika',
  '[{"name":"Φιλέτο στήθος κοτόπουλου","quantity":"600 g"},{"name":"Μανιτάρια","quantity":"300 g"},{"name":"Κρέμα γάλακτος","quantity":"200 ml"},{"name":"Βούτυρο","quantity":"30 g"},{"name":"Σκόρδο","quantity":"2 σκελίδες"},{"name":"Θυμάρι","quantity":"1 κ.γ."},{"name":"Αλάτι & Πιπέρι","quantity":"κατά βούληση"}]',
  '[{"step":"Κόβουμε τα φιλέτα σε φέτες και τα αλατοπιπερώνουμε."},{"step":"Σοτάρουμε σε βούτυρο 3 λεπτά ανά πλευρά. Βγάζουμε."},{"step":"Στο ίδιο τηγάνι σοτάρουμε σκόρδο και μανιτάρια 5 λεπτά."},{"step":"Προσθέτουμε κρέμα γάλακτος, θυμάρι και σιγοβράζουμε 3 λεπτά."},{"step":"Επιστρέφουμε το κοτόπουλο, ανακατεύουμε και σερβίρουμε αμέσως."}]',
  NULL
),

-- ── Αρνί & Κατσίκι ──────────────────────────────────────────
(
  'Αρνί στη Λαδόκολλα',
  'arni-ladokolla',
  'Μαλακό αρνί ψημένο σε λαδόκολλα με λαχανικά — το μυστικό της γιαγιάς.',
  20, 180, 6, 'medium', 'arni-katsiki',
  '[{"name":"Αρνί μπούτι ή σπάλα","quantity":"1.5 kg"},{"name":"Πατάτες","quantity":"600 g"},{"name":"Κρεμμύδια","quantity":"2"},{"name":"Σκόρδο","quantity":"6 σκελίδες"},{"name":"Δεντρολίβανο","quantity":"3 κλωνάρια"},{"name":"Ελαιόλαδο","quantity":"80 ml"},{"name":"Λεμόνι","quantity":"1"},{"name":"Αλάτι & Πιπέρι","quantity":"κατά βούληση"}]',
  '[{"step":"Χαράζουμε το αρνί και γεμίζουμε με σκόρδο και δεντρολίβανο."},{"step":"Αλατοπιπερώνουμε και περιχύνουμε με λάδι και λεμόνι."},{"step":"Τοποθετούμε σε λαδόκολλα μαζί με τις πατάτες και τα κρεμμύδια."},{"step":"Κλείνουμε καλά τη λαδόκολλα και ψήνουμε στους 160°C για 3 ώρες."},{"step":"Ανοίγουμε τη λαδόκολλα τα τελευταία 20 λεπτά για χρώμα."}]',
  NULL
),
(
  'Παϊδάκια Αρνιού στα Κάρβουνα',
  'arni-paidakia-karvouna',
  'Κλασικά παϊδάκια αρνιού σε κάρβουνα με μαρινάδα λεμονιού και ρίγανης.',
  10, 20, 4, 'easy', 'arni-katsiki',
  '[{"name":"Παϊδάκια πρόβατο","quantity":"1.2 kg"},{"name":"Λεμόνι","quantity":"2"},{"name":"Ρίγανη","quantity":"1 κ.σ."},{"name":"Ελαιόλαδο","quantity":"50 ml"},{"name":"Αλάτι & Πιπέρι","quantity":"κατά βούληση"}]',
  '[{"step":"Αναμειγνύουμε χυμό λεμονιού, ρίγανη, λάδι, αλάτι, πιπέρι."},{"step":"Μαρινάρουμε τα παϊδάκια τουλάχιστον 1 ώρα."},{"step":"Ψήνουμε σε καυτά κάρβουνα 8–10 λεπτά, γυρίζοντας συχνά."},{"step":"Σερβίρουμε με φέτες λεμονιού και φρέσκια ρίγανη."}]',
  NULL
),

-- ── Mixed ────────────────────────────────────────────────────
(
  'Σουβλάκι Μικτό',
  'souvlaki-mikto',
  'Η ελληνική κλασική — χοιρινό και κοτόπουλο στο σουβλάκι με πιτόγυρο.',
  20, 15, 6, 'easy', 'mixed',
  '[{"name":"Χοιρινό σπάλα ή λαιμός","quantity":"500 g"},{"name":"Φιλέτο στήθος κοτόπουλου","quantity":"400 g"},{"name":"Ελαιόλαδο","quantity":"50 ml"},{"name":"Ρίγανη","quantity":"1 κ.σ."},{"name":"Πάπρικα","quantity":"1 κ.γ."},{"name":"Λεμόνι","quantity":"1"},{"name":"Αλάτι & Πιπέρι","quantity":"κατά βούληση"},{"name":"Πίτες & γαρνιτούρα","quantity":"για σερβίρισμα"}]',
  '[{"step":"Κόβουμε το κρέας σε κύβους ~3 cm."},{"step":"Μαρινάρουμε με ελαιόλαδο, ρίγανη, πάπρικα, λεμόνι, αλάτι, πιπέρι για 1+ ώρα."},{"step":"Περνάμε στα σουβλάκια εναλλάξ χοιρινό και κοτόπουλο."},{"step":"Ψήνουμε σε καυτή σχάρα 12–15 λεπτά, γυρίζοντας."},{"step":"Σερβίρουμε σε πίτα με τζατζίκι, τομάτα και κρεμμύδι."}]',
  NULL
);
