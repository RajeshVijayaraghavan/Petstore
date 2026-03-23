import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Pet } from "@/api/model";
import { PetStatus } from "@/api/model/petStatus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagChipInput } from "@/components/pets/TagChipInput";
import { ImageUpload } from "@/components/pets/ImageUpload";

const tagSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
});

const petFormSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  categoryName: z.string().optional(),
  status: z.enum(["available", "pending", "sold"]),
  tags: z.array(tagSchema),
  photoUrls: z.array(z.string()),
});

type PetFormValues = z.infer<typeof petFormSchema>;

interface PetFormProps {
  defaultValues?: Partial<Pet>;
  onSubmit: (data: Pet) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function petToFormValues(pet?: Partial<Pet>): PetFormValues {
  return {
    name: pet?.name ?? "",
    categoryName: pet?.category?.name ?? "",
    status: pet?.status ?? PetStatus.available,
    tags: pet?.tags ?? [],
    photoUrls: pet?.photoUrls ?? [],
  };
}

function formValuesToPet(values: PetFormValues, existingPet?: Partial<Pet>): Pet {
  return {
    ...existingPet,
    name: values.name,
    category: values.categoryName
      ? { id: existingPet?.category?.id, name: values.categoryName }
      : undefined,
    status: values.status as Pet["status"],
    tags: values.tags,
    photoUrls: values.photoUrls,
  };
}

export function PetForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: PetFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: petToFormValues(defaultValues),
  });

  function handleFormSubmit(values: PetFormValues) {
    onSubmit(formValuesToPet(values, defaultValues));
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Core Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="pet-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="pet-name"
              {...register("name")}
              placeholder="Enter pet name"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pet-category" className="text-sm font-medium">
              Category
            </label>
            <Input
              id="pet-category"
              {...register("categoryName")}
              placeholder="e.g. Dogs, Cats, Birds"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PetStatus.available}>
                      Available
                    </SelectItem>
                    <SelectItem value={PetStatus.pending}>
                      Pending
                    </SelectItem>
                    <SelectItem value={PetStatus.sold}>Sold</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discovery Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagChipInput value={field.value} onChange={field.onChange} />
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="photoUrls"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <ImageUpload
                  onFileSelect={(file) => {
                    const url = URL.createObjectURL(file);
                    field.onChange([...field.value, url]);
                  }}
                />
                {field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`Pet photo ${index + 1}`}
                          className="h-20 w-20 rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            field.onChange(
                              field.value.filter((_, i) => i !== index)
                            )
                          }
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-0.5 text-white shadow-sm hover:bg-destructive/80"
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          <span className="block size-3 text-center text-xs leading-3">
                            ×
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
