import { useState } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { ItemForm } from "@/components/ItemForm";
import { ItemList } from "@/components/ItemList";
import { FieldConfiguration } from "@/components/FieldConfiguration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanBarcode, Package, Settings, List, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useScannedItems } from "@/hooks/useScannedItems";
import { useCustomFields } from "@/hooks/useCustomFields";

export default function AuthenticatedApp() {
  const [isScanning, setIsScanning] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { items, saveItem, deleteItem, importItems } = useScannedItems();
  const { fields, updateFields } = useCustomFields();

  const handleBarcodeScanned = (barcode: string) => {
    setCurrentBarcode(barcode);
  };

  const handleItemSaved = async (itemData: {
    barcode: string;
    name: string;
    description?: string;
    scannedAt: string;
    customFields?: Record<string, string>;
  }) => {
    await saveItem(itemData);
  };

  const handleClearForm = () => {
    setCurrentBarcode(null);
  };

  const handleFieldsUpdate = async (newFields: any[]) => {
    await updateFields(newFields);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center space-y-2 flex-1">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <ScanBarcode className="h-8 w-8 text-primary" />
              Barcode Inventory Manager
            </h1>
            <p className="text-muted-foreground">
              Scan barcodes, add descriptions, and sync to cloud
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
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
                {items.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
              <Badge variant="outline" className="text-xs">
                {fields.length}
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
                customFields={fields}
                onItemSaved={handleItemSaved}
                onClear={handleClearForm}
              />
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <ItemList
              items={items}
              customFields={fields}
              onDeleteItem={deleteItem}
              onImportItems={(newItems) => importItems(newItems.map(({ id, ...item }) => item))}
            />
          </TabsContent>

          <TabsContent value="settings">
            <FieldConfiguration
              customFields={fields}
              onFieldsUpdate={handleFieldsUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}