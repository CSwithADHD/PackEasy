import { Asset } from "expo-asset";

export const PRELOAD_IMAGES = [
  require("../assets/images/bg.jpg"),
  require("../assets/images/logo.png"),
  require("../assets/images/character-1.png"),
  require("../assets/images/character-2.png"),
  require("../assets/images/character-3.png"),
];

export async function preloadAllImages(): Promise<void> {
  try {
    await Asset.loadAsync(PRELOAD_IMAGES);
  } catch {
  }
}
