import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState, useEffect } from "react";
import BillStatusCard from "@/components/bill-status-card";
import BillItemsList from "@/components/bill-items-list";
import PaymentSummary from "@/components/payment-summary";
import PaymentModal from "@/components/payment-modal";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import type { BillWithItems, BillItem } from "@shared/schema";

interface SelectedItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

export default function Bill() {
  const params = useParams();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [tip, setTip] = useState(0);
  const [tipType, setTipType] = useState<"percentage" | "custom" | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Use default bill if no params (for demo)
  const tableNumber = params.tableNumber || "7";
  const restaurant = params.restaurant || "bella-vista";

  const { data: bill, isLoading, refetch } = useQuery<BillWithItems>({
    queryKey: ["/api/qr", tableNumber, restaurant],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const total = subtotal + tip;

  // Calculate tip when percentage changes
  useEffect(() => {
    if (tipType === "percentage" && tip > 0 && tip <= 100) {
      setTip((subtotal * tip) / 100);
    } else if (tipType === "custom") {
      setTip(customTipAmount);
    }
  }, [subtotal, tipType, customTipAmount]);

  const handleItemToggle = (item: BillItem, isSelected: boolean) => {
    if (isSelected) {
      const remainingQuantity = parseFloat(item.quantity) - parseFloat(item.paidQuantity);
      setSelectedItems(prev => [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: remainingQuantity,
          maxQuantity: remainingQuantity,
        },
      ]);
    } else {
      setSelectedItems(prev => prev.filter(si => si.id !== item.id));
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, Math.min(item.maxQuantity, newQuantity)) }
          : item
      )
    );
  };

  const handleTipChange = (percentage: number | null, customAmount: number = 0) => {
    if (percentage !== null) {
      setTipType("percentage");
      setTip(percentage);
    } else {
      setTipType("custom");
      setCustomTipAmount(customAmount);
      setTip(customAmount);
    }
  };

  const canProceedToPayment = selectedItems.length > 0 && selectedItems.some(item => item.quantity > 0);

  if (isLoading) {
    return (
      <div className="view-container flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading bill...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="view-container flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bill Not Found</h2>
          <p className="text-gray-600 mb-4">
            No active bill found for Table {tableNumber} at {restaurant.replace('-', ' ')}.
          </p>
          <Button onClick={() => refetch()} data-testid="button-retry">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      {/* Hero Section */}
      <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 p-6 text-white">
          <h2 className="text-2xl font-bold" data-testid="text-table-title">
            Table {bill.table.number} - Bill Summary
          </h2>
          <p className="text-blue-100 mt-1" data-testid="text-restaurant-name">
            {bill.table.restaurantName}
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <BillStatusCard bill={bill} />

        <BillItemsList
          items={bill.items}
          selectedItems={selectedItems}
          onItemToggle={handleItemToggle}
          onQuantityChange={handleQuantityChange}
        />

        <PaymentSummary
          subtotal={subtotal}
          tip={tip}
          total={total}
          tipType={tipType}
          onTipChange={handleTipChange}
        />

        <Button
          onClick={() => setShowPaymentModal(true)}
          disabled={!canProceedToPayment}
          className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"
          data-testid="button-proceed-payment"
        >
          <CreditCard className="h-5 w-5" />
          <span>Proceed to Payment</span>
        </Button>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        billId={bill.id}
        total={total}
        selectedItems={selectedItems}
        tip={tip}
        onPaymentComplete={() => {
          setSelectedItems([]);
          setTip(0);
          setTipType(null);
          setCustomTipAmount(0);
          refetch();
        }}
      />
    </div>
  );
}
