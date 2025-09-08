import { useState, useEffect } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { ItemForm, ScannedItem, CustomField } from "@/components/ItemForm";
import { ItemList } from "@/components/ItemList";
import { FieldConfiguration } from "@/components/FieldConfiguration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScanBarcode, Package, Settings, List } from "lucide-react";

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: "category",
      name: "Category",
      type: "text",
      required: false,
    },
    {
      id: "location",
      name: "Location",
      type: "text",
      required: false,
    },
    {
      id: "quantity",
      name: "Quantity",
      type: "number",
      required: true,
    },
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem("scannedItems");
    const savedFields = localStorage.getItem("customFields");
    
    if (savedItems) {
      try {
        const items = JSON.parse(savedItems).map((item: any) => ({
          ...item,
          scannedAt: new Date(item.scannedAt),
        }));
        setScannedItems(items);
      } catch (error) {
        console.error("Error loading saved items:", error);
      }
    }
    
    if (savedFields) {
      try {
        setCustomFields(JSON.parse(savedFields));
      } catch (error) {
        console.error("Error loading saved fields:", error);
      }
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("scannedItems", JSON.stringify(scannedItems));
  }, [scannedItems]);

  useEffect(() => {
    localStorage.setItem("customFields", JSON.stringify(customFields));
  }, [customFields]);

  const handleBarcodeScanned = (barcode: string) => {
    setCurrentBarcode(barcode);
  };

  const handleItemSaved = (item: ScannedItem) => {
    setScannedItems(prev => [item, ...prev]);
  };

  const handleClearForm = () => {
    setCurrentBarcode(null);
  };

  const handleDeleteItem = (id: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFieldsUpdate = (fields: CustomField[]) => {
    setCustomFields(fields);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <ScanBarcode className="h-8 w-8 text-primary" />
            Barcode Inventory Manager
          </h1>
          <p className="text-muted-foreground">
            Scan barcodes, add descriptions, and export to Excel
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <ScanBarcode className="h-4 w-4" />
              Scan Items
              {currentBarcode && (
                <Badge variant="destructive" className="text-xs">
                  1
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Inventory
              <Badge variant="secondary" className="text-xs">
                {scannedItems.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
              <Badge variant="outline" className="text-xs">
                {customFields.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarcodeScanner
                onBarcodeScanned={handleBarcodeScanned}
                isScanning={isScanning}
                setIsScanning={setIsScanning}
              />
              
              <ItemForm
                barcode={currentBarcode}
                customFields={customFields}
                onItemSaved={handleItemSaved}
                onClear={handleClearForm}
              />
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <ItemList
              items={scannedItems}
              customFields={customFields}
              onDeleteItem={handleDeleteItem}
            />
          </TabsContent>

          <TabsContent value="settings">
            <FieldConfiguration
              customFields={customFields}
              onFieldsUpdate={handleFieldsUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
