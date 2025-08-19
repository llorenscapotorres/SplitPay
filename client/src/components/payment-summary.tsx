import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentSummaryProps {
  subtotal: number;
  tip: number;
  total: number;
  tipType: "percentage" | "custom" | null;
  onTipChange: (percentage: number | null, customAmount?: number) => void;
}

export default function PaymentSummary({
  subtotal,
  tip,
  total,
  tipType,
  onTipChange,
}: PaymentSummaryProps) {
  const tipPercentages = [15, 18, 20];

  const handlePercentageClick = (percentage: number) => {
    onTipChange(percentage);
  };

  const handleCustomTip = (amount: number) => {
    onTipChange(null, amount);
  };

  return (
    <Card className="shadow-lg border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Payment</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Selected Items:</span>
            <span className="font-medium" data-testid="text-subtotal">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          
          {/* Tip Selector */}
          <div className="border-t pt-3">
            <Label className="block text-sm font-medium text-gray-700 mb-3">Add Tip</Label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {tipPercentages.map((percentage) => (
                <Button
                  key={percentage}
                  variant="outline"
                  size="sm"
                  className={`transition-colors ${
                    tipType === "percentage" && tip === percentage
                      ? "border-primary text-primary bg-blue-50"
                      : "border-gray-300 hover:border-primary hover:text-primary"
                  }`}
                  onClick={() => handlePercentageClick(percentage)}
                  data-testid={`button-tip-${percentage}`}
                >
                  {percentage}%
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className={`transition-colors ${
                  tipType === "custom"
                    ? "border-primary text-primary bg-blue-50"
                    : "border-gray-300 hover:border-primary hover:text-primary"
                }`}
                onClick={() => onTipChange(null, 0)}
                data-testid="button-tip-custom"
              >
                Custom
              </Button>
            </div>
            {tipType === "custom" && (
              <Input
                type="number"
                placeholder="Enter custom tip amount"
                className="w-full"
                step="0.01"
                min="0"
                onChange={(e) => handleCustomTip(parseFloat(e.target.value) || 0)}
                data-testid="input-custom-tip"
              />
            )}
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Tip:</span>
            <span className="font-medium" data-testid="text-tip-amount">
              ${tip.toFixed(2)}
            </span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between text-xl font-bold">
              <span className="text-gray-900">Total to Pay:</span>
              <span className="text-primary" data-testid="text-total-payment">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
