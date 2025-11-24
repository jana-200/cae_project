import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useContext,
} from 'react';

import {
  MaybeAuthenticatedUser,
  UserContextType,
  User,
  AuthenticatedUser,
  Credentials,
  UserDetails,
} from '../types';

import {
  clearAuthenticatedUser,
  storeAuthenticatedUser,
  getAuthenticatedUser,
} from '../utils/session';
import { ReservationContext } from './ReservationContext';

const defaultUserContext: UserContextType = {
  authenticatedUser: undefined,
  registerUser: async () => {},
  loginUser: async () => {},
  clearUser: () => {},
  checkUserAuthentication: async () => {},
  isTokenExpired: false,
  changePassword: async () => {},
  fetchUserDetails: async () => {
    return {} as UserDetails;
  },
  isVolunteer: false,
  fetchIsDeactivated: async () => {
    return false;
  },
};

const UserContext = createContext<UserContextType>(defaultUserContext);

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<MaybeAuthenticatedUser>(undefined);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState<boolean>(false);
  const { clearReservation } = useContext(ReservationContext);

  const checkUserAuthentication = useCallback(async () => {
    try {
      const authenticatedUser = getAuthenticatedUser();
      if (!authenticatedUser) return undefined;

      const response = await fetch('/api/auths/me', {
        method: 'GET',
        headers: {
          Authorization: `${authenticatedUser.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token expired or user not found');
      }

      const data: AuthenticatedUser = await response.json();
      setAuthenticatedUser(data);
      storeAuthenticatedUser(data, rememberMe);
      setIsTokenExpired(false);
      setIsVolunteer(data.email === 'volunteer@terroircie.be');
    } catch (error) {
      console.error('Error:', error);
      clearAuthenticatedUser();
      setAuthenticatedUser(undefined);
      setIsTokenExpired(true);
    }
  }, [rememberMe]);

  useEffect(() => {
    checkUserAuthentication();
  }, [checkUserAuthentication]);

  const registerUser = async (newUser: User) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await fetch('/api/auths/register', options);

      if (!response.ok) {
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );
      }
    } catch (err) {
      console.error('registerUser::error: ', err);
      throw err;
    }
  };

  const loginUser = async (credentials: Credentials, rememberMe: boolean) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch('/api/auths/login', options);

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );

      const authenticatedUser: AuthenticatedUser = await response.json();

      setAuthenticatedUser(authenticatedUser);
      setIsVolunteer(authenticatedUser.email === 'volunteer@terroircie.be');
      setRememberMe(rememberMe);
      storeAuthenticatedUser(authenticatedUser, rememberMe);
    } catch (err) {
      console.error('loginUser::error: ', err);
      throw err;
    }
  };

  const clearUser = () => {
    clearAuthenticatedUser();
    clearReservation();
    setAuthenticatedUser(undefined);
  };

  const fetchUserDetails = async () => {
    if (!authenticatedUser) {
      throw new Error('User not authenticated.');
    }

    try {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `${authenticatedUser.token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch('/api/auths/profile', options);

      if (!response.ok) {
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );
      }

      const userDetails: UserDetails = await response.json();
      return userDetails;
    } catch (error) {
      console.error('fetchUserDetails::error:', error);
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (!authenticatedUser) {
      throw new Error('User not authenticated.');
    }

    try {
      const response = await fetch('/api/auths/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser.token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Error while changing the password.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  };

  const fetchIsDeactivated = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/auths/deactivated/${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        throw new Error('Error while fetching deactivation status.');
      }

      const isDeactivated: boolean = await response.json();
      return isDeactivated;
    } catch (error) {
      console.error('fetchIsDeactivated::error:', error);
      throw error;
    }
  };

  const myContext: UserContextType = {
    authenticatedUser,
    registerUser,
    loginUser,
    clearUser,
    checkUserAuthentication,
    isTokenExpired,
    changePassword,
    fetchUserDetails,
    isVolunteer,
    fetchIsDeactivated,
  };

  return (
    <UserContext.Provider value={myContext}>{children}</UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { UserContext, UserContextProvider, defaultUserContext };
