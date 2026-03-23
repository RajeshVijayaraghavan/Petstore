import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  preview?: string;
}

export function ImageUpload({ onFileSelect, preview }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayPreview = preview ?? localPreview;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG and PNG files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be under 5 MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    onFileSelect(file);
  }

  function clearPreview() {
    setLocalPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" />
        Choose Image
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {displayPreview && (
        <div className="relative inline-block">
          <img
            src={displayPreview}
            alt="Upload preview"
            className="h-32 w-32 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={clearPreview}
            className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-0.5 text-white shadow-sm hover:bg-destructive/80"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}
