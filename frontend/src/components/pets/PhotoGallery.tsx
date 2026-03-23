import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: string[];
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <PawPrint className="size-16 text-muted-foreground/40" />
    </div>
  );
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const validPhotos = useMemo(() => photos.filter(isValidImageUrl), [photos]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [broken, setBroken] = useState<Set<number>>(new Set());

  const safeIndex = Math.min(activeIndex, Math.max(validPhotos.length - 1, 0));

  const prev = useCallback(
    () => setActiveIndex((i) => (i > 0 ? i - 1 : validPhotos.length - 1)),
    [validPhotos.length],
  );

  const next = useCallback(
    () => setActiveIndex((i) => (i < validPhotos.length - 1 ? i + 1 : 0)),
    [validPhotos.length],
  );

  function handleError(index: number) {
    setBroken((s) => new Set(s).add(index));
  }

  if (validPhotos.length === 0) {
    return (
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        <PlaceholderImage />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-container-low">
        {broken.has(safeIndex) ? (
          <PlaceholderImage />
        ) : (
          <img
            src={validPhotos[safeIndex]}
            alt={`Photo ${safeIndex + 1}`}
            className="h-full w-full object-contain"
            onError={() => handleError(safeIndex)}
          />
        )}

        {validPhotos.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon-sm"
              className="absolute top-1/2 left-2 -translate-y-1/2 opacity-80 shadow hover:opacity-100"
              onClick={prev}
              aria-label="Previous photo"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              className="absolute top-1/2 right-2 -translate-y-1/2 opacity-80 shadow hover:opacity-100"
              onClick={next}
              aria-label="Next photo"
            >
              <ChevronRightIcon />
            </Button>
          </>
        )}
      </div>

      {validPhotos.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {validPhotos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "h-12 w-12 flex-shrink-0 overflow-hidden rounded-md transition-opacity",
                idx === safeIndex
                  ? "ring-2 ring-primary"
                  : "opacity-60 hover:opacity-100",
              )}
            >
              {broken.has(idx) ? (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <PawPrint className="size-4 text-muted-foreground/40" />
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={() => handleError(idx)}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
