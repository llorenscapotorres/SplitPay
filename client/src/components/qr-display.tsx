import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import type { Table } from "@shared/schema";

interface QRDisplayProps {
  table: Table | null;
  onDownload: () => void;
  onPrint: () => void;
}

export default function QRDisplay({ table, onDownload, onPrint }: QRDisplayProps) {
  if (!table) {
    return (
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">QR Code Preview</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-200 mb-4 inline-block">
              <div className="w-48 h-48 bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-gray-500 text-sm">Generate a QR code to preview</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border border-gray-200">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">QR Code Preview</h3>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {/* QR Code Mock Display */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-4 inline-block">
            <div className="w-48 h-48 bg-gray-900 rounded-md flex items-center justify-center qr-pattern" data-testid="qr-code-display">
              {/* QR pattern representation */}
              <div className="grid grid-cols-12 gap-px w-full h-full p-2">
                {Array.from({ length: 144 }, (_, i) => (
                  <div 
                    key={i} 
                    className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="font-semibold text-gray-900" data-testid="text-qr-table">
              Table {table.number}
            </p>
            <p className="text-sm text-gray-600" data-testid="text-qr-restaurant">
              {table.restaurantName}
            </p>
            <p className="text-xs text-gray-500 font-mono" data-testid="text-qr-url">
              {table.qrCode}
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            <Button 
              onClick={onDownload}
              className="w-full bg-secondary hover:bg-green-700 text-white"
              data-testid="button-download-qr"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
            <Button 
              onClick={onPrint}
              variant="outline"
              className="w-full"
              data-testid="button-print-qr"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print QR Code
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
