import { categoriesTable, db, itemsTable } from "@workspace/db";

import { newId } from "./ids";

type SeedItem = { label: string };
type SeedCategory = { name: string; icon: string; items: SeedItem[] };

const DEFAULT_CATEGORIES: SeedCategory[] = [
  {
    name: "Essentials",
    icon: "star",
    items: [
      { label: "Travel Pillow" },
      { label: "Travel Adapter" },
      { label: "Sunglasses" },
      { label: "Travel-Sized Laundry Detergent" },
      { label: "Multi-Tool or Swiss Army Knife" },
    ],
  },
  {
    name: "Documents",
    icon: "file-text",
    items: [
      { label: "Passport/ID" },
      { label: "Travel Itinerary" },
      { label: "Boarding Passes" },
      { label: "Hotel Reservations" },
      { label: "Insurance Documents" },
    ],
  },
  {
    name: "Electronics",
    icon: "monitor",
    items: [
      { label: "Smartphone and Charger" },
      { label: "Laptop/Tablet and Charger" },
      { label: "Camera and Accessories" },
      { label: "Power Bank" },
      { label: "Headphones" },
    ],
  },
  {
    name: "Toiletries",
    icon: "droplet",
    items: [
      { label: "Toothbrush" },
      { label: "Shampoo and Conditioner" },
      { label: "Soap/Body Wash" },
      { label: "Razor and Shaving Cream" },
      { label: "Deodorant" },
    ],
  },
  {
    name: "Clothes",
    icon: "shopping-bag",
    items: [
      { label: "T-Shirt" },
      { label: "Pants/Shorts" },
      { label: "Underwear" },
      { label: "Socks" },
      { label: "Jacket/Outerwear" },
    ],
  },
];

export async function seedDefaultChecklist(tripId: string) {
  for (let c = 0; c < DEFAULT_CATEGORIES.length; c++) {
    const cat = DEFAULT_CATEGORIES[c];
    const categoryId = newId();
    await db.insert(categoriesTable).values({
      id: categoryId,
      tripId,
      name: cat.name,
      icon: cat.icon,
      position: c,
    });
    for (let i = 0; i < cat.items.length; i++) {
      await db.insert(itemsTable).values({
        id: newId(),
        categoryId,
        label: cat.items[i].label,
        position: i,
      });
    }
  }
}
