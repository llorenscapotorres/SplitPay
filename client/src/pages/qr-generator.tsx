import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Download, Printer } from "lucide-react";
import QRDisplay from "@/components/qr-display";
import { apiRequest } from "@/lib/queryClient";
import { generateQRCodeURL } from "@/lib/qr-generator";
import type { Table } from "@shared/schema";

export default function QRGenerator() {
  const [tableNumber, setTableNumber] = useState("7");
  const [restaurantName, setRestaurantName] = useState("bella-vista");
  const [generatedTable, setGeneratedTable] = useState<Table | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tables } = useQuery<Table[]>({
    queryKey: ["/api/tables"],
  });

  const createTableMutation = useMutation({
    mutationFn: async (tableData: { number: number; restaurantName: string; qrCode: string; isActive: boolean }) => {
      const response = await apiRequest("POST", "/api/tables", tableData);
      return response.json();
    },
    onSuccess: (table) => {
      setGeneratedTable(table);
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      toast({
        title: "QR Code Generated",
        description: `QR code created for Table ${tableNumber}`,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateQR = () => {
    if (!tableNumber || !restaurantName) {
      toast({
        title: "Missing Information",
        description: "Please fill in both table number and restaurant name.",
        variant: "destructive",
      });
      return;
    }

    const qrCodeURL = generateQRCodeURL(parseInt(tableNumber), restaurantName);
    
    createTableMutation.mutate({
      number: parseInt(tableNumber),
      restaurantName,
      qrCode: qrCodeURL,
      isActive: true,
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "QR code download will be implemented with actual QR generation library.",
    });
  };

  const handlePrint = () => {
    toast({
      title: "Print Started", 
      description: "QR code printing will be implemented with actual QR generation library.",
    });
  };

  return (
    <div className="view-container">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">QR Code Generator</h2>
          <p className="text-gray-600 mt-2">Generate unique QR codes for each table</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Generator */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Generate New QR Code</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="table-number">Table Number</Label>
                <Input
                  id="table-number"
                  type="number"
                  min="1"
                  max="50"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  data-testid="input-table-number"
                />
              </div>
              
              <div>
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input
                  id="restaurant-name"
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  data-testid="input-restaurant-name"
                />
              </div>
              
              <Button
                onClick={handleGenerateQR}
                className="w-full bg-primary hover:bg-blue-700 text-white font-semibold"
                disabled={createTableMutation.isPending}
                data-testid="button-generate-qr"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {createTableMutation.isPending ? "Generating..." : "Generate QR Code"}
              </Button>
            </CardContent>
          </Card>

          {/* QR Display */}
          <QRDisplay
            table={generatedTable}
            onDownload={handleDownload}
            onPrint={handlePrint}
          />
        </div>

        {/* QR History */}
        <Card className="mt-8 shadow-lg border border-gray-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Generated QR Codes</h3>
            <p className="text-sm text-gray-600 mt-1">Previously generated QR codes for your tables</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tables?.map((table) => (
                    <tr key={table.id} data-testid={`row-table-${table.number}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Table {table.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {table.restaurantName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {table.createdAt ? new Date(table.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          table.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {table.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button variant="link" size="sm" onClick={handleDownload} data-testid={`button-download-${table.number}`}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button variant="link" size="sm" onClick={handlePrint} data-testid={`button-print-${table.number}`}>
                          <Printer className="h-3 w-3 mr-1" />
                          Print
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {!tables?.length && (
          <div className="text-center py-12">
            <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Codes Generated</h3>
            <p className="text-gray-600">Generate your first QR code to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
