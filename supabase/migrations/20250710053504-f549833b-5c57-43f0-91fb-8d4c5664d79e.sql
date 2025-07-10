-- Create table for waste bin readings
CREATE TABLE public.waste_bins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bin_id TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waste_bins ENABLE ROW LEVEL SECURITY;

-- Create policies (public read access for dashboard, restricted write)
CREATE POLICY "Anyone can view waste bin data" 
ON public.waste_bins 
FOR SELECT 
USING (true);

CREATE POLICY "Service can insert waste bin data" 
ON public.waste_bins 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update waste bin data" 
ON public.waste_bins 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_waste_bins_updated_at
  BEFORE UPDATE ON public.waste_bins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_waste_bins_bin_id ON public.waste_bins(bin_id);
CREATE INDEX idx_waste_bins_created_at ON public.waste_bins(created_at DESC);