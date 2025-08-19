import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, CreditCard, Loader2, X } from "lucide-react";

interface SelectedItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  billId: string;
  total: number;
  selectedItems: SelectedItem[];
  tip: number;
  onPaymentComplete: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  billId,
  total,
  selectedItems,
  tip,
  onPaymentComplete,
}: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return apiRequest("POST", "/api/payments", paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qr"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      onPaymentComplete();
      onClose();
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment!",
      });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !expiry || !cvv || !cardholderName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing delay
    setTimeout(() => {
      const subtotal = total - tip;
      const paymentItems = selectedItems.map(item => ({
        itemId: item.id,
        quantity: item.quantity,
        amount: (item.price * item.quantity),
      }));

      paymentMutation.mutate({
        billId,
        amount: subtotal.toFixed(2),
        tip: tip.toFixed(2),
        items: paymentItems,
        paymentMethod: "card",
        status: "completed",
      });
      
      setIsProcessing(false);
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    return formatted.substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full max-h-screen overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Secure Payment
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-payment">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Payment:</span>
              <span className="text-xl font-bold text-primary" data-testid="text-modal-total">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <div className="relative">
                <Input
                  id="card-number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="pl-10"
                  data-testid="input-card-number"
                />
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  data-testid="input-expiry"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                  maxLength={4}
                  data-testid="input-cvv"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cardholder-name">Cardholder Name</Label>
              <Input
                id="cardholder-name"
                type="text"
                placeholder="John Smith"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                data-testid="input-cardholder-name"
              />
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-primary mr-2" />
                <p className="text-sm text-blue-800">
                  Your payment is secured with 256-bit SSL encryption
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              disabled={paymentMutation.isPending}
              data-testid="button-pay-securely"
            >
              <Shield className="h-4 w-4 mr-2" />
              <span>Pay Securely</span>
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your payment...</p>
          </div>
        </div>
      )}
    </>
  );
}
