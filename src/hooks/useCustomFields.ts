import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea';
  required: boolean;
}

export function useCustomFields() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadFields = async () => {
    if (!user) {
      setFields([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedFields: CustomField[] = data.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type as 'text' | 'textarea',
        required: field.required
      }));

      setFields(formattedFields);
    } catch (error: any) {
      console.error('Error loading custom fields:', error);
      toast({
        title: "Error loading custom fields",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFields = async (newFields: Omit<CustomField, 'id'>[]) => {
    if (!user) return;

    try {
      // Delete existing fields
      await supabase
        .from('custom_fields')
        .delete()
        .eq('user_id', user.id);

      // Insert new fields
      if (newFields.length > 0) {
        const fieldsToInsert = newFields.map(field => ({
          user_id: user.id,
          name: field.name,
          type: field.type,
          required: field.required
        }));

        const { data, error } = await supabase
          .from('custom_fields')
          .insert(fieldsToInsert)
          .select();

        if (error) throw error;

        const formattedFields: CustomField[] = data.map(field => ({
          id: field.id,
          name: field.name,
          type: field.type as 'text' | 'textarea',
          required: field.required
        }));

        setFields(formattedFields);
      } else {
        setFields([]);
      }

      toast({
        title: "Custom fields updated",
        description: "Your custom fields have been saved.",
      });
    } catch (error: any) {
      console.error('Error updating custom fields:', error);
      toast({
        title: "Error updating custom fields",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadFields();
  }, [user]);

  return {
    fields,
    loading,
    updateFields,
    refetch: loadFields
  };
}