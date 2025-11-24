import { AuthenticatedUser, MaybeAuthenticatedUser } from '../types';

const storeAuthenticatedUser = (
  authenticatedUser: AuthenticatedUser,
  rememberMe: boolean,
) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  console.log('Remember me:', rememberMe);
  console.log(
    'Storage used:',
    storage === localStorage ? 'localStorage' : 'sessionStorage',
  );
  storage.setItem('authenticatedUser', JSON.stringify(authenticatedUser));
};

const getAuthenticatedUser = (): MaybeAuthenticatedUser => {
  const authenticatedUser =
    localStorage.getItem('authenticatedUser') ||
    sessionStorage.getItem('authenticatedUser');
  if (!authenticatedUser) return undefined;
  return JSON.parse(authenticatedUser);
};

const clearAuthenticatedUser = () => {
  localStorage.removeItem('authenticatedUser');
  sessionStorage.removeItem('authenticatedUser');
};

export { storeAuthenticatedUser, getAuthenticatedUser, clearAuthenticatedUser };
