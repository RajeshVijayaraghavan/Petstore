import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statuses = [
  { value: "available", label: "Available" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
];

export default function StatusFilterTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (status: string) => void;
}) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        {statuses.map((s) => (
          <TabsTrigger key={s.value} value={s.value}>
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
