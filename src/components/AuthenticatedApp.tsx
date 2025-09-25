import { useState } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { ItemForm } from "@/components/ItemForm";
import { ItemList } from "@/components/ItemList";
import { FieldConfiguration } from "@/components/FieldConfiguration";
import { InventorySummary } from "@/components/InventorySummary";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ScanBarcode } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useScannedItems } from "@/hooks/useScannedItems";
import { useCustomFields } from "@/hooks/useCustomFields";

export default function AuthenticatedApp() {
  const [isScanning, setIsScanning] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("scan");
  const { user } = useAuth();
  const { items, saveItem, updateItem, deleteItem, importItems } = useScannedItems();
  const { fields, updateFields } = useCustomFields();

  const handleBarcodeScanned = (barcode: string) => {
    setCurrentBarcode(barcode);
  };

  const handleItemSaved = async (itemData: {
    barcode: string;
    name: string;
    description?: string;
    scannedAt: string;
    category?: string;
    customFields?: Record<string, string>;
  }) => {
    await saveItem({ ...itemData, category: itemData.category || 'Uncategorized' });
  };

  const handleClearForm = () => {
    setCurrentBarcode(null);
  };

  const handleFieldsUpdate = async (newFields: any[]) => {
    await updateFields(newFields);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "scan":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                <ScanBarcode className="h-8 w-8 text-primary" />
                Barcode Inventory Manager
              </h1>
              <p className="text-muted-foreground">
                Scan barcodes, add descriptions, and sync to cloud
              </p>
            </div>
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
          </div>
        );
      case "inventory":
        return (
          <div className="space-y-6">
            <InventorySummary items={items} />
            <ItemList
              items={items}
              customFields={fields}
              onDeleteItem={deleteItem}
              onUpdateItem={updateItem}
              onImportItems={(newItems) => importItems(newItems.map(({ id, updatedAt, ...item }) => ({ ...item, category: 'Uncategorized' })))}
            />
          </div>
        );
      case "settings":
        return (
          <FieldConfiguration
            customFields={fields}
            onFieldsUpdate={handleFieldsUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          itemsCount={items.length}
          fieldsCount={fields.length}
          currentBarcode={currentBarcode}
        />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
          </header>
          
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}