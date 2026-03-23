import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const orderSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  petId: string;
  petName: string;
  onSubmit: (data: { petId: string; quantity: number }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function OrderForm({
  petId,
  petName,
  onSubmit,
  onCancel,
  isSubmitting,
}: OrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity: 1 },
  });

  const submit = (values: OrderFormValues) => {
    onSubmit({ petId, quantity: values.quantity });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">
          Pet
        </label>
        <p className="text-sm">
          {petId} — {petName}
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="quantity" className="text-sm font-medium">
          Quantity
        </label>
        <Input
          id="quantity"
          type="number"
          min={1}
          {...register("quantity", { valueAsNumber: true })}
          aria-invalid={!!errors.quantity}
        />
        {errors.quantity && (
          <p className="text-xs text-destructive">{errors.quantity.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Placing Order…" : "Place Order"}
        </Button>
      </div>
    </form>
  );
}
