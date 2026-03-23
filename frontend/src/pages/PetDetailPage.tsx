import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { usePlaceOrder } from "@/api/store/store";
import type { Order, Pet } from "@/api/model";
import { fetchPetByStringId, deletePetByStringId } from "@/lib/api-client";
import { PhotoGallery } from "@/components/pets/PhotoGallery";
import { DeleteConfirmDialog } from "@/components/pets/DeleteConfirmDialog";
import { OrderForm } from "@/components/orders/OrderForm";
import { OrderConfirmation } from "@/components/orders/OrderConfirmation";
import { QueryErrorState } from "@/components/layout/QueryErrorState";
import { mapErrorToMessage } from "@/lib/error-mapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Pencil, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  available: "default",
  pending: "secondary",
  sold: "destructive",
};

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-80 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-5 w-32" />
    </div>
  );
}

export default function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [`/pet/${petId}`],
    queryFn: ({ signal }) => fetchPetByStringId(petId!, signal),
    enabled: !!petId,
  });

  const pet = data?.status === 200 ? (data.data as Pet) : null;

  const deletePetMutation = useMutation({
    mutationFn: () => deletePetByStringId(petId!),
  });
  const placeOrderMutation = usePlaceOrder();

  function handleDelete() {
    deletePetMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/pet/findByStatus"] });
        toast.success("Pet deleted successfully");
        navigate("/pets");
      },
      onError: () => {
        toast.error("Failed to delete pet. Please try again.");
        setDeleteDialogOpen(false);
      },
    });
  }

  function handlePlaceOrder(formData: { petId: string; quantity: number }) {
    placeOrderMutation.mutate(
      {
        data: {
          petId: pet?.id,
          quantity: formData.quantity,
          status: "placed",
        },
      },
      {
        onSuccess: (response) => {
          const order =
            response && "data" in response
              ? (response as { data: Order }).data
              : null;
          if (order) {
            setConfirmedOrder(order);
            queryClient.invalidateQueries({ queryKey: ["/store/inventory"] });
            toast.success("Order placed successfully");
          }
        },
        onError: (err) => {
          toast.error(
            mapErrorToMessage(err) || "Failed to place order. Please try again."
          );
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" disabled>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 py-16 text-center">
        <QueryErrorState
          error={error ?? new Error("Pet not found")}
          onRetry={() => refetch()}
        />
        <Button onClick={() => navigate("/pets")}>Back to catalogue</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{pet.name}</h1>
            {pet.category?.name && (
              <p className="text-muted-foreground">{pet.category.name}</p>
            )}
          </div>
          {pet.status && (
            <Badge
              variant={statusVariant[pet.status] ?? "outline"}
              className="shrink-0 text-sm"
            >
              {pet.status}
            </Badge>
          )}
        </div>

        <PhotoGallery photos={pet.photoUrls ?? []} />

        {pet.tags && pet.tags.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {pet.tags.map((tag) => (
                <Badge key={tag.id ?? tag.name} variant="outline" className="rounded-full">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-6">
          <Link to={`/pets/${petId}/edit`}>
            <Button variant="outline">
              <Pencil className="size-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          {pet.status === "available" && (
            <Button onClick={() => setOrderDialogOpen(true)}>
              <ShoppingCart className="size-4" />
              Place Order
            </Button>
          )}
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isDeleting={deletePetMutation.isPending}
      />

      <Dialog
        open={orderDialogOpen}
        onOpenChange={(open) => {
          setOrderDialogOpen(open);
          if (!open) setConfirmedOrder(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmedOrder ? "Order Confirmation" : "Place Order"}
            </DialogTitle>
          </DialogHeader>
          {confirmedOrder ? (
            <div className="space-y-4">
              <OrderConfirmation order={confirmedOrder} />
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setOrderDialogOpen(false);
                    setConfirmedOrder(null);
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <OrderForm
              petId={petId!}
              petName={pet.name}
              onSubmit={handlePlaceOrder}
              onCancel={() => setOrderDialogOpen(false)}
              isSubmitting={placeOrderMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
