import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ScannedItem {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  scannedAt: string;
  updatedAt?: string;
  category: string;
  customFields?: Record<string, string>;
}

export function useScannedItems() {
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scanned_items')
        .select('*')
        .order('scanned_at', { ascending: false });

      if (error) throw error;

      const formattedItems: ScannedItem[] = data.map(item => ({
        id: item.id,
        barcode: item.barcode,
        name: item.name,
        description: item.description || undefined,
        scannedAt: item.scanned_at,
        updatedAt: item.updated_at,
        category: item.category || 'Uncategorized',
        customFields: (item.custom_fields as Record<string, string>) || {}
      }));

      setItems(formattedItems);
    } catch (error: any) {
      console.error('Error loading items:', error);
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async (item: Omit<ScannedItem, 'id' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scanned_items')
        .insert({
          user_id: user.id,
          barcode: item.barcode,
          name: item.name,
          description: item.description,
          category: item.category || 'Uncategorized',
          custom_fields: item.customFields || {},
          scanned_at: item.scannedAt
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: ScannedItem = {
        id: data.id,
        barcode: data.barcode,
        name: data.name,
        description: data.description || undefined,
        scannedAt: data.scanned_at,
        updatedAt: data.updated_at,
        category: data.category || 'Uncategorized',
        customFields: (data.custom_fields as Record<string, string>) || {}
      };

      setItems(prev => [newItem, ...prev]);
      
      toast({
        title: "Item saved",
        description: "Item has been saved to your inventory.",
      });
    } catch (error: any) {
      console.error('Error saving item:', error);
      toast({
        title: "Error saving item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateItem = async (id: string, updates: Partial<Omit<ScannedItem, 'id' | 'updatedAt'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scanned_items')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          custom_fields: updates.customFields || {},
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedItem: ScannedItem = {
        id: data.id,
        barcode: data.barcode,
        name: data.name,
        description: data.description || undefined,
        scannedAt: data.scanned_at,
        updatedAt: data.updated_at,
        category: data.category || 'Uncategorized',
        customFields: (data.custom_fields as Record<string, string>) || {}
      };

      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      
      toast({
        title: "Item updated",
        description: "Item has been updated in your inventory.",
      });
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('scanned_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Item deleted",
        description: "Item has been removed from your inventory.",
      });
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const importItems = async (newItems: Omit<ScannedItem, 'id' | 'updatedAt'>[]) => {
    if (!user || newItems.length === 0) return;

    try {
      const itemsToInsert = newItems.map(item => ({
        user_id: user.id,
        barcode: item.barcode,
        name: item.name,
        description: item.description,
        category: item.category || 'Uncategorized',
        custom_fields: item.customFields || {},
        scanned_at: item.scannedAt
      }));

      const { data, error } = await supabase
        .from('scanned_items')
        .insert(itemsToInsert)
        .select();

      if (error) throw error;

      const formattedItems: ScannedItem[] = data.map(item => ({
        id: item.id,
        barcode: item.barcode,
        name: item.name,
        description: item.description || undefined,
        scannedAt: item.scanned_at,
        updatedAt: item.updated_at,
        category: item.category || 'Uncategorized',
        customFields: (item.custom_fields as Record<string, string>) || {}
      }));

      setItems(prev => [...formattedItems, ...prev]);
      
      toast({
        title: "Import successful",
        description: `Imported ${newItems.length} items to your inventory.`,
      });
    } catch (error: any) {
      console.error('Error importing items:', error);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadItems();
  }, [user]);

  return {
    items,
    loading,
    saveItem,
    updateItem,
    deleteItem,
    importItems,
    refetch: loadItems
  };
}