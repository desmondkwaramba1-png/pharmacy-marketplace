-- 1. Insert 30 new Medicines with Unsplash Stock Images
INSERT INTO medicines (generic_name, brand_name, dosage, form, category, description, standard_price, image_url) VALUES
('Amoxicillin', 'Amoxil', '500mg', 'capsule', 'Antibiotic', 'Used to treat bacterial infections', 5.50, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Azithromycin', 'Zithromax', '250mg', 'tablet', 'Antibiotic', 'Macrolide antibacterial', 8.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Metformin', 'Glucophage', '500mg', 'tablet', 'Antidiabetic', 'Treats type 2 diabetes', 3.20, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80'),
('Amlodipine', 'Norvasc', '5mg', 'tablet', 'Antihypertensive', 'Calcium channel blocker for high blood pressure', 4.50, 'https://images.unsplash.com/photo-1626015505719-74d262b9ce94?w=400&q=80'),
('Loratadine', 'Claritin', '10mg', 'tablet', 'Antihistamine', 'Non-drowsy allergy relief', 6.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Cetirizine', 'Zyrtec', '10mg', 'tablet', 'Antihistamine', 'Allergy medication', 5.80, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80'),
('Omeprazole', 'Prilosec', '20mg', 'capsule', 'Antacid', 'Proton pump inhibitor for heartburn', 7.50, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Pantoprazole', 'Protonix', '40mg', 'tablet', 'Antacid', 'Reduces stomach acid', 8.20, 'https://images.unsplash.com/photo-1626015505719-74d262b9ce94?w=400&q=80'),
('Salbutamol', 'Ventolin', '100mcg', 'inhaler', 'Bronchodilator', 'Asthma inhaler', 12.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Fluticasone', 'Flonase', '50mcg', 'spray', 'Corticosteroid', 'Nasal spray for allergies', 15.00, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80'),
('Levothyroxine', 'Synthroid', '50mcg', 'tablet', 'Hormone', 'Thyroid hormone replacement', 4.00, 'https://images.unsplash.com/photo-1626015505719-74d262b9ce94?w=400&q=80'),
('Atorvastatin', 'Lipitor', '20mg', 'tablet', 'Statin', 'Cholesterol lowering medication', 5.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Rosuvastatin', 'Crestor', '10mg', 'tablet', 'Statin', 'Lowers cholesterol and triglycerides', 6.50, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80'),
('Artemether-Lumefantrine', 'Coartem', '20/120mg', 'tablet', 'Antimalarial', 'First-line malaria treatment', 3.00, 'https://images.unsplash.com/photo-1626015505719-74d262b9ce94?w=400&q=80'),
('Quinine', 'Quinine Sulphate', '300mg', 'tablet', 'Antimalarial', 'Treatment for malaria', 4.20, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Vitamin C', 'Ascorbic Acid', '500mg', 'tablet', 'Supplement', 'Immune system support', 2.00, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80'),
('Zinc Sulphate', 'Zincol', '20mg', 'tablet', 'Supplement', 'Zinc supplement', 1.50, 'https://images.unsplash.com/photo-1626015505719-74d262b9ce94?w=400&q=80'),
('Iron', 'Ferrous Sulphate', '200mg', 'tablet', 'Supplement', 'Treats iron deficiency anemia', 2.50, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Folic Acid', 'Folvite', '5mg', 'tablet', 'Supplement', 'Pregnancy supplement', 1.00, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80'),
('Multivitamin', 'Centrum', 'Standard', 'tablet', 'Supplement', 'Daily multivitamin', 10.00, 'https://images.unsplash.com/photo-1626015505719-74d262b9ce94?w=400&q=80'),
('Diclofenac', 'Voltaren', '50mg', 'tablet', 'Painkiller', 'NSAID for pain and inflammation', 3.50, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Diclofenac Gel', 'Voltaren Emulgel', '1%', 'cream', 'Painkiller', 'Topical pain relief', 6.00, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80'),
('Ciprofloxacin', 'Cipro', '500mg', 'tablet', 'Antibiotic', 'Broad-spectrum antibiotic', 4.80, 'https://images.unsplash.com/photo-1626015505719-74d262b9ce94?w=400&q=80'),
('Doxycycline', 'Doxy', '100mg', 'capsule', 'Antibiotic', 'Tetracycline antibiotic', 3.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Hydrochlorothiazide', 'Microzide', '25mg', 'tablet', 'Antihypertensive', 'Diuretic for blood pressure', 2.50, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80'),
('Enalapril', 'Vasotec', '10mg', 'tablet', 'Antihypertensive', 'ACE inhibitor', 3.80, 'https://images.unsplash.com/photo-1626015505719-74d262b9ce94?w=400&q=80'),
('Losartan', 'Cozaar', '50mg', 'tablet', 'Antihypertensive', 'ARB for blood pressure', 5.50, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'),
('Ibuprofen + Paracetamol', 'Brufen Plus', '400mg/500mg', 'tablet', 'Painkiller', 'Combination pain relief', 4.00, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80'),
('Mebendazole', 'Vermox', '100mg', 'tablet', 'Anthelmintic', 'Deworming medication', 1.50, 'https://images.unsplash.com/photo-1626015505719-74d262b9ce94?w=400&q=80'),
('Clotrimazole', 'Canesten', '1%', 'cream', 'Antifungal', 'Topical antifungal treatment', 3.20, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80');

-- 2. Distribute these medicines into the inventory of random pharmacies
-- This block will assign each new medicine to 2 random pharmacies with random quantities
DO $$
DECLARE
    med RECORD;
    pharm RECORD;
    random_qty INT;
BEGIN
    FOR med IN (SELECT id, standard_price FROM medicines ORDER BY created_at DESC LIMIT 30) LOOP
        -- Pick 2 random pharmacies for each medicine
        FOR pharm IN (SELECT id FROM pharmacies ORDER BY random() LIMIT 2) LOOP
            random_qty := floor(random() * 50 + 10); -- Random stock between 10 and 60
            
            INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock_status, quantity, reserved_quantity, price)
            VALUES (pharm.id, med.id, 'in_stock', random_qty, 0, med.standard_price * (1 + (random() * 0.2 - 0.1))) -- Price +/- 10%
            ON CONFLICT (pharmacy_id, medicine_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
