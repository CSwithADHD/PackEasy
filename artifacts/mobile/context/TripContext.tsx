import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { api, type ApiTrip } from "@/lib/api";

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type ChecklistCategory = {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
};

export type Trip = {
  id: string;
  destination: string;
  country?: string;
  emoji?: string;
  startDate?: string;
  categories: ChecklistCategory[];
  tasks: { id: string; label: string; done: boolean }[];
};

function toTrip(t: ApiTrip): Trip {
  return {
    id: t.id,
    destination: t.destination,
    country: t.country ?? undefined,
    emoji: t.emoji ?? undefined,
    startDate: t.startDate ?? undefined,
    categories: t.categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      items: c.items.map((i) => ({ id: i.id, label: i.label, done: i.done })),
    })),
    tasks: t.tasks.map((k) => ({ id: k.id, label: k.label, done: k.done })),
  };
}

type TripsCache = { trips: ApiTrip[] };

type Ctx = {
  trips: Trip[];
  currentTripId: string | null;
  currentTrip: Trip | null;
  loading: boolean;
  createTrip: (input: {
    destination: string;
    country?: string;
    emoji?: string;
    smart?: boolean;
  }) => Promise<string>;
  seedCurrentTrip: () => Promise<void>;
  setCurrentTrip: (id: string | null) => void;
  toggleItem: (tripId: string, categoryId: string, itemId: string) => void;
  addItem: (tripId: string, categoryId: string, label: string) => void;
  addCategory: (tripId: string, name: string) => void;
  addTask: (tripId: string, label: string) => void;
  toggleTask: (tripId: string, taskId: string) => void;
};

const TripContext = createContext<Ctx | null>(null);
const TRIPS_KEY = ["trips"] as const;

export function TripProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  const tripsQuery = useQuery<TripsCache>({
    queryKey: TRIPS_KEY,
    queryFn: () => api.listTrips(),
    enabled: !!token,
    staleTime: 1000 * 30,
  });

  const apiTrips = tripsQuery.data?.trips ?? [];
  const trips = useMemo(() => apiTrips.map(toTrip), [apiTrips]);

  const replaceTrip = useCallback(
    (updated: ApiTrip) => {
      queryClient.setQueryData<TripsCache>(TRIPS_KEY, (old) => {
        const list = old?.trips ?? [];
        const idx = list.findIndex((t) => t.id === updated.id);
        if (idx === -1) return { trips: [...list, updated] };
        const next = list.slice();
        next[idx] = updated;
        return { trips: next };
      });
    },
    [queryClient],
  );

  const findItem = useCallback(
    (tripId: string, categoryId: string, itemId: string) => {
      const t = apiTrips.find((x) => x.id === tripId);
      const c = t?.categories.find((x) => x.id === categoryId);
      return c?.items.find((x) => x.id === itemId) ?? null;
    },
    [apiTrips],
  );

  const findTask = useCallback(
    (tripId: string, taskId: string) => {
      const t = apiTrips.find((x) => x.id === tripId);
      return t?.tasks.find((k) => k.id === taskId) ?? null;
    },
    [apiTrips],
  );

  const createMut = useMutation({
    mutationFn: api.createTrip,
    onSuccess: ({ trip }) => {
      replaceTrip(trip);
      setCurrentTripId(trip.id);
    },
  });

  const seedMut = useMutation({
    mutationFn: api.seedTrip,
    onSuccess: ({ trip }) => replaceTrip(trip),
  });

  const addCategoryMut = useMutation({
    mutationFn: ({ tripId, name }: { tripId: string; name: string }) =>
      api.addCategory(tripId, { name }),
    onSuccess: ({ trip }) => replaceTrip(trip),
  });

  const addItemMut = useMutation({
    mutationFn: ({ categoryId, label }: { categoryId: string; label: string }) =>
      api.addItem(categoryId, { label }),
    onSuccess: ({ trip }) => replaceTrip(trip),
  });

  const updateItemMut = useMutation({
    mutationFn: ({ itemId, done }: { itemId: string; done: boolean }) =>
      api.updateItem(itemId, { done }),
    onSuccess: ({ trip }) => replaceTrip(trip),
  });

  const addTaskMut = useMutation({
    mutationFn: ({ tripId, label }: { tripId: string; label: string }) =>
      api.addTask(tripId, { label }),
    onSuccess: ({ trip }) => replaceTrip(trip),
  });

  const updateTaskMut = useMutation({
    mutationFn: ({ taskId, done }: { taskId: string; done: boolean }) =>
      api.updateTask(taskId, { done }),
    onSuccess: ({ trip }) => replaceTrip(trip),
  });

  const createTrip = useCallback<Ctx["createTrip"]>(
    async (input) => {
      const res = await createMut.mutateAsync(input);
      return res.trip.id;
    },
    [createMut],
  );

  const seedCurrentTrip = useCallback<Ctx["seedCurrentTrip"]>(async () => {
    if (!currentTripId) return;
    await seedMut.mutateAsync(currentTripId);
  }, [currentTripId, seedMut]);

  const addCategory = useCallback<Ctx["addCategory"]>(
    (tripId, name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      addCategoryMut.mutate({ tripId, name: trimmed });
    },
    [addCategoryMut],
  );

  const addItem = useCallback<Ctx["addItem"]>(
    (_tripId, categoryId, label) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      addItemMut.mutate({ categoryId, label: trimmed });
    },
    [addItemMut],
  );

  const toggleItem = useCallback<Ctx["toggleItem"]>(
    (tripId, categoryId, itemId) => {
      const item = findItem(tripId, categoryId, itemId);
      if (!item) return;
      updateItemMut.mutate({ itemId, done: !item.done });
    },
    [findItem, updateItemMut],
  );

  const addTask = useCallback<Ctx["addTask"]>(
    (tripId, label) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      addTaskMut.mutate({ tripId, label: trimmed });
    },
    [addTaskMut],
  );

  const toggleTask = useCallback<Ctx["toggleTask"]>(
    (tripId, taskId) => {
      const task = findTask(tripId, taskId);
      if (!task) return;
      updateTaskMut.mutate({ taskId, done: !task.done });
    },
    [findTask, updateTaskMut],
  );

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId) ?? null,
    [trips, currentTripId],
  );

  const value = useMemo<Ctx>(
    () => ({
      trips,
      currentTripId,
      currentTrip,
      loading: tripsQuery.isLoading,
      createTrip,
      seedCurrentTrip,
      setCurrentTrip: setCurrentTripId,
      toggleItem,
      addItem,
      addCategory,
      addTask,
      toggleTask,
    }),
    [
      trips,
      currentTripId,
      currentTrip,
      tripsQuery.isLoading,
      createTrip,
      seedCurrentTrip,
      toggleItem,
      addItem,
      addCategory,
      addTask,
      toggleTask,
    ],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrips must be used inside TripProvider");
  return ctx;
}
