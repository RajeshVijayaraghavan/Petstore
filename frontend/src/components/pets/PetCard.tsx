import { useState } from "react";
import type { Pet } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint } from "lucide-react";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  available: "default",
  pending: "secondary",
  sold: "destructive",
};

function isValidImageUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function Placeholder() {
  return (
    <div className="flex h-48 w-full items-center justify-center bg-muted">
      <PawPrint className="size-12 text-muted-foreground/40" />
    </div>
  );
}

export default function PetCard({ pet, onClick }: { pet: Pet; onClick: () => void }) {
  const photoUrl = pet.photoUrls?.find(isValidImageUrl);
  const [imgError, setImgError] = useState(false);

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      {photoUrl && !imgError ? (
        <img
          src={photoUrl}
          alt={pet.name}
          className="h-48 w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <Placeholder />
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{pet.name}</span>
          {pet.status && (
            <Badge variant={statusColors[pet.status] ?? "outline"}>
              {pet.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pet.category?.name && (
          <p className="text-sm text-muted-foreground">{pet.category.name}</p>
        )}
      </CardContent>
    </Card>
  );
}
