-- Add category column to scanned_items table
ALTER TABLE public.scanned_items 
ADD COLUMN category TEXT DEFAULT 'Uncategorized';

-- Create an index for better performance on category filtering
CREATE INDEX idx_scanned_items_category ON public.scanned_items(category);