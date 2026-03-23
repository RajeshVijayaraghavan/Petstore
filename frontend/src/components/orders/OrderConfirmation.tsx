import type { Order } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface OrderConfirmationProps {
  order: Order;
}

function formatShipDate(iso: string | undefined): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <CheckCircle className="size-10 text-green-600" />
        <p className="text-lg font-semibold">Order Placed!</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-left text-sm">
        <dt className="text-muted-foreground">Order ID</dt>
        <dd className="font-medium">{order.id}</dd>

        <dt className="text-muted-foreground">Status</dt>
        <dd>
          <Badge variant="default">{order.status ?? "placed"}</Badge>
        </dd>

        <dt className="text-muted-foreground">Pet ID</dt>
        <dd className="font-medium">{order.petId}</dd>

        <dt className="text-muted-foreground">Quantity</dt>
        <dd className="font-medium">{order.quantity}</dd>

        <dt className="text-muted-foreground">Estimated Ship Date</dt>
        <dd className="font-medium">{formatShipDate(order.shipDate)}</dd>
      </dl>
    </div>
  );
}
