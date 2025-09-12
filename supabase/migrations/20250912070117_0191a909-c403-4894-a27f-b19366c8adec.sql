-- Create custom_fields table to store field configurations
CREATE TABLE public.custom_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'textarea')),
  required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scanned_items table to store inventory items
CREATE TABLE public.scanned_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  barcode TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  custom_fields JSONB DEFAULT '{}',
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_items ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_fields
CREATE POLICY "Users can view their own custom fields" 
ON public.custom_fields 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom fields" 
ON public.custom_fields 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom fields" 
ON public.custom_fields 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom fields" 
ON public.custom_fields 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for scanned_items
CREATE POLICY "Users can view their own scanned items" 
ON public.scanned_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scanned items" 
ON public.scanned_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scanned items" 
ON public.scanned_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scanned items" 
ON public.scanned_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_custom_fields_updated_at
  BEFORE UPDATE ON public.custom_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scanned_items_updated_at
  BEFORE UPDATE ON public.scanned_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();