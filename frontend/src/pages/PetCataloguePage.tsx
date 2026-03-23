import { useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFindPetsByStatus, useFindPetsByTags } from "@/api/pet/pet";
import type {
  findPetsByStatusResponse,
  findPetsByTagsResponse,
} from "@/api/pet/pet";
import type { Pet } from "@/api/model";
import { FindPetsByStatusStatus } from "@/api/model";
import PetCard from "@/components/pets/PetCard";
import StatusFilterTabs from "@/components/pets/StatusFilterTabs";
import SortControl from "@/components/pets/SortControl";
import Pagination from "@/components/pets/Pagination";
import TagSearch from "@/components/pets/TagSearch";
import { QueryErrorState } from "@/components/layout/QueryErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const PAGE_SIZE = 12;

const VALID_STATUSES = new Set<string>(
  Object.values(FindPetsByStatusStatus)
);

function isValidStatus(s: string): s is FindPetsByStatusStatus {
  return VALID_STATUSES.has(s);
}

function extractPetsFromStatusResponse(
  response: findPetsByStatusResponse | undefined
): Pet[] {
  if (!response || response.status !== 200) return [];
  return response.data;
}

function extractPetsFromTagsResponse(
  response: findPetsByTagsResponse | undefined
): Pet[] {
  if (!response || response.status !== 200) return [];
  return response.data;
}

function sortPets(pets: Pet[], sort: string): Pet[] {
  const sorted = [...pets];
  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "newest":
    default:
      return sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  }
}

export default function PetCataloguePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get("status") ?? "available";
  const status = isValidStatus(statusParam) ? statusParam : "available";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const tagsParam = searchParams.get("tags");
  const searchTags = useMemo(
    () => (tagsParam ? tagsParam.split(",").filter(Boolean) : []),
    [tagsParam]
  );

  const isTagSearch = searchTags.length > 0;

  const statusQuery = useFindPetsByStatus(
    { status },
    { query: { enabled: !isTagSearch } }
  );

  const tagsQuery = useFindPetsByTags(
    { tags: searchTags },
    { query: { enabled: isTagSearch } }
  );

  const activeQuery = isTagSearch ? tagsQuery : statusQuery;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;

  const allPets = useMemo(() => {
    if (isTagSearch) {
      return extractPetsFromTagsResponse(
        tagsQuery.data as findPetsByTagsResponse | undefined
      );
    }
    return extractPetsFromStatusResponse(
      statusQuery.data as findPetsByStatusResponse | undefined
    );
  }, [isTagSearch, tagsQuery.data, statusQuery.data]);

  const sortedPets = useMemo(() => sortPets(allPets, sort), [allPets, sort]);

  const totalItems = sortedPets.length;
  const paginatedPets = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedPets.slice(start, start + PAGE_SIZE);
  }, [sortedPets, page]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          if (val === null) {
            next.delete(key);
          } else {
            next.set(key, val);
          }
        }
        return next;
      });
    },
    [setSearchParams]
  );

  function handleStatusChange(newStatus: string) {
    updateParams({ status: newStatus, page: null, tags: null });
  }

  function handleSortChange(newSort: string) {
    updateParams({ sort: newSort, page: null });
  }

  function handlePageChange(newPage: number) {
    updateParams({ page: newPage === 1 ? null : String(newPage) });
  }

  function handleTagSearch(tags: string[]) {
    updateParams({
      tags: tags.length > 0 ? tags.join(",") : null,
      page: null,
    });
  }

  function handlePetClick(pet: Pet) {
    navigate(`/pets/${pet.id}?${searchParams.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pet Catalogue</h1>
        <Button onClick={() => navigate("/pets/new")}>
          <Plus className="size-4" />
          Add Pet
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <StatusFilterTabs value={status} onChange={handleStatusChange} />
        <div className="flex items-center gap-3">
          <TagSearch onSearch={handleTagSearch} />
          <SortControl value={sort} onChange={handleSortChange} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <QueryErrorState
          error={activeQuery.error}
          onRetry={() => activeQuery.refetch()}
        />
      ) : paginatedPets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No pets found
          </p>
          <p className="text-sm text-muted-foreground">
            Try changing the status filter or search tags.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onClick={() => handlePetClick(pet)}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
