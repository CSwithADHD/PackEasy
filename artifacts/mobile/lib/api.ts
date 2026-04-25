import { customFetch } from "@workspace/api-client-react";

import type { StoredUser } from "./auth-storage";

export type ApiTrip = {
  id: string;
  userId: string;
  destination: string;
  country: string | null;
  emoji: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  categories: ApiCategory[];
  tasks: ApiTask[];
};

export type ApiCategory = {
  id: string;
  tripId: string;
  name: string;
  icon: string;
  position: number;
  items: ApiItem[];
};

export type ApiItem = {
  id: string;
  categoryId: string;
  label: string;
  done: boolean;
  position: number;
};

export type ApiTask = {
  id: string;
  tripId: string;
  label: string;
  done: boolean;
  createdAt: string;
};

export type AuthResponse = {
  user: StoredUser;
  token: string;
  expiresAt: string;
};

function postJson<T>(path: string, body: unknown) {
  return customFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    responseType: "json",
  });
}

function patchJson<T>(path: string, body: unknown) {
  return customFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    responseType: "json",
  });
}

function del<T>(path: string) {
  return customFetch<T>(path, { method: "DELETE", responseType: "json" });
}

export const api = {
  signup(input: { name: string; email: string; password: string }) {
    return postJson<AuthResponse>("/api/auth/signup", input);
  },
  login(input: { email: string; password: string }) {
    return postJson<AuthResponse>("/api/auth/login", input);
  },
  logout() {
    return postJson<{ ok: true }>("/api/auth/logout", {});
  },
  me() {
    return customFetch<{ user: StoredUser }>("/api/auth/me", {
      responseType: "json",
    });
  },
  listTrips() {
    return customFetch<{ trips: ApiTrip[] }>("/api/trips", {
      responseType: "json",
    });
  },
  createTrip(input: {
    destination: string;
    country?: string | null;
    emoji?: string | null;
    smart?: boolean;
  }) {
    return postJson<{ trip: ApiTrip }>("/api/trips", input);
  },
  seedTrip(tripId: string) {
    return postJson<{ trip: ApiTrip }>(`/api/trips/${tripId}/seed`, {});
  },
  addCategory(tripId: string, input: { name: string; icon?: string }) {
    return postJson<{ trip: ApiTrip }>(`/api/trips/${tripId}/categories`, input);
  },
  addItem(categoryId: string, input: { label: string }) {
    return postJson<{ trip: ApiTrip }>(`/api/categories/${categoryId}/items`, input);
  },
  updateItem(itemId: string, input: { done?: boolean; label?: string }) {
    return patchJson<{ trip: ApiTrip }>(`/api/items/${itemId}`, input);
  },
  deleteItem(itemId: string) {
    return del<{ trip: ApiTrip }>(`/api/items/${itemId}`);
  },
  addTask(tripId: string, input: { label: string }) {
    return postJson<{ trip: ApiTrip }>(`/api/trips/${tripId}/tasks`, input);
  },
  updateTask(taskId: string, input: { done?: boolean; label?: string }) {
    return patchJson<{ trip: ApiTrip }>(`/api/tasks/${taskId}`, input);
  },
};
