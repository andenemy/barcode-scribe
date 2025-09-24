import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "textarea";
  required: boolean;
}

export interface ScannedItem {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  scannedAt: string;
  updatedAt?: string;
  customFields?: Record<string, string>;
}

interface ItemFormProps {
  barcode: string | null;
  customFields: CustomField[];
  onItemSaved: (item: Omit<ScannedItem, 'id'>) => void;
  onClear: () => void;
}

export const ItemForm = ({ barcode, customFields, onItemSaved, onClear }: ItemFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (barcode) {
      // Clear form when new barcode is scanned
      setName("");
      setDescription("");
      setCustomFieldValues({});
    }
  }, [barcode]);

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = () => {
    if (!barcode) {
      toast({
        title: "No Barcode",
        description: "Please scan a barcode first",
        variant: "destructive",
      });
      return;
    }

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

    const newItem = {
      barcode,
      name: name.trim(),
      description: description.trim(),
      scannedAt: new Date().toISOString(),
      customFields: customFieldValues,
    };

    onItemSaved(newItem);
    
    toast({
      title: "Item Saved",
      description: `${name} has been added to inventory`,
    });

    // Clear form
    setName("");
    setDescription("");
    setCustomFieldValues({});
    onClear();
  };

  const renderCustomField = (field: CustomField) => {
    const value = customFieldValues[field.id] || "";
    
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value as string}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            className="min-h-[80px]"
          />
        );
      case "text":
        return (
          <Input
            id={field.id}
            value={value as string}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
          />
        );
      default:
        return (
          <Input
            id={field.id}
            value={value as string}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
          />
        );
    }
  };

  if (!barcode) {
    return (
      <Card className="w-full opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Item Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Scan a barcode to add item information
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Item Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">Barcode: {barcode}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
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
                  <Label htmlFor={field.id}>
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
            <Plus className="h-4 w-4 mr-2" />
            Save Item
          </Button>
          <Button variant="outline" onClick={onClear}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};