import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore/lite";

import { auth, db } from "./firebase";
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

const DEFAULT_CATEGORIES = [
  {
    name: "Clothes",
    icon: "shirt",
    items: ["T-shirts", "Underwear", "Socks", "Trousers / Shorts", "Shoes"],
  },
  {
    name: "Toiletries",
    icon: "droplet",
    items: ["Toothbrush & paste", "Deodorant", "Shampoo", "Sunscreen"],
  },
  {
    name: "Electronics",
    icon: "zap",
    items: ["Phone charger", "Power bank", "Travel adapter"],
  },
  {
    name: "Documents",
    icon: "file",
    items: ["Passport / ID", "Travel insurance", "Boarding passes"],
  },
];

async function loadFullTrip(tripId: string): Promise<ApiTrip | null> {
  const tripSnap = await getDoc(doc(db, "trips", tripId));
  if (!tripSnap.exists()) return null;
  const td = tripSnap.data();

  const catsSnap = await getDocs(
    query(collection(db, "categories"), where("tripId", "==", tripId), orderBy("position"))
  );

  const categories: ApiCategory[] = [];
  for (const catDoc of catsSnap.docs) {
    const catData = catDoc.data();
    const itemsSnap = await getDocs(
      query(collection(db, "items"), where("categoryId", "==", catDoc.id), orderBy("position"))
    );
    const items: ApiItem[] = itemsSnap.docs.map((d) => ({
      id: d.id,
      categoryId: catDoc.id,
      label: d.data().label,
      done: d.data().done ?? false,
      position: d.data().position ?? 0,
    }));
    categories.push({
      id: catDoc.id,
      tripId,
      name: catData.name,
      icon: catData.icon ?? "folder",
      position: catData.position ?? 0,
      items,
    });
  }

  const tasksSnap = await getDocs(
    query(collection(db, "tasks"), where("tripId", "==", tripId), orderBy("createdAt"))
  );
  const tasks: ApiTask[] = tasksSnap.docs.map((d) => ({
    id: d.id,
    tripId,
    label: d.data().label,
    done: d.data().done ?? false,
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }));

  return {
    id: tripId,
    userId: td.userId,
    destination: td.destination,
    country: td.country ?? null,
    emoji: td.emoji ?? null,
    startDate: td.startDate ?? null,
    endDate: td.endDate ?? null,
    createdAt: td.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    categories,
    tasks,
  };
}

