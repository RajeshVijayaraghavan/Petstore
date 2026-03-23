import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAddPet, useUpdatePet } from "@/api/pet/pet";
import type { Pet } from "@/api/model";
import { fetchPetByStringId } from "@/lib/api-client";
import { PetForm } from "@/components/pets/PetForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AddEditPetPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditMode = !!petId;

  const { data, isLoading } = useQuery({
    queryKey: [`/pet/${petId}`],
    queryFn: ({ signal }) => fetchPetByStringId(petId!, signal),
    enabled: isEditMode,
  });

  const pet = data?.status === 200 ? (data.data as Pet) : null;

  const addPetMutation = useAddPet();
  const updatePetMutation = useUpdatePet();

  const isSubmitting = addPetMutation.isPending || updatePetMutation.isPending;

  function handleSubmit(petData: Pet) {
    if (isEditMode) {
      const updatedPet: Pet = { ...petData, id: pet?.id };
      updatePetMutation.mutate(
        { data: updatedPet },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/pet/${petId}`] });
            queryClient.invalidateQueries({ queryKey: ["/pet/findByStatus"] });
            toast.success("Pet updated successfully");
            navigate(`/pets/${petId}`);
          },
          onError: () => {
            toast.error("Failed to update pet. Please try again.");
          },
        }
      );
    } else {
      addPetMutation.mutate(
        { data: petData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/pet/findByStatus"] });
            toast.success("Pet created successfully");
            navigate("/pets");
          },
          onError: () => {
            toast.error("Failed to create pet. Please try again.");
          },
        }
      );
    }
  }

  function handleCancel() {
    navigate(-1);
  }

  if (isEditMode && isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" disabled>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (isEditMode && !isLoading && !pet) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          Pet not found
        </p>
        <p className="text-sm text-muted-foreground">
          The pet you are trying to edit may have been removed.
        </p>
        <Button onClick={() => navigate("/pets")}>Back to catalogue</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" onClick={handleCancel}>
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <h1 className="text-2xl font-bold tracking-tight">
        {isEditMode ? "Edit Pet" : "Add New Pet"}
      </h1>

      <PetForm
        defaultValues={isEditMode && pet ? pet : { status: "available", photoUrls: [] }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
