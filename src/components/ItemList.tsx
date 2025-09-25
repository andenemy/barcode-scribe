import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditItemDialog } from "@/components/EditItemDialog";
import { Download, Upload, Search, Filter, Calendar, Tag } from "lucide-react";
import { ScannedItem } from "@/hooks/useScannedItems";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

interface ItemListProps {
  items: ScannedItem[];
  customFields: any[];
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updates: any) => void;
  onImportItems: (items: ScannedItem[]) => void;
}

export function ItemList({ items, customFields, onDeleteItem, onUpdateItem, onImportItems }: ItemListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<ScannedItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("");

  // Get unique categories from items
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  // Get unique tags from custom fields
  const tags = Array.from(new Set(
    items.flatMap(item => 
      Object.entries(item.customFields || {})
        .filter(([key]) => key.toLowerCase().includes('tag'))
        .map(([, value]) => value)
        .filter(Boolean)
    )
  ));

  // Enhanced filtering logic
  const filteredItems = items.filter(item => {
    // Search term filter
    const searchMatch = searchTerm === "" || 
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      Object.values(item.customFields || {}).some(value => 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Category filter
    const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;

    // Date filter
    let dateMatch = true;
    if (dateFilter !== "all") {
      const itemDate = new Date(item.scannedAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case "today":
          const todayStart = new Date(today);
          const todayEnd = new Date(today);
          todayEnd.setDate(todayEnd.getDate() + 1);
          dateMatch = itemDate >= todayStart && itemDate < todayEnd;
          break;
        case "week":
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - 7);
          dateMatch = itemDate >= weekStart;
          break;
        case "month":
          const monthStart = new Date(today);
          monthStart.setMonth(monthStart.getMonth() - 1);
          dateMatch = itemDate >= monthStart;
          break;
      }
    }

    // Tag filter
    const tagMatch = tagFilter === "" || 
      Object.values(item.customFields || {}).some(value => 
        value.toLowerCase().includes(tagFilter.toLowerCase())
      );

    return searchMatch && categoryMatch && dateMatch && tagMatch;
  });

  const exportToExcel = () => {
    const exportData = filteredItems.map(item => {
      const row: any = {
        Barcode: item.barcode,
        Name: item.name,
        Description: item.description || '',
        Category: item.category,
        'Scanned At': format(new Date(item.scannedAt), 'yyyy-MM-dd HH:mm:ss'),
        'Last Updated': item.updatedAt ? format(new Date(item.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '',
      };
      
      customFields.forEach(field => {
        row[field.name] = item.customFields?.[field.name] || '';
      });
      
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `inventory-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
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

        const importedItems: ScannedItem[] = jsonData.map((row: any) => {
          const customFieldsData: Record<string, string> = {};
          customFields.forEach(field => {
            if (row[field.name]) {
              customFieldsData[field.name] = String(row[field.name]);
            }
          });

          return {
            id: '',
            barcode: String(row.Barcode || ''),
            name: String(row.Name || ''),
            description: row.Description ? String(row.Description) : undefined,
            category: String(row.Category || 'Uncategorized'),
            scannedAt: row['Scanned At'] ? new Date(row['Scanned At']).toISOString() : new Date().toISOString(),
            customFields: customFieldsData,
          };
        }).filter(item => item.barcode && item.name);

        if (importedItems.length > 0) {
          onImportItems(importedItems);
        }
      } catch (error) {
        console.error('Error importing file:', error);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setDateFilter("all");
    setTagFilter("");
  };

  const activeFiltersCount = [categoryFilter !== "all", dateFilter !== "all", tagFilter !== ""].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Inventory Items ({filteredItems.length})</span>
          <div className="flex gap-2">
            <Button onClick={exportToExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search items by barcode, name, description, or custom fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeFiltersCount > 0 && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by tags..."
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-[150px]"
                />
              </div>
            )}
          </div>

          {/* Active filters display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Category: {categoryFilter}
                </Badge>
              )}
              {dateFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Date: {dateFilter}
                </Badge>
              )}
              {tagFilter !== "" && (
                <Badge variant="secondary" className="gap-1">
                  Tag: {tagFilter}
                </Badge>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Items Table */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {items.length === 0 ? (
              <p>No items scanned yet. Start by scanning your first barcode!</p>
            ) : (
              <p>No items match your current filters. Try adjusting your search criteria.</p>
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
                  <TableHead>Category</TableHead>
                  {customFields.map(field => (
                    <TableHead key={field.id}>{field.name}</TableHead>
                  ))}
                  <TableHead>Scanned At</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.barcode}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    {customFields.map(field => (
                      <TableCell key={field.id}>
                        {item.customFields?.[field.name] || "-"}
                      </TableCell>
                    ))}
                    <TableCell>{format(new Date(item.scannedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell>
                      {item.updatedAt ? format(new Date(item.updatedAt), 'MMM dd, yyyy HH:mm') : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingItem(item)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => onDeleteItem(item.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {editingItem && (
        <EditItemDialog
          item={editingItem}
          customFields={customFields}
          onSave={(updates) => {
            onUpdateItem(editingItem.id, updates);
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}
    </Card>
  );
}