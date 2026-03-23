import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface StatusCardProps {
  status: string;
  count: number;
  linkTo: string;
  linkLabel: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; badge: string }> = {
  available: {
    bg: "bg-status-available/10",
    text: "text-status-available",
    badge: "bg-status-available text-status-available-foreground",
  },
  pending: {
    bg: "bg-status-pending/10",
    text: "text-status-pending",
    badge: "bg-status-pending text-status-pending-foreground",
  },
  sold: {
    bg: "bg-status-sold/10",
    text: "text-status-sold",
    badge: "bg-status-sold text-status-sold-foreground",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-muted/30",
  text: "text-muted-foreground",
  badge: "bg-muted text-muted-foreground",
};

export function StatusCard({ status, count, linkTo, linkLabel }: StatusCardProps) {
  const style = STATUS_STYLES[status] ?? DEFAULT_STYLE;

  return (
    <Card className="bg-surface-container-lowest">
      <CardContent className="flex flex-col items-center gap-2 pt-2">
        <span
          className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider ${style.badge}`}
        >
          {status}
        </span>
        <p className={`text-5xl font-bold tracking-tight ${style.text}`}>
          {count.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          {count === 1 ? "pet" : "pets"}
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
