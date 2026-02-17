import { useNavigate } from "react-router-dom";
import {
  Bike,
  Package,
  Wrench,
  ShoppingCart,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { StatCard, StatCardSkeleton } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number | null) {
  if (amount == null) return "-";
  return `\u20AC ${amount.toFixed(2)}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" });
}

interface RecentSaleCardProps {
  sale: {
    id: number;
    frameNumber: string;
    brand: { name: string };
    model: { name: string };
    sellingPrice: number | null;
    soldAt: string;
  };
}

function RecentSaleCard({ sale }: RecentSaleCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-slate-100 text-sm font-semibold truncate">
          {sale.brand.name} {sale.model.name}
        </p>
        <p className="text-gray-500 text-xs mt-1">Frame: {sale.frameNumber}</p>
      </div>
      <div className="text-right ml-4">
        <p className="text-green-400 text-lg font-bold">
          {formatCurrency(sale.sellingPrice)}
        </p>
        <div className="flex items-center gap-1 text-gray-500 mt-1 justify-end">
          <Calendar className="w-3 h-3" />
          <span className="text-xs">{formatDate(sale.soldAt)}</span>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="h-8 w-40 bg-slate-800 rounded mb-2" />
        <div className="h-4 w-56 bg-slate-800 rounded" />
      </div>

      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
        Fietsen
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
        Werkorders
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, refetch, isRefetching } = useDashboardStats();

  const navigateToBikes = () => navigate("/bikes");
  const navigateToWorkshop = () => navigate("/kanban");

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !stats) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-red-400 text-xl font-semibold mb-2">Fout bij laden</h2>
        <p className="text-gray-500 text-center mb-6">
          Kan dashboard niet laden. Probeer het opnieuw.
        </p>
        <Button onClick={() => refetch()} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Opnieuw proberen
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-slate-100 text-2xl lg:text-3xl font-extrabold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Overzicht van je fietswinkel
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="ghost"
          size="icon"
          disabled={isRefetching}
          className="text-slate-400 hover:text-slate-100"
        >
          <RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />
        </Button>
      </div>

      {/* Bikes Stats */}
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
        Fietsen
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={Bike}
          label="Totaal"
          value={stats.totalBikes}
          color="blue"
          onClick={navigateToBikes}
        />
        <StatCard
          icon={Package}
          label="Op Voorraad"
          value={stats.bikesInStock}
          color="green"
          onClick={navigateToBikes}
        />
        <StatCard
          icon={Wrench}
          label="In Service"
          value={stats.bikesInService}
          color="orange"
          onClick={navigateToWorkshop}
        />
        <StatCard
          icon={ShoppingCart}
          label="Verkocht"
          value={stats.bikesSold}
          color="purple"
          onClick={navigateToBikes}
        />
      </div>

      {/* Work Orders Stats */}
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
        Werkorders
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={ClipboardList}
          label="Open"
          value={stats.openWorkOrders}
          color="blue"
          subtitle={`${stats.totalWorkOrders} totaal`}
          onClick={navigateToWorkshop}
        />
        <div
          onClick={navigateToWorkshop}
          className={cn(
            "flex-1 bg-slate-800 rounded-2xl p-4 border cursor-pointer",
            "transition-all duration-200 hover:bg-slate-800/80",
            stats.urgentWorkOrders > 0
              ? "border-red-500/40"
              : "border-slate-700"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
              stats.urgentWorkOrders > 0
                ? "bg-red-500/20"
                : "bg-gray-500/20"
            )}
          >
            <AlertTriangle
              className={cn(
                "w-5 h-5",
                stats.urgentWorkOrders > 0 ? "text-red-400" : "text-gray-400"
              )}
            />
          </div>
          <p className="text-gray-400 text-sm mb-1">Urgent</p>
          <p
            className={cn(
              "text-3xl font-extrabold",
              stats.urgentWorkOrders > 0 ? "text-red-400" : "text-slate-100"
            )}
          >
            {stats.urgentWorkOrders}
          </p>
          <p
            className={cn(
              "text-xs mt-1",
              stats.urgentWorkOrders > 0 ? "text-red-400" : "text-green-400"
            )}
          >
            {stats.urgentWorkOrders > 0 ? "Actie vereist" : "Alles onder controle"}
          </p>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
          Recente Verkopen
        </p>
      </div>

      {stats.recentSales.length > 0 ? (
        <div className="space-y-2">
          {stats.recentSales.map((sale) => (
            <RecentSaleCard key={sale.id} sale={sale} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex flex-col items-center">
          <ShoppingCart className="w-8 h-8 text-slate-600 mb-3" />
          <p className="text-gray-500 text-sm">Nog geen recente verkopen</p>
        </div>
      )}
    </div>
  );
}
