import { useMemo } from "react";
import { useGetInventory } from "@/api/store/store";
import type { getInventoryResponse } from "@/api/store/store";
import { useFindPetsByStatus } from "@/api/pet/pet";
import type { findPetsByStatusResponse } from "@/api/pet/pet";
import { FindPetsByStatusStatus } from "@/api/model";
import { StatusCard } from "@/components/inventory/StatusCard";
import { QueryErrorState } from "@/components/layout/QueryErrorState";
import { Skeleton } from "@/components/ui/skeleton";

const STATUSES = [
  { key: "available" as const, linkLabel: "View Catalogue" },
  { key: "pending" as const, linkLabel: "Review Orders" },
  { key: "sold" as const, linkLabel: "View Catalogue" },
];

function extractCounts(response: getInventoryResponse | undefined): Record<string, number> | null {
  if (!response || response.status !== 200) return null;
  return response.data;
}

function countFromPetQuery(response: findPetsByStatusResponse | undefined): number {
  if (!response || response.status !== 200) return 0;
  return response.data.length;
}

export default function InventoryPage() {
  const inventoryQuery = useGetInventory();

  const availableQuery = useFindPetsByStatus(
    { status: FindPetsByStatusStatus.available },
    { query: { enabled: inventoryQuery.isError } }
  );
  const pendingQuery = useFindPetsByStatus(
    { status: FindPetsByStatusStatus.pending },
    { query: { enabled: inventoryQuery.isError } }
  );
  const soldQuery = useFindPetsByStatus(
    { status: FindPetsByStatusStatus.sold },
    { query: { enabled: inventoryQuery.isError } }
  );

  const inventoryCounts = extractCounts(inventoryQuery.data);
  const usingFallback = inventoryQuery.isError;
  const fallbackLoading = usingFallback && (availableQuery.isLoading || pendingQuery.isLoading || soldQuery.isLoading);
  const fallbackError = usingFallback && availableQuery.isError && pendingQuery.isError && soldQuery.isError;

  const counts = useMemo<Record<string, number>>(() => {
    if (inventoryCounts) return inventoryCounts;
    if (usingFallback) {
      return {
        available: countFromPetQuery(availableQuery.data as findPetsByStatusResponse | undefined),
        pending: countFromPetQuery(pendingQuery.data as findPetsByStatusResponse | undefined),
        sold: countFromPetQuery(soldQuery.data as findPetsByStatusResponse | undefined),
      };
    }
    return {};
  }, [inventoryCounts, usingFallback, availableQuery.data, pendingQuery.data, soldQuery.data]);

  const isLoading = inventoryQuery.isLoading || fallbackLoading;
  const isError = !inventoryQuery.isLoading && !usingFallback ? inventoryQuery.isError : fallbackError;

  function handleRetry() {
    inventoryQuery.refetch();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Inventory Dashboard</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-4 rounded-xl bg-surface-container-lowest p-6">
              <Skeleton className="mx-auto h-5 w-20" />
              <Skeleton className="mx-auto h-12 w-24" />
              <Skeleton className="mx-auto h-4 w-12" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <QueryErrorState error={inventoryQuery.error} onRetry={handleRetry} />
      ) : (
        <>
          {usingFallback && (
            <p className="text-sm text-muted-foreground">
              Inventory endpoint unavailable — showing counts from pet listings.
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATUSES.map(({ key, linkLabel }) => (
              <StatusCard
                key={key}
                status={key}
                count={counts[key] ?? 0}
                linkTo={`/pets?status=${key}`}
                linkLabel={linkLabel}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
