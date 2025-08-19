import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Users, DollarSign, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Table, BillWithItems } from "@shared/schema";

interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: string;
}

// Sample menu items - in a real app this would come from an API
const MENU_ITEMS: MenuItem[] = [
  { id: "1", name: "Caesar Salad", price: "18.50", category: "Starters" },
  { id: "2", name: "Grilled Salmon", price: "32.00", category: "Main Course" },
  { id: "3", name: "Ribeye Steak", price: "45.00", category: "Main Course" },
  { id: "4", name: "Pasta Carbonara", price: "24.00", category: "Main Course" },
  { id: "5", name: "Wine Bottle (Red)", price: "45.00", category: "Beverages" },
  { id: "6", name: "Wine Bottle (White)", price: "42.00", category: "Beverages" },
  { id: "7", name: "Chocolate Cake", price: "12.00", category: "Desserts" },
  { id: "8", name: "Tiramisu", price: "14.00", category: "Desserts" },
  { id: "9", name: "Bruschetta", price: "15.00", category: "Starters" },
  { id: "10", name: "Fish & Chips", price: "28.00", category: "Main Course" },
];

const CATEGORIES = ["Starters", "Main Course", "Beverages", "Desserts"];

export default function Waiter() {
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Starters");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const { toast } = useToast();

  // Fetch all tables
  const { data: tables = [], isLoading: tablesLoading } = useQuery<Table[]>({
    queryKey: ["/api/tables"],
  });

  // Fetch selected table's bill
  const { data: selectedBill, refetch: refetchBill } = useQuery<BillWithItems>({
    queryKey: ["/api/bills/table", selectedTableId],
    enabled: !!selectedTableId,
  });

  // Mutation to add item to bill
  const addItemMutation = useMutation({
    mutationFn: async (itemData: { name: string; price: string; quantity: string }) => {
      return apiRequest("POST", `/api/bills/${selectedBill?.id}/items`, {
        name: itemData.name,
        price: itemData.price,
        quantity: itemData.quantity,
        paidQuantity: "0",
      });
    },
    onSuccess: () => {
      toast({
        title: "Item añadido",
        description: `${newItemName} ha sido añadido al pedido`,
      });
      
      // Reset form
      setNewItemName("");
      setNewItemPrice("");
      setNewItemQuantity("1");
      
      // Refresh bill data
      refetchBill();
      
      // Also invalidate dashboard data for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/tables"] });
      queryClient.invalidateQueries({ queryKey: ["/api/qr"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo añadir el item al pedido",
        variant: "destructive",
      });
    },
  });

  const handleAddMenuItem = (menuItem: MenuItem) => {
    if (!selectedBill) return;
    
    addItemMutation.mutate({
      name: menuItem.name,
      price: menuItem.price,
      quantity: "1",
    });
  };

  const handleAddCustomItem = () => {
    if (!selectedBill || !newItemName || !newItemPrice) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    addItemMutation.mutate({
      name: newItemName,
      price: newItemPrice,
      quantity: newItemQuantity,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "partial": return "bg-yellow-100 text-yellow-800";
      default: return "bg-red-100 text-red-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Pagado";
      case "partial": return "Parcial";
      default: return "Pendiente";
    }
  };

  if (tablesLoading) {
    return (
      <div className="view-container flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2" data-testid="text-waiter-title">
          Vista del Camarero
        </h1>
        <p className="text-purple-100">
          Toma pedidos y añade items a las mesas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Seleccionar Mesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="table-select">Mesa</Label>
                <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                  <SelectTrigger data-testid="select-table">
                    <SelectValue placeholder="Selecciona una mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Mesa {table.number} - {table.restaurantName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Bill Status */}
              {selectedBill && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3" data-testid="text-current-bill">
                    Estado Actual del Pedido
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold ml-2" data-testid="text-bill-total">
                        ${selectedBill.total}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <Badge 
                        className={`ml-2 ${getStatusColor(selectedBill.status)}`}
                        data-testid={`badge-status-${selectedBill.status}`}
                      >
                        {getStatusText(selectedBill.status)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Pagado:</span>
                      <span className="font-semibold ml-2 text-green-600" data-testid="text-paid">
                        ${selectedBill.paid || "0.00"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pendiente:</span>
                      <span className="font-semibold ml-2 text-red-600" data-testid="text-remaining">
                        ${selectedBill.remaining || selectedBill.total}
                      </span>
                    </div>
                  </div>
                  
                  {/* Current Items */}
                  {selectedBill.items && selectedBill.items.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Items Actuales:</h4>
                      <div className="space-y-1">
                        {selectedBill.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span data-testid={`text-item-${item.id}`}>
                              {item.name} (x{item.quantity})
                            </span>
                            <span>${item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Añadir Items al Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTableId ? (
              <p className="text-gray-500 text-center py-8">
                Selecciona una mesa para comenzar a tomar el pedido
              </p>
            ) : !selectedBill ? (
              <p className="text-gray-500 text-center py-8">
                No hay pedido activo para esta mesa
              </p>
            ) : (
              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <Label htmlFor="category-select">Categoría</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  <Label>Items del Menú - {selectedCategory}</Label>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {MENU_ITEMS
                      .filter(item => item.category === selectedCategory)
                      .map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <span className="font-medium" data-testid={`text-menu-item-${item.id}`}>
                              {item.name}
                            </span>
                            <span className="text-green-600 ml-2">${item.price}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddMenuItem(item)}
                            disabled={addItemMutation.isPending}
                            data-testid={`button-add-menu-${item.id}`}
                          >
                            {addItemMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Custom Item */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-3 block">
                    Añadir Item Personalizado
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="item-name" className="text-xs">Nombre</Label>
                      <Input
                        id="item-name"
                        placeholder="Nombre del plato"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        data-testid="input-custom-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-price" className="text-xs">Precio</Label>
                      <Input
                        id="item-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        data-testid="input-custom-price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-quantity" className="text-xs">Cantidad</Label>
                      <Input
                        id="item-quantity"
                        type="number"
                        min="1"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(e.target.value)}
                        data-testid="input-custom-quantity"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleAddCustomItem}
                        disabled={addItemMutation.isPending || !newItemName || !newItemPrice}
                        className="w-full"
                        data-testid="button-add-custom"
                      >
                        {addItemMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}