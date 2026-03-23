import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetOrderById,
  useDeleteOrder,
  getGetOrderByIdQueryKey,
  getGetInventoryQueryKey,
} from "@/api/store/store";
import type { getOrderByIdResponse, getOrderByIdResponseSuccess } from "@/api/store/store";
import type { Order } from "@/api/model";
import { OrderSearch } from "@/components/orders/OrderSearch";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { mapErrorToMessage } from "@/lib/error-mapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function extractOrder(
  data: unknown
): Order | null {
  const response = data as getOrderByIdResponse | undefined;
  if (!response || response.status !== 200) return null;
  return (response as getOrderByIdResponseSuccess).data;
}

export default function OrdersPage() {
  const [searchId, setSearchId] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: orderResponse,
    isLoading,
    isError,
    error: queryError,
  } = useGetOrderById(searchId ?? 0, {
    query: { enabled: !!searchId },
  });

  const order = searchId ? extractOrder(orderResponse) : null;
  const is404 =
    searchId && !isLoading && !order && (isError || orderResponse?.status === 404);

  const deleteOrderMutation = useDeleteOrder({
    mutation: {
      onSuccess: () => {
        if (searchId) {
          queryClient.invalidateQueries({
            queryKey: getGetOrderByIdQueryKey(searchId),
          });
        }
        queryClient.invalidateQueries({
          queryKey: getGetInventoryQueryKey(),
        });
        toast.success("Order cancelled successfully");
        setSearchId(null);
        setCancelDialogOpen(false);
      },
    },
  });

  const handleSearch = (orderId: number) => {
    setSearchId(orderId);
  };

  const handleCancelOrder = () => {
    if (!order?.id) return;
    deleteOrderMutation.mutate({ orderId: order.id });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Order Lookup</h1>

      <OrderSearch onSearch={handleSearch} />

      {isLoading && searchId && (
        <p className="text-sm text-muted-foreground">Loading order…</p>
      )}

      {is404 && (
        <p className="text-sm text-destructive">
          {isError
            ? mapErrorToMessage(queryError)
            : "Order not found. Please check the ID and try again."}
        </p>
      )}

      {order && (
        <OrderDetail
          order={order}
          onCancel={() => setCancelDialogOpen(true)}
          isCancelling={deleteOrderMutation.isPending}
        />
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order #{order?.id}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Keep Order
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={deleteOrderMutation.isPending}
            >
              {deleteOrderMutation.isPending
                ? "Cancelling…"
                : "Yes, Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
