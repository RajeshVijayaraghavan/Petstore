import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { setAuthStoreAccessor, setSessionExpiredHandler } from "@/lib/api-client";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const PetCataloguePage = lazy(() => import("@/pages/PetCataloguePage"));
const PetDetailPage = lazy(() => import("@/pages/PetDetailPage"));
const AddEditPetPage = lazy(() => import("@/pages/AddEditPetPage"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const AppShell = lazy(() => import("@/components/layout/AppShell"));

const FIVE_MINUTES = 5 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function ProtectedRoute() {
  const session = useAuthStore((state) => state.session);
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function AdminRoute() {
  const session = useAuthStore((state) => state.session);
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!session.isAdmin) {
    return <Navigate to="/pets" replace />;
  }

  return <Outlet />;
}

export default function App() {
  setAuthStoreAccessor(useAuthStore.getState);
  setSessionExpiredHandler(() => {
    useAuthStore.getState().logout();
    window.location.href = '/login?expired=true';
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route index element={<Navigate to="/pets" replace />} />
                  <Route path="pets" element={<PetCataloguePage />} />
                  <Route path="pets/new" element={<AddEditPetPage />} />
                  <Route path="pets/:petId" element={<PetDetailPage />} />
                  <Route
                    path="pets/:petId/edit"
                    element={<AddEditPetPage />}
                  />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="orders" element={<OrdersPage />} />

                  <Route element={<AdminRoute />}>
                    <Route path="users" element={<UsersPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Suspense>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
