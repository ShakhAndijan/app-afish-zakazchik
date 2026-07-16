import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACTOR_TYPE_KEY = 'actor_type';

export const saveToken = (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const saveRefreshToken = (token) => AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
export const getRefreshToken = () => AsyncStorage.getItem(REFRESH_TOKEN_KEY);
export const saveActorType = (actorType) => AsyncStorage.setItem(ACTOR_TYPE_KEY, actorType);
export const getActorType = () => AsyncStorage.getItem(ACTOR_TYPE_KEY);

export const clearTokens = () =>
  AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, ACTOR_TYPE_KEY]);
