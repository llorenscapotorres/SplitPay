import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Minus, Plus } from "lucide-react";
import type { BillItem } from "@shared/schema";

interface SelectedItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

interface BillItemsListProps {
  items: BillItem[];
  selectedItems: SelectedItem[];
  onItemToggle: (item: BillItem, isSelected: boolean) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
}

export default function BillItemsList({
  items,
  selectedItems,
  onItemToggle,
  onQuantityChange,
}: BillItemsListProps) {
  const isItemSelected = (itemId: string) => {
    return selectedItems.some(si => si.id === itemId);
  };

  const getSelectedItem = (itemId: string) => {
    return selectedItems.find(si => si.id === itemId);
  };

  const getRemainingQuantity = (item: BillItem) => {
    return parseFloat(item.quantity) - parseFloat(item.paidQuantity);
  };

  return (
    <Card className="shadow-lg border border-gray-200">
      <CardHeader className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Select Items to Pay For</h3>
        <p className="text-sm text-gray-600 mt-1">Tap items to add them to your payment</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {items.map((item) => {
            const selectedItem = getSelectedItem(item.id);
            const isSelected = isItemSelected(item.id);
            const remainingQty = getRemainingQuantity(item);
            const isFullyPaid = remainingQty <= 0;

            return (
              <div
                key={item.id}
                className={`p-4 transition-colors ${
                  isFullyPaid 
                    ? "bg-gray-50 opacity-60" 
                    : isSelected 
                      ? "bg-blue-50" 
                      : "hover:bg-gray-50 cursor-pointer"
                }`}
                onClick={() => !isFullyPaid && onItemToggle(item, !isSelected)}
                data-testid={`item-${item.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-colors ${
                        isSelected 
                          ? "border-secondary bg-secondary" 
                          : "border-gray-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900" data-testid={`text-item-name-${item.id}`}>
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                          {parseFloat(item.paidQuantity) > 0 && (
                            <span className="text-secondary ml-1">
                              (Paid: {item.paidQuantity})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900" data-testid={`text-item-price-${item.id}`}>
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                    {isSelected && selectedItem && !isFullyPaid && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 rounded-full p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuantityChange(item.id, selectedItem.quantity - 0.25);
                          }}
                          disabled={selectedItem.quantity <= 0.25}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-12 text-center" data-testid={`text-quantity-${item.id}`}>
                          {selectedItem.quantity.toFixed(1)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 rounded-full p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuantityChange(item.id, selectedItem.quantity + 0.25);
                          }}
                          disabled={selectedItem.quantity >= selectedItem.maxQuantity}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {isFullyPaid && (
                      <div className="text-xs text-secondary font-medium mt-1">
                        Fully Paid
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