export const api = {
  async signup(input: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
    await updateProfile(cred.user, { displayName: input.name });
    const token = await cred.user.getIdToken();
    return {
      user: { id: cred.user.uid, name: input.name, email: input.email },
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    };
  },

  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    const cred = await signInWithEmailAndPassword(auth, input.email, input.password);
    const token = await cred.user.getIdToken();
    const name = cred.user.displayName ?? input.email.split("@")[0];
    return {
      user: { id: cred.user.uid, name, email: input.email },
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    };
  },

  async logout(): Promise<{ ok: true }> {
    await signOut(auth);
    return { ok: true };
  },

  async me(): Promise<{ user: StoredUser }> {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    return {
      user: {
        id: user.uid,
        name: user.displayName ?? user.email ?? "User",
        email: user.email ?? "",
      },
    };
  },

  async listTrips(): Promise<{ trips: ApiTrip[] }> {
    const userId = auth.currentUser?.uid;
    if (!userId) return { trips: [] };

    const snap = await getDocs(
      query(collection(db, "trips"), where("userId", "==", userId), orderBy("createdAt"))
    );

    const trips: ApiTrip[] = [];
    for (const docSnap of snap.docs) {
      const trip = await loadFullTrip(docSnap.id);
      if (trip) trips.push(trip);
    }
    return { trips };
  },

  async createTrip(input: {
    destination: string;
    country?: string | null;
    emoji?: string | null;
    smart?: boolean;
  }): Promise<{ trip: ApiTrip }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Not authenticated");

    const tripRef = await addDoc(collection(db, "trips"), {
      userId,
      destination: input.destination,
      country: input.country ?? null,
      emoji: input.emoji ?? null,
      startDate: null,
      endDate: null,
      createdAt: serverTimestamp(),
    });

    if (input.smart) {
      let pos = 0;
      for (const def of DEFAULT_CATEGORIES) {
        const catRef = await addDoc(collection(db, "categories"), {
          tripId: tripRef.id,
          name: def.name,
          icon: def.icon,
          position: pos++,
        });
        let itemPos = 0;
        for (const label of def.items) {
          await addDoc(collection(db, "items"), {
            categoryId: catRef.id,
            tripId: tripRef.id,
            label,
            done: false,
            position: itemPos++,
          });
        }
      }
    }

    const trip = await loadFullTrip(tripRef.id);
    return { trip: trip! };
  },

  async seedTrip(tripId: string): Promise<{ trip: ApiTrip }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Not authenticated");

    const existingCats = await getDocs(
      query(collection(db, "categories"), where("tripId", "==", tripId))
    );
    const existingNames = new Set(existingCats.docs.map((d) => d.data().name));
    let pos = existingCats.size;

    for (const def of DEFAULT_CATEGORIES) {
      if (existingNames.has(def.name)) continue;
      const catRef = await addDoc(collection(db, "categories"), {
        tripId,
        name: def.name,
        icon: def.icon,
        position: pos++,
      });
      let itemPos = 0;
      for (const label of def.items) {
        await addDoc(collection(db, "items"), {
          categoryId: catRef.id,
          tripId,
          label,
          done: false,
          position: itemPos++,
        });
      }
    }

    const trip = await loadFullTrip(tripId);
    return { trip: trip! };
  },

  async addCategory(tripId: string, input: { name: string; icon?: string }): Promise<{ trip: ApiTrip }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Not authenticated");

    const existing = await getDocs(
      query(collection(db, "categories"), where("tripId", "==", tripId))
    );
    await addDoc(collection(db, "categories"), {
      tripId,
      name: input.name,
      icon: input.icon ?? "folder",
      position: existing.size,
    });

    const trip = await loadFullTrip(tripId);
    return { trip: trip! };
  },

  async addItem(categoryId: string, input: { label: string }): Promise<{ trip: ApiTrip }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Not authenticated");

    const catDoc = await getDoc(doc(db, "categories", categoryId));
    if (!catDoc.exists()) throw new Error("Category not found");
    const tripId = catDoc.data().tripId;

    const existing = await getDocs(
      query(collection(db, "items"), where("categoryId", "==", categoryId))
    );
    await addDoc(collection(db, "items"), {
      categoryId,
      tripId,
      label: input.label,
      done: false,
      position: existing.size,
    });

    const trip = await loadFullTrip(tripId);
    return { trip: trip! };
  },

  async updateItem(itemId: string, input: { done?: boolean; label?: string }): Promise<{ trip: ApiTrip }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Not authenticated");

    const itemDoc = await getDoc(doc(db, "items", itemId));
    if (!itemDoc.exists()) throw new Error("Item not found");
    const tripId = itemDoc.data().tripId;

    await updateDoc(doc(db, "items", itemId), { ...input });
    const trip = await loadFullTrip(tripId);
    return { trip: trip! };
  },

  async deleteItem(itemId: string): Promise<{ trip: ApiTrip }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Not authenticated");

    const itemDoc = await getDoc(doc(db, "items", itemId));
    if (!itemDoc.exists()) throw new Error("Item not found");
    const tripId = itemDoc.data().tripId;

    await deleteDoc(doc(db, "items", itemId));
    const trip = await loadFullTrip(tripId);
    return { trip: trip! };
  },

  async addTask(tripId: string, input: { label: string }): Promise<{ trip: ApiTrip }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Not authenticated");

    await addDoc(collection(db, "tasks"), {
      tripId,
      label: input.label,
      done: false,
      createdAt: serverTimestamp(),
    });

    const trip = await loadFullTrip(tripId);
    return { trip: trip! };
  },

  async updateTask(taskId: string, input: { done?: boolean; label?: string }): Promise<{ trip: ApiTrip }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Not authenticated");

    const taskDoc = await getDoc(doc(db, "tasks", taskId));
    if (!taskDoc.exists()) throw new Error("Task not found");
    const tripId = taskDoc.data().tripId;

    await updateDoc(doc(db, "tasks", taskId), { ...input });
    const trip = await loadFullTrip(tripId);
    return { trip: trip! };
  },
};
