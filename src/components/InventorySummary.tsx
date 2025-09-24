import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Package, TrendingUp } from "lucide-react";
import { ScannedItem } from "./ItemForm";

interface InventorySummaryProps {
  items: ScannedItem[];
}

export const InventorySummary = ({ items }: InventorySummaryProps) => {
  const totalItems = items.length;
  
  // For future use when price field is added
  const totalValue = 0; // Placeholder for when price field is implemented

  const handleGenerateReport = () => {
    // Create a new window with printable inventory
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat { text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { color: #6b7280; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background-color: #f9fafb; font-weight: bold; }
            .print-date { text-align: right; margin-bottom: 20px; color: #6b7280; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-date">Generated on: ${new Date().toLocaleString()}</div>
          
          <div class="header">
            <h1>Inventory Report</h1>
            <p>Complete listing of scanned items</p>
          </div>

          <div class="summary">
            <div class="stat">
              <div class="stat-number">${totalItems}</div>
              <div class="stat-label">Total Items</div>
            </div>
            <div class="stat">
              <div class="stat-number">$${totalValue.toFixed(2)}</div>
              <div class="stat-label">Total Value</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Name</th>
                <th>Description</th>
                <th>Scanned At</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.barcode}</td>
                  <td>${item.name}</td>
                  <td>${item.description || '-'}</td>
                  <td>${new Date(item.scannedAt).toLocaleString()}</td>
                  <td>${item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px; text-align: center; color: #6b7280;">
            <p>End of Report</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Inventory Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">${totalValue.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-xs text-muted-foreground mt-1">
                (Add "Price" field to calculate)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Report Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Button 
              onClick={handleGenerateReport}
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              <FileText className="h-6 w-6 mr-3" />
              GENERATE PRINT REPORT
            </Button>
            <p className="text-muted-foreground text-sm">
              Open a clean, printable version of your inventory.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};