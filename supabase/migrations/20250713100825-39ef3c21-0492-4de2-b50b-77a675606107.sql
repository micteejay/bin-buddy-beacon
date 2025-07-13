-- Remove existing sample data and add only 2 bins for the dual-bin ESP8266 setup
DELETE FROM public.waste_bins WHERE bin_id IN ('003', '004');

-- Ensure we have exactly 2 bins for the ESP8266 setup
DELETE FROM public.waste_bins WHERE bin_id NOT IN ('001', '002');

-- Update existing bins or insert if they don't exist
UPDATE public.waste_bins SET 
  level = 75, 
  location = 'Bin A - Main Area',
  updated_at = now()
WHERE bin_id = '001';

UPDATE public.waste_bins SET 
  level = 45, 
  location = 'Bin B - Secondary Area',
  updated_at = now()
WHERE bin_id = '002';

-- Insert bins if they don't exist
INSERT INTO public.waste_bins (bin_id, level, location)
SELECT '001', 75, 'Bin A - Main Area'
WHERE NOT EXISTS (SELECT 1 FROM public.waste_bins WHERE bin_id = '001');

INSERT INTO public.waste_bins (bin_id, level, location)
SELECT '002', 45, 'Bin B - Secondary Area'
WHERE NOT EXISTS (SELECT 1 FROM public.waste_bins WHERE bin_id = '002');