import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Package, Trash2, Upload } from "lucide-react";
import { ScannedItem, CustomField } from "./ItemForm";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface ItemListProps {
  items: ScannedItem[];
  customFields: CustomField[];
  onDeleteItem: (id: string) => void;
  onImportItems: (items: ScannedItem[]) => void;
}

export const ItemList = ({ items, customFields, onDeleteItem, onImportItems }: ItemListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode.includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    if (items.length === 0) {
      toast({
        title: "No Data",
        description: "No items to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = items.map(item => {
      const baseData = {
        Barcode: item.barcode,
        Name: item.name,
        Description: item.description,
        "Scanned At": item.scannedAt.toLocaleString(),
      };

      // Add custom fields
      const customData = customFields.reduce((acc, field) => {
        acc[field.name] = item.customFields[field.id] || "";
        return acc;
      }, {} as Record<string, any>);

      return { ...baseData, ...customData };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scanned Items");

    const fileName = `barcode_inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Export Successful",
      description: `Exported ${items.length} items to ${fileName}`,
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedItems: ScannedItem[] = jsonData.map((row: any, index) => {
          // Map the custom fields back to the internal format
          const customFieldsData = customFields.reduce((acc, field) => {
            acc[field.id] = row[field.name] || "";
            return acc;
          }, {} as Record<string, string>);

          return {
            id: `imported-${Date.now()}-${index}`,
            barcode: row.Barcode || "",
            name: row.Name || "",
            description: row.Description || "",
            customFields: customFieldsData,
            scannedAt: new Date(),
          };
        }).filter(item => item.barcode && item.name); // Only import items with barcode and name

        if (importedItems.length > 0) {
          onImportItems(importedItems);
          toast({
            title: "Import Successful",
            description: `Imported ${importedItems.length} items from Excel file`,
          });
        } else {
          toast({
            title: "Import Failed",
            description: "No valid items found in the Excel file",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error importing Excel file:", error);
        toast({
          title: "Import Failed",
          description: "Error reading Excel file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory ({items.length} items)
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportToExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('excel-import')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Excel
            </Button>
            <input
              id="excel-import"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="pl-9"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            {items.length === 0 ? (
              <p className="text-muted-foreground">No items scanned yet</p>
            ) : (
              <p className="text-muted-foreground">No items match your search</p>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  {customFields.map(field => (
                    <TableHead key={field.id}>{field.name}</TableHead>
                  ))}
                  <TableHead>Scanned At</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {item.barcode}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    {customFields.map(field => (
                      <TableCell key={field.id}>
                        {item.customFields[field.id] || "-"}
                      </TableCell>
                    ))}
                    <TableCell className="text-sm text-muted-foreground">
                      {item.scannedAt.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};