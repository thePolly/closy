import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_NAME_KEY = "closy.userName";

export async function getUserName(): Promise<string | null> {
  return AsyncStorage.getItem(USER_NAME_KEY);
}

export async function saveUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(USER_NAME_KEY, name);
}

export async function clearUserName(): Promise<void> {
  await AsyncStorage.removeItem(USER_NAME_KEY);
}
