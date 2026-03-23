import type { User } from "@/api/model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserProfileProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_LABELS: Record<number, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  0: { label: "Inactive", variant: "secondary" },
  1: { label: "Active", variant: "default" },
  2: { label: "Suspended", variant: "destructive" },
};

export function UserProfile({ user, onEdit, onDelete }: UserProfileProps) {
  const status = STATUS_LABELS[user.userStatus ?? -1];

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {user.username}
          {status && (
            <Badge variant={status.variant}>{status.label}</Badge>
          )}
        </CardTitle>
        <CardAction>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <DetailRow label="First Name" value={user.firstName} />
          <DetailRow label="Last Name" value={user.lastName} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.phone} />
          <DetailRow
            label="Status"
            value={status?.label ?? String(user.userStatus ?? "—")}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value || "—"}</dd>
    </>
  );
}
