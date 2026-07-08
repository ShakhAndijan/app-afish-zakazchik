import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACTOR_TYPE_KEY = 'actor_type';

export const saveToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const saveRefreshToken = (token) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
export const saveActorType = (actorType) => SecureStore.setItemAsync(ACTOR_TYPE_KEY, actorType);
export const getActorType = () => SecureStore.getItemAsync(ACTOR_TYPE_KEY);

export const clearTokens = () =>
  Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(ACTOR_TYPE_KEY),
  ]);
