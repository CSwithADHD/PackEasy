import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "packeasy.token";
const USER_KEY = "packeasy.user";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
};

export const authStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async setToken(token: string | null) {
    if (token == null) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  },
  async getUser(): Promise<StoredUser | null> {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
      return null;
    }
  },
  async setUser(user: StoredUser | null) {
    if (user == null) {
      await AsyncStorage.removeItem(USER_KEY);
    } else {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  async clear() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
