import { useLocation } from "wouter";
import { Link } from "wouter";
import { Utensils } from "lucide-react";

export default function NavigationHeader() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Utensils className="text-primary text-xl" />
            <h1 className="text-xl font-bold text-gray-900">SplitBill</h1>
          </div>
          <div className="flex space-x-2">
            <Link href="/">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/") && !location.includes("/dashboard") && !location.includes("/qr") && !location.includes("/waiter")
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                data-testid="button-customer-view"
              >
                Customer View
              </button>
            </Link>
            <Link href="/dashboard">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/dashboard")
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                data-testid="button-dashboard-view"
              >
                Restaurant Dashboard
              </button>
            </Link>
            <Link href="/qr">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/qr")
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                data-testid="button-qr-view"
              >
                QR Generator
              </button>
            </Link>
            <Link href="/waiter">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/waiter")
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                data-testid="button-waiter-view"
              >
                Waiter
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
