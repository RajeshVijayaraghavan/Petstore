import type { Order } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface OrderDetailProps {
  order: Order;
  onCancel: () => void;
  isCancelling: boolean;
}

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  placed: "secondary",
  approved: "default",
  delivered: "outline",
};

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

export function OrderDetail({ order, onCancel, isCancelling }: OrderDetailProps) {
  const canCancel = order.status === "placed";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order #{order.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Pet ID</dt>
          <dd className="font-medium">{order.petId}</dd>

          <dt className="text-muted-foreground">Quantity</dt>
          <dd className="font-medium">{order.quantity}</dd>

          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <Badge variant={statusVariant[order.status ?? ""] ?? "outline"}>
              {order.status}
            </Badge>
          </dd>

          <dt className="text-muted-foreground">Ship Date</dt>
          <dd className="font-medium">{formatShipDate(order.shipDate)}</dd>

          <dt className="text-muted-foreground">Complete</dt>
          <dd className="font-medium">{order.complete ? "Yes" : "No"}</dd>
        </dl>
      </CardContent>
      {canCancel && (
        <CardFooter>
          <Button
            variant="destructive"
            onClick={onCancel}
            disabled={isCancelling}
          >
            <Trash2 className="size-4" />
            {isCancelling ? "Cancelling…" : "Cancel Order"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
