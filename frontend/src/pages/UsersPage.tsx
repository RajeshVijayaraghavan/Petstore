import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@/api/model";
import {
  useGetUserByName,
  getGetUserByNameQueryKey,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/api/user/user";
import { mapErrorToMessage, getErrorStatus } from "@/lib/error-mapper";
import { UserSearch } from "@/components/users/UserSearch";
import { UserForm } from "@/components/users/UserForm";
import { UserProfile } from "@/components/users/UserProfile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type DialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; user: User }
  | { kind: "delete"; user: User };

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchUsername, setSearchUsername] = useState("");
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });

  const {
    data: userResponse,
    isLoading,
    error,
  } = useGetUserByName<
    Awaited<ReturnType<typeof import("@/api/user/user").getUserByName>>,
    Error
  >(searchUsername, {
    query: { enabled: !!searchUsername },
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const user = userResponse && "data" in userResponse ? (userResponse.data as User) : undefined;
  const is404 = error ? getErrorStatus(error) === 404 : false;

  const closeDialog = () => setDialog({ kind: "closed" });

  const handleCreate = (data: User) => {
    createUser.mutate(
      { data },
      {
        onSuccess: () => {
          toast.success(`User "${data.username}" created successfully`);
          closeDialog();
          if (data.username) {
            setSearchUsername(data.username);
            queryClient.invalidateQueries({
              queryKey: getGetUserByNameQueryKey(data.username),
            });
          }
        },
        onError: (err) => toast.error(mapErrorToMessage(err)),
      },
    );
  };

  const handleUpdate = (data: User) => {
    if (!data.username) return;
    updateUser.mutate(
      { username: data.username, data },
      {
        onSuccess: () => {
          toast.success(`User "${data.username}" updated successfully`);
          closeDialog();
          queryClient.invalidateQueries({
            queryKey: getGetUserByNameQueryKey(data.username!),
          });
        },
        onError: (err) => toast.error(mapErrorToMessage(err)),
      },
    );
  };

  const handleDelete = () => {
    if (dialog.kind !== "delete") return;
    const username = dialog.user.username!;
    deleteUser.mutate(
      { username },
      {
        onSuccess: () => {
          toast.success(`User "${username}" deleted successfully`);
          closeDialog();
          setSearchUsername("");
          queryClient.removeQueries({
            queryKey: getGetUserByNameQueryKey(username),
          });
        },
        onError: (err) => toast.error(mapErrorToMessage(err)),
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">User Management</h1>
        <Button onClick={() => setDialog({ kind: "create" })}>
          Create User
        </Button>
      </div>

      <UserSearch onSearch={setSearchUsername} />

      {isLoading && searchUsername && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Looking up "{searchUsername}"…
        </div>
      )}

      {is404 && (
        <p className="text-sm text-muted-foreground">
          User not found for "{searchUsername}".
        </p>
      )}

      {error && !is404 && (
        <p className="text-sm text-destructive">{mapErrorToMessage(error)}</p>
      )}

      {user && (
        <UserProfile
          user={user}
          onEdit={() => setDialog({ kind: "edit", user })}
          onDelete={() => setDialog({ kind: "delete", user })}
        />
      )}

      {/* Create Dialog */}
      <Dialog
        open={dialog.kind === "create"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Fill in the details for the new user.</DialogDescription>
          </DialogHeader>
          <UserForm
            mode="create"
            onSubmit={handleCreate}
            onCancel={closeDialog}
            isSubmitting={createUser.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={dialog.kind === "edit"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details for "{dialog.kind === "edit" ? dialog.user.username : ""}".
            </DialogDescription>
          </DialogHeader>
          {dialog.kind === "edit" && (
            <UserForm
              mode="edit"
              defaultValues={dialog.user}
              onSubmit={handleUpdate}
              onCancel={closeDialog}
              isSubmitting={updateUser.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialog.kind === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              {dialog.kind === "delete" ? dialog.user.username : ""}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
