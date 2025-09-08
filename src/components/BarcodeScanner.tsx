import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

export const BarcodeScanner = ({ onBarcodeScanned, isScanning, setIsScanning }: BarcodeScannerProps) => {
  const [barcode, setBarcode] = useState("");
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && barcode.trim()) {
      handleScan();
    }
  };

  const handleScan = () => {
    if (!barcode.trim()) {
      setScanStatus("error");
      toast({
        title: "Invalid Barcode",
        description: "Please enter a valid barcode",
        variant: "destructive",
      });
      return;
    }

    setScanStatus("success");
    onBarcodeScanned(barcode.trim());
    
    toast({
      title: "Barcode Scanned",
      description: `Successfully scanned: ${barcode}`,
    });

    setBarcode("");
    setTimeout(() => setScanStatus("idle"), 2000);
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      setScanStatus("scanning");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setScanStatus("idle");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Barcode Scanner
          <Badge variant={isScanning ? "default" : "secondary"}>
            {isScanning ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scan barcode or enter manually..."
              className={`transition-all duration-200 ${
                isScanning ? "ring-2 ring-scan-focus border-scan-focus" : ""
              }`}
              disabled={!isScanning}
            />
            {scanStatus === "success" && (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-success" />
            )}
            {scanStatus === "error" && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
            )}
          </div>
          <Button onClick={handleScan} disabled={!isScanning || !barcode.trim()}>
            Scan
          </Button>
        </div>
        
        <Button 
          onClick={toggleScanning} 
          variant={isScanning ? "destructive" : "default"}
          className="w-full"
        >
          {isScanning ? "Stop Scanning" : "Start Scanning"}
        </Button>

        <div className="text-sm text-muted-foreground">
          {isScanning 
            ? "Scanner ready - scan a barcode or type manually and press Enter"
            : "Click 'Start Scanning' to begin scanning barcodes"
          }
        </div>
      </CardContent>
    </Card>
  );
};