import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@/api/model";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  firstName: z.string(),
  lastName: z.string(),
  email: z.union([z.email("Invalid email address"), z.literal("")]),
  phone: z.string(),
  password: z.string(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  defaultValues?: Partial<User>;
  onSubmit: (data: User) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
}

export function UserForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  mode,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: defaultValues?.username ?? "",
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      password: "",
    },
  });

  const submitHandler = (values: UserFormValues) => {
    const user: User = { ...defaultValues, ...values };
    if (!values.password) {
      delete user.password;
    }
    onSubmit(user);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="grid gap-4">
      <Field label="Username" error={errors.username?.message}>
        <Input
          {...register("username")}
          readOnly={mode === "edit"}
          className={mode === "edit" ? "bg-muted cursor-not-allowed" : ""}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" error={errors.firstName?.message}>
          <Input {...register("firstName")} />
        </Field>
        <Field label="Last Name" error={errors.lastName?.message}>
          <Input {...register("lastName")} />
        </Field>
      </div>

      <Field label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>

      <Field label="Phone" error={errors.phone?.message}>
        <Input type="tel" {...register("phone")} />
      </Field>

      <Field label="Password" error={errors.password?.message}>
        <Input
          type="password"
          {...register("password")}
          placeholder={mode === "edit" ? "Leave blank to keep current" : ""}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
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

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
