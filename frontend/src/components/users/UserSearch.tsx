import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserSearchProps {
  onSearch: (username: string) => void;
}

export function UserSearch({ onSearch }: UserSearchProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        placeholder="Enter username…"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="max-w-xs"
      />
      <Button type="submit" disabled={!username.trim()}>
        Search
      </Button>
    </form>
  );
}
