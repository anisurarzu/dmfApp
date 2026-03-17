import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@dmf/token';

export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
  if (!token) return;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

