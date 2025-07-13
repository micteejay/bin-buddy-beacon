-- Remove existing sample data and add only 2 bins for the dual-bin ESP8266 setup
DELETE FROM public.waste_bins WHERE bin_id IN ('003', '004');

-- Update existing data to ensure we have exactly 2 bins
INSERT INTO public.waste_bins (bin_id, level, location) VALUES
('001', 75, 'Bin A - Main Area'),
('002', 45, 'Bin B - Secondary Area')
ON CONFLICT (bin_id) DO UPDATE SET
  level = EXCLUDED.level,
  location = EXCLUDED.location,
  updated_at = now();