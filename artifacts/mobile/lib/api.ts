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

let _seq = 100;
function uid() {
  return `local-${++_seq}`;
}

function delay(ms = 180) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

const NOW = new Date().toISOString();

const SEED: ApiTrip[] = [
  {
    id: "trip-paris",
    userId: "demo",
    destination: "Paris",
    country: "France",
    emoji: "🗼",
    startDate: "2026-06-15",
    endDate: "2026-06-22",
    createdAt: NOW,
    categories: [
      {
        id: "cat-p1",
        tripId: "trip-paris",
        name: "Clothes",
        icon: "shirt",
        position: 0,
        items: [
          { id: "i-p1", categoryId: "cat-p1", label: "T-shirts (×5)", done: true, position: 0 },
          { id: "i-p2", categoryId: "cat-p1", label: "Jeans", done: true, position: 1 },
          { id: "i-p3", categoryId: "cat-p1", label: "Light jacket", done: false, position: 2 },
          { id: "i-p4", categoryId: "cat-p1", label: "Comfortable shoes", done: false, position: 3 },
        ],
      },
      {
        id: "cat-p2",
        tripId: "trip-paris",
        name: "Toiletries",
        icon: "droplet",
        position: 1,
        items: [
          { id: "i-p5", categoryId: "cat-p2", label: "Toothbrush & paste", done: true, position: 0 },
          { id: "i-p6", categoryId: "cat-p2", label: "Sunscreen SPF 50", done: false, position: 1 },
          { id: "i-p7", categoryId: "cat-p2", label: "Moisturiser", done: false, position: 2 },
        ],
      },
      {
        id: "cat-p3",
        tripId: "trip-paris",
        name: "Electronics",
        icon: "zap",
        position: 2,
        items: [
          { id: "i-p8", categoryId: "cat-p3", label: "Phone charger", done: true, position: 0 },
          { id: "i-p9", categoryId: "cat-p3", label: "Travel adapter (EU)", done: false, position: 1 },
          { id: "i-p10", categoryId: "cat-p3", label: "Earbuds", done: true, position: 2 },
        ],
      },
    ],
    tasks: [
      { id: "t-p1", tripId: "trip-paris", label: "Book Eiffel Tower tickets", done: true, createdAt: NOW },
      { id: "t-p2", tripId: "trip-paris", label: "Get travel insurance", done: false, createdAt: NOW },
      { id: "t-p3", tripId: "trip-paris", label: "Notify bank of travel dates", done: false, createdAt: NOW },
    ],
  },
  {
    id: "trip-tokyo",
    userId: "demo",
    destination: "Tokyo",
    country: "Japan",
    emoji: "🗾",
    startDate: "2026-09-01",
    endDate: "2026-09-14",
    createdAt: NOW,
    categories: [
      {
        id: "cat-t1",
        tripId: "trip-tokyo",
        name: "Essentials",
        icon: "star",
        position: 0,
        items: [
          { id: "i-t1", categoryId: "cat-t1", label: "Passport", done: false, position: 0 },
          { id: "i-t2", categoryId: "cat-t1", label: "IC Suica card", done: false, position: 1 },
          { id: "i-t3", categoryId: "cat-t1", label: "Yen cash", done: false, position: 2 },
        ],
      },
    ],
    tasks: [
      { id: "t-t1", tripId: "trip-tokyo", label: "Book JR Pass", done: false, createdAt: NOW },
      { id: "t-t2", tripId: "trip-tokyo", label: "Get pocket WiFi", done: false, createdAt: NOW },
    ],
  },
];

let _trips: ApiTrip[] = deepClone(SEED);

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

function getTrip(tripId: string): ApiTrip | undefined {
  return _trips.find((t) => t.id === tripId);
}

function tripResponse(tripId: string) {
  const trip = deepClone(getTrip(tripId))!;
  return { trip };
}

const DEMO_USER: StoredUser = {
  id: "demo",
  name: "Demo User",
  email: "demo@packeasy.local",
};

