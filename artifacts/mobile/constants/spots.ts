export type Spot = {
  name: string;
  description: string;
  icon: string;
};

export const CITY_SPOTS: Record<string, Spot[]> = {
  Riyadh: [
    { name: "Kingdom Centre Tower", description: "Iconic skyscraper with sky bridge views", icon: "🏙️" },
    { name: "Diriyah", description: "UNESCO mudbrick old city & At-Turaif district", icon: "🏯" },
    { name: "National Museum", description: "Saudi heritage & history across 8 galleries", icon: "🏛️" },
    { name: "Al-Masmak Fortress", description: "19th-century clay fort in the old city center", icon: "🏰" },
    { name: "Riyadh Zoo", description: "One of the largest zoos in the Middle East", icon: "🦁" },
  ],
  Dubai: [
    { name: "Burj Khalifa", description: "World's tallest building — 828m of sky", icon: "🏙️" },
    { name: "Dubai Mall", description: "World's largest mall with an indoor aquarium", icon: "🛍️" },
    { name: "Palm Jumeirah", description: "Palm-shaped artificial island with luxury resorts", icon: "🌴" },
    { name: "Dubai Frame", description: "Giant picture frame with panoramic city views", icon: "🖼️" },
    { name: "Gold Souk", description: "Dazzling traditional market in Deira", icon: "✨" },
  ],
  Istanbul: [
    { name: "Hagia Sophia", description: "Byzantine masterpiece turned mosque", icon: "🕌" },
    { name: "Grand Bazaar", description: "One of the world's oldest covered markets", icon: "🛒" },
    { name: "Topkapi Palace", description: "Opulent palace of the Ottoman sultans", icon: "🏯" },
    { name: "Bosphorus Cruise", description: "Sail between Europe and Asia at sunset", icon: "⛵" },
    { name: "Blue Mosque", description: "Six-minareted mosque with stunning blue tiles", icon: "🕋" },
  ],
  Tokyo: [
    { name: "Senso-ji Temple", description: "Tokyo's oldest temple in Asakusa", icon: "⛩️" },
    { name: "Shibuya Crossing", description: "World's busiest pedestrian scramble crossing", icon: "🚶" },
    { name: "teamLab Borderless", description: "Immersive digital art museum experience", icon: "🎨" },
    { name: "Tsukiji Outer Market", description: "Fresh sushi and street food paradise", icon: "🍣" },
    { name: "Shinjuku Gyoen", description: "Stunning imperial garden with cherry blossoms", icon: "🌸" },
  ],
  Paris: [
    { name: "Eiffel Tower", description: "Iron lattice tower iconic of France", icon: "🗼" },
    { name: "The Louvre", description: "World's largest art museum — home of the Mona Lisa", icon: "🖼️" },
    { name: "Montmartre", description: "Artistic hilltop village with Sacré-Cœur basilica", icon: "⛪" },
    { name: "Seine River Cruise", description: "Glide past Paris landmarks at golden hour", icon: "⛵" },
    { name: "Palace of Versailles", description: "Opulent royal palace with Hall of Mirrors", icon: "🏰" },
  ],
  London: [
    { name: "Tower of London", description: "Historic castle housing the Crown Jewels", icon: "🏰" },
    { name: "British Museum", description: "World history in 8 million objects", icon: "🏛️" },
    { name: "Buckingham Palace", description: "Official residence of the British monarch", icon: "👑" },
    { name: "London Eye", description: "Giant Ferris wheel with sweeping Thames views", icon: "🎡" },
    { name: "Borough Market", description: "London's oldest and most renowned food market", icon: "🥐" },
  ],
  "New York": [
    { name: "Central Park", description: "843-acre urban oasis in the heart of Manhattan", icon: "🌿" },
    { name: "Statue of Liberty", description: "Iconic copper statue on Liberty Island", icon: "🗽" },
    { name: "The Metropolitan Museum", description: "World-class art across 5,000 years of history", icon: "🖼️" },
    { name: "Times Square", description: "Neon-lit crossroads of the world", icon: "✨" },
    { name: "Brooklyn Bridge", description: "Historic suspension bridge with skyline views", icon: "🌉" },
  ],
  Bali: [
    { name: "Tanah Lot Temple", description: "Sea temple perched on a rocky outcrop at sunset", icon: "🌅" },
    { name: "Ubud Monkey Forest", description: "Sacred forest sanctuary with 700+ macaques", icon: "🐒" },
    { name: "Tegallalang Rice Terraces", description: "Stunning emerald-green terraced rice fields", icon: "🌾" },
    { name: "Seminyak Beach", description: "World-class beach with chic cafes and sunsets", icon: "🏖️" },
    { name: "Mount Batur", description: "Active volcano with breathtaking sunrise treks", icon: "🌋" },
  ],
  Rome: [
    { name: "Colosseum", description: "Mighty ancient amphitheatre of the gladiators", icon: "🏟️" },
    { name: "Vatican City & St. Peter's", description: "World's smallest country with Sistine Chapel", icon: "⛪" },
    { name: "Trevi Fountain", description: "Baroque masterpiece — toss a coin for good luck", icon: "⛲" },
    { name: "Roman Forum", description: "Ancient heart of the Roman Empire", icon: "🏛️" },
    { name: "Borghese Gallery", description: "Bernini sculptures and Caravaggio in a villa", icon: "🎨" },
  ],
  Barcelona: [
    { name: "Sagrada Família", description: "Gaudí's unfinished Gothic-Art Nouveau basilica", icon: "⛪" },
    { name: "Park Güell", description: "Mosaic-covered terraces with city panoramas", icon: "🌈" },
    { name: "La Boqueria Market", description: "Vibrant street market on Las Ramblas", icon: "🥑" },
    { name: "Gothic Quarter", description: "Medieval labyrinth of narrow cobblestone lanes", icon: "🏰" },
    { name: "Barceloneta Beach", description: "Sandy urban beach a short walk from the city", icon: "🏖️" },
  ],
};

export function getSpotsForCity(cityName: string): Spot[] {
  return CITY_SPOTS[cityName] ?? [];
}
