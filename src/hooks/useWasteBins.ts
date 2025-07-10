import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WasteBin {
  id: string;
  bin_id: string;
  level: number;
  location: string;
  created_at: string;
  updated_at: string;
}

export const useWasteBins = () => {
  const [bins, setBins] = useState<WasteBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('waste_bins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by bin_id and get the latest reading for each bin
      const latestBins = data?.reduce((acc: WasteBin[], current) => {
        const existingBin = acc.find(bin => bin.bin_id === current.bin_id);
        if (!existingBin) {
          acc.push(current);
        }
        return acc;
      }, []) || [];

      setBins(latestBins);
      setError(null);
    } catch (err) {
      console.error('Error fetching bins:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();

    // Set up real-time subscription
    const channel = supabase
      .channel('waste_bins_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waste_bins'
        },
        () => {
          fetchBins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { bins, loading, error, refetch: fetchBins };
};