export const api = {
  async signup(_input: { name: string; email: string; password: string }): Promise<AuthResponse> {
    await delay();
    return {
      user: { id: uid(), name: _input.name, email: _input.email },
      token: "mock-token",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };
  },

  async login(_input: { email: string; password: string }): Promise<AuthResponse> {
    await delay();
    return {
      user: DEMO_USER,
      token: "mock-token",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };
  },

  async logout(): Promise<{ ok: true }> {
    await delay(50);
    return { ok: true };
  },

  async me(): Promise<{ user: StoredUser }> {
    await delay(50);
    return { user: DEMO_USER };
  },

  async listTrips(): Promise<{ trips: ApiTrip[] }> {
    await delay();
    return { trips: deepClone(_trips) };
  },

  async createTrip(input: {
    destination: string;
    country?: string | null;
    emoji?: string | null;
    smart?: boolean;
  }): Promise<{ trip: ApiTrip }> {
    await delay();
    const id = uid();
    const now = new Date().toISOString();
    const trip: ApiTrip = {
      id,
      userId: "demo",
      destination: input.destination,
      country: input.country ?? null,
      emoji: input.emoji ?? null,
      startDate: null,
      endDate: null,
      createdAt: now,
      categories: [],
      tasks: [],
    };
    if (input.smart) {
      let catSeq = 0;
      for (const def of DEFAULT_CATEGORIES) {
        const catId = `${id}-cat-${catSeq++}`;
        trip.categories.push({
          id: catId,
          tripId: id,
          name: def.name,
          icon: def.icon,
          position: catSeq - 1,
          items: def.items.map((label, pos) => ({
            id: `${catId}-i-${pos}`,
            categoryId: catId,
            label,
            done: false,
            position: pos,
          })),
        });
      }
    }
    _trips.push(trip);
    return tripResponse(id);
  },

  async seedTrip(tripId: string): Promise<{ trip: ApiTrip }> {
    await delay();
    const trip = getTrip(tripId);
    if (!trip) throw new Error("Trip not found");
    let catSeq = trip.categories.length;
    for (const def of DEFAULT_CATEGORIES) {
      if (trip.categories.some((c) => c.name === def.name)) continue;
      const catId = `${tripId}-cat-${catSeq++}`;
      trip.categories.push({
        id: catId,
        tripId,
        name: def.name,
        icon: def.icon,
        position: catSeq - 1,
        items: def.items.map((label, pos) => ({
          id: `${catId}-i-${pos}`,
          categoryId: catId,
          label,
          done: false,
          position: pos,
        })),
      });
    }
    return tripResponse(tripId);
  },

  async addCategory(tripId: string, input: { name: string; icon?: string }): Promise<{ trip: ApiTrip }> {
    await delay();
    const trip = getTrip(tripId);
    if (!trip) throw new Error("Trip not found");
    const catId = uid();
    trip.categories.push({
      id: catId,
      tripId,
      name: input.name,
      icon: input.icon ?? "folder",
      position: trip.categories.length,
      items: [],
    });
    return tripResponse(tripId);
  },

  async addItem(categoryId: string, input: { label: string }): Promise<{ trip: ApiTrip }> {
    await delay();
    for (const trip of _trips) {
      const cat = trip.categories.find((c) => c.id === categoryId);
      if (cat) {
        cat.items.push({
          id: uid(),
          categoryId,
          label: input.label,
          done: false,
          position: cat.items.length,
        });
        return tripResponse(trip.id);
      }
    }
    throw new Error("Category not found");
  },

  async updateItem(itemId: string, input: { done?: boolean; label?: string }): Promise<{ trip: ApiTrip }> {
    await delay(80);
    for (const trip of _trips) {
      for (const cat of trip.categories) {
        const item = cat.items.find((i) => i.id === itemId);
        if (item) {
          if (input.done !== undefined) item.done = input.done;
          if (input.label !== undefined) item.label = input.label;
          return tripResponse(trip.id);
        }
      }
    }
    throw new Error("Item not found");
  },

  async deleteItem(itemId: string): Promise<{ trip: ApiTrip }> {
    await delay();
    for (const trip of _trips) {
      for (const cat of trip.categories) {
        const idx = cat.items.findIndex((i) => i.id === itemId);
        if (idx !== -1) {
          cat.items.splice(idx, 1);
          return tripResponse(trip.id);
        }
      }
    }
    throw new Error("Item not found");
  },

  async addTask(tripId: string, input: { label: string }): Promise<{ trip: ApiTrip }> {
    await delay();
    const trip = getTrip(tripId);
    if (!trip) throw new Error("Trip not found");
    trip.tasks.push({
      id: uid(),
      tripId,
      label: input.label,
      done: false,
      createdAt: new Date().toISOString(),
    });
    return tripResponse(tripId);
  },

  async updateTask(taskId: string, input: { done?: boolean; label?: string }): Promise<{ trip: ApiTrip }> {
    await delay(80);
    for (const trip of _trips) {
      const task = trip.tasks.find((t) => t.id === taskId);
      if (task) {
        if (input.done !== undefined) task.done = input.done;
        if (input.label !== undefined) task.label = input.label;
        return tripResponse(trip.id);
      }
    }
    throw new Error("Task not found");
  },
};
