import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../types/game';
import { logError, logInfo } from '../utils/logger';

const TOKEN_KEY = 'gotak_auth_token';
const USER_KEY = 'gotak_auth_user';

export interface StoredAuth {
  token: string;
  user: AuthUser;
}

export async function getStoredAuth(): Promise<StoredAuth | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userJson = await SecureStore.getItemAsync(USER_KEY);
    if (!token || !userJson) {
      return null;
    }
    const user = JSON.parse(userJson) as AuthUser;
    return { token, user };
  } catch (error) {
    logError('Failed to read stored auth', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function setStoredAuth(token: string, user: AuthUser): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    logInfo('Auth credentials stored');
  } catch (error) {
    logError('Failed to store auth', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function clearStoredAuth(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    logInfo('Auth credentials cleared');
  } catch (error) {
    logError('Failed to clear auth', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
