import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { BillWithItems } from "@shared/schema";

interface BillStatusCardProps {
  bill: BillWithItems;
}

export default function BillStatusCard({ bill }: BillStatusCardProps) {
  const total = parseFloat(bill.total);
  const paid = parseFloat(bill.paid || "0");
  const remaining = parseFloat(bill.remaining);
  const progress = total > 0 ? (paid / total) * 100 : 0;

  const getStatusColor = () => {
    switch (bill.status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusText = () => {
    switch (bill.status) {
      case "paid":
        return "Fully Paid";
      case "partial":
        return "Partially Paid";
      default:
        return "Unpaid";
    }
  };

  return (
    <Card className="shadow-lg border border-gray-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bill Status</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`} data-testid="status-bill">
            <Clock className="w-3 h-3 mr-1" />
            {getStatusText()}
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Total Bill:</span>
            <span className="font-semibold text-gray-900" data-testid="text-total-bill">
              ${total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Paid So Far:</span>
            <span className="font-semibold text-secondary" data-testid="text-paid-amount">
              ${paid.toFixed(2)}
            </span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-xl font-bold">
              <span className="text-gray-900">Remaining:</span>
              <span className="text-accent" data-testid="text-remaining-amount">
                ${remaining.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              data-testid="progress-payment"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
