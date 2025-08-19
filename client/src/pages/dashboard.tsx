import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import TableCard from "@/components/table-card";
import type { DashboardTable } from "@shared/schema";

export default function Dashboard() {
  const { data: tables, isLoading, refetch } = useQuery<DashboardTable[]>({
    queryKey: ["/api/dashboard/tables"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="view-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeTables = tables?.filter(table => table.bill?.isActive) || [];
  const fullyPaidTables = activeTables.filter(table => table.bill?.status === "paid");
  const partiallyPaidTables = activeTables.filter(table => table.bill?.status === "partial");
  const unpaidTables = activeTables.filter(table => table.bill?.status === "unpaid");

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="view-container">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h2>
              <p className="text-gray-600 mt-1">Monitor table payment status in real-time</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium" data-testid="text-last-updated">Just now</p>
              </div>
              <Button onClick={handleRefresh} data-testid="button-refresh-dashboard">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Tables</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-active-tables">
                    {activeTables.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fully Paid</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-fully-paid">
                    {fullyPaidTables.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Partial Payment</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-partial-payment">
                    {partiallyPaidTables.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-accent" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unpaid</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-unpaid">
                    {unpaidTables.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables?.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>

        {!tables?.length && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tables Found</h3>
            <p className="text-gray-600">No tables are currently active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
