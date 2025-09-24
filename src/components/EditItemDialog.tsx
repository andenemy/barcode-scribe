import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScannedItem, CustomField } from "./ItemForm";
import { useToast } from "@/hooks/use-toast";

interface EditItemDialogProps {
  item: ScannedItem | null;
  customFields: CustomField[];
  onSave: (id: string, updates: Partial<Omit<ScannedItem, 'id'>>) => void;
  onClose: () => void;
}

export const EditItemDialog = ({ item, customFields, onSave, onClose }: EditItemDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || "");
      setCustomFieldValues(item.customFields || {});
    }
  }, [item]);

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = () => {
    if (!item) return;

    if (!name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }

    // Check required custom fields
    const missingFields = customFields
      .filter(field => field.required && !customFieldValues[field.id])
      .map(field => field.name);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const updates = {
      name: name.trim(),
      description: description.trim(),
      customFields: customFieldValues,
    };

    onSave(item.id, updates);
    onClose();
  };

  const renderCustomField = (field: CustomField) => {
    const value = customFieldValues[field.id] || "";
    
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            className="min-h-[80px]"
          />
        );
      case "text":
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
          />
        );
      default:
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        
        {item && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Barcode: {item.barcode}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Item Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description..."
                />
              </div>
            </div>

            {customFields.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={`edit-${field.id}`}>
                        {field.name}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {renderCustomField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};