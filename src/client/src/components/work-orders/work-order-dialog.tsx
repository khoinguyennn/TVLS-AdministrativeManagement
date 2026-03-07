"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkOrderForm } from "./work-order-form";
import type { CreateWorkOrderPayload, UpdateWorkOrderPayload, WorkOrder } from "@/types/work-order.types";
import type { PersonnelRecord } from "@/types/personnel.types";

interface WorkOrderDialogProps {
  workOrder?: WorkOrder;
  personnel: PersonnelRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWorkOrderPayload | UpdateWorkOrderPayload) => Promise<void>;
  isLoading?: boolean;
}

export function WorkOrderDialog({
  workOrder,
  personnel,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false
}: WorkOrderDialogProps) {
  const handleSubmit = async (data: CreateWorkOrderPayload | UpdateWorkOrderPayload) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workOrder ? "Chỉnh sửa công lệnh" : "Tạo công lệnh mới"}
          </DialogTitle>
        </DialogHeader>
        <WorkOrderForm
          workOrder={workOrder}
          personnel={personnel}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}