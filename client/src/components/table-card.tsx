import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardTable } from "@shared/schema";

interface TableCardProps {
  table: DashboardTable;
}

export default function TableCard({ table }: TableCardProps) {
  if (!table.bill) {
    return (
      <Card className="border border-gray-200 opacity-60">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Table {table.number}</h3>
              <p className="text-sm text-gray-600">No active bill</p>
            </div>
            <Badge variant="secondary">Inactive</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = parseFloat(table.bill.total);
  const paid = parseFloat(table.bill.paid || "0");
  const remaining = parseFloat(table.bill.remaining);
  const progress = total > 0 ? (paid / total) * 100 : 0;

  const getStatusBadge = () => {
    switch (table.bill?.status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    }
  };

  const getActionButton = () => {
    switch (table.bill?.status) {
      case "paid":
        return (
          <Button variant="outline" size="sm" className="w-full text-secondary hover:bg-green-50">
            Mark Complete
          </Button>
        );
      case "unpaid":
        return (
          <Button variant="outline" size="sm" className="w-full text-accent hover:bg-red-50">
            Alert Staff
          </Button>
        );
      default:
        return (
          <Button variant="outline" size="sm" className="w-full text-primary hover:bg-blue-50">
            View Details
          </Button>
        );
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className="shadow-lg border border-gray-200 overflow-hidden" data-testid={`card-table-${table.number}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900" data-testid={`text-table-${table.number}`}>
              Table {table.number}
            </h3>
            <p className="text-sm text-gray-600">
              {table.guestCount} guests • {formatTime(table.startTime)}
            </p>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Bill:</span>
            <span className="font-medium" data-testid={`text-table-total-${table.number}`}>
              ${total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Paid:</span>
            <span className="font-medium text-secondary" data-testid={`text-table-paid-${table.number}`}>
              ${paid.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-900">Remaining:</span>
            <span className="text-accent" data-testid={`text-table-remaining-${table.number}`}>
              ${remaining.toFixed(2)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-secondary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
              data-testid={`progress-table-${table.number}`}
            />
          </div>
          
          <div className="pt-2">
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
