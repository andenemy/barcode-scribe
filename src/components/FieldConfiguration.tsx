import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, X, Edit } from "lucide-react";
import { CustomField } from "./ItemForm";
import { useToast } from "@/hooks/use-toast";

interface FieldConfigurationProps {
  customFields: CustomField[];
  onFieldsUpdate: (fields: CustomField[]) => void;
}

export const FieldConfiguration = ({ customFields, onFieldsUpdate }: FieldConfigurationProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    type: "text" as "text" | "textarea",
    required: false,
  });
  const { toast } = useToast();

  const addField = () => {
    if (!newField.name.trim()) {
      toast({
        title: "Invalid Field",
        description: "Please enter a field name",
        variant: "destructive",
      });
      return;
    }

    const field: CustomField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newField.name.trim(),
      type: newField.type,
      required: newField.required,
    };

    onFieldsUpdate([...customFields, field]);
    setNewField({ name: "", type: "text", required: false });
    
    toast({
      title: "Field Added",
      description: `${field.name} has been added to the form`,
    });
  };

  const removeField = (id: string) => {
    onFieldsUpdate(customFields.filter(field => field.id !== id));
    toast({
      title: "Field Removed",
      description: "Field has been removed from the form",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Field Configuration
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConfiguring(!isConfiguring)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isConfiguring ? "Done" : "Configure"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfiguring ? (
          <div className="space-y-2">
            <h4 className="font-medium">Current Fields ({customFields.length})</h4>
            {customFields.length === 0 ? (
              <p className="text-muted-foreground">No custom fields configured</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {customFields.map((field) => (
                  <Badge key={field.id} variant="outline">
                    {field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Add New Field</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Field Name</Label>
                  <Input
                    id="fieldName"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="e.g., Category, Price, Location..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={newField.type}
                    onValueChange={(value: "text" | "textarea") =>
                      setNewField({ ...newField, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Required Field</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Switch
                      checked={newField.required}
                      onCheckedChange={(checked) =>
                        setNewField({ ...newField, required: checked })
                      }
                    />
                    <span className="text-sm">{newField.required ? "Required" : "Optional"}</span>
                  </div>
                </div>
              </div>
              
              <Button onClick={addField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            {customFields.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Existing Fields</h4>
                <div className="space-y-2">
                  {customFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{field.type}</Badge>
                        <span className="font-medium">{field.name}</span>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};