import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface TagValue {
  id?: number;
  name?: string;
}

interface TagChipInputProps {
  value: TagValue[];
  onChange: (tags: TagValue[]) => void;
}

export function TagChipInput({ value, onChange }: TagChipInputProps) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const alreadyExists = value.some(
      (tag) => tag.name?.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      setInput("");
      return;
    }

    onChange([...value, { name: trimmed }]);
    setInput("");
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag…"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag, index) => (
            <Badge
              key={tag.id ?? `${tag.name}-${index}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Remove ${tag.name}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
