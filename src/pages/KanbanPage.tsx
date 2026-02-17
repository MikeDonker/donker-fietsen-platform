import { useState, useMemo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useWorkOrders, useUpdateWorkOrder } from "@/hooks/use-work-orders";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { WorkOrderDetailSheet } from "@/components/kanban/WorkOrderDetailSheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ServiceWorkOrder, WorkOrderStatus } from "@/lib/types";

const COLUMNS: Array<{ status: WorkOrderStatus; label: string; color: string }> = [
  { status: "OPEN", label: "Open", color: "bg-blue-500" },
  { status: "IN_PROGRESS", label: "In Behandeling", color: "bg-orange-500" },
  { status: "WAITING_PARTS", label: "Wacht op Onderdelen", color: "bg-yellow-500" },
  { status: "COMPLETED", label: "Voltooid", color: "bg-green-500" },
];

export default function KanbanPage() {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<ServiceWorkOrder | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: workOrders, isLoading, isError, refetch, isRefetching } = useWorkOrders();
  const updateMutation = useUpdateWorkOrder();

  const workOrdersByStatus = useMemo(() => {
    const result: Record<WorkOrderStatus, ServiceWorkOrder[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      WAITING_PARTS: [],
      COMPLETED: [],
      CANCELLED: [],
    };
    (workOrders ?? []).forEach((wo) => {
      if (result[wo.status]) {
        result[wo.status].push(wo);
      }
    });
    return result;
  }, [workOrders]);

  const handleCardClick = (wo: ServiceWorkOrder) => {
    setSelectedWorkOrder(wo);
    setSheetOpen(true);
  };

  const handleStatusChange = (status: WorkOrderStatus) => {
    if (selectedWorkOrder) {
      updateMutation.mutate(
        { id: selectedWorkOrder.id, data: { status } },
        {
          onSuccess: () => {
            setSelectedWorkOrder((prev) => (prev ? { ...prev, status } : null));
          },
        }
      );
    }
  };

  if (isError) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-red-400 text-xl font-semibold mb-2">Fout bij laden</h2>
        <p className="text-gray-500 text-center mb-6">
          Kan werkorders niet laden. Probeer het opnieuw.
        </p>
        <Button onClick={() => refetch()} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Opnieuw proberen
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-100 text-2xl lg:text-3xl font-extrabold">Werkplaats</h1>
          <p className="text-gray-500 text-sm mt-1">Werkorders kanban bord</p>
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

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            column={column}
            workOrders={workOrdersByStatus[column.status]}
            onCardClick={handleCardClick}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Detail Sheet */}
      <WorkOrderDetailSheet
        workOrder={selectedWorkOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onStatusChange={handleStatusChange}
        isUpdating={updateMutation.isPending}
      />
    </div>
  );
}
