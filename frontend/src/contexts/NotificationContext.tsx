import {
  createContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import { Notification, NotificationContextType } from '../types';
import { UserContext } from './UserContext';

const defaultContext: NotificationContextType = {
  notifications: [],
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
};

const NotificationContext =
  createContext<NotificationContextType>(defaultContext);

const NotificationContextProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { authenticatedUser } = useContext(UserContext);

  const fetchNotifications = useCallback(async () => {
    try {
      const userEmail = authenticatedUser?.email;

      if (!userEmail) {
        console.error("Email de l'utilisateur introuvable.");
        return;
      }

      const res = await fetch(`/api/notifications/?email=${userEmail}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token}`,
        },
      });

      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications', err);
    }
  }, [authenticatedUser]);

  const markAsRead = useCallback(
    async (id: number) => {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token}`,
        },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Failed to mark as read: ${response.status} ${response.statusText}. Response: ${text}`,
        );
      }
    },
    [authenticatedUser],
  );

  const markAllAsRead = useCallback(
    async (email: string) => {
      const response = await fetch(
        `/api/notifications/read-all?email=${email}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${authenticatedUser?.token}`,
          },
        },
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Failed to mark as read: ${response.status} ${response.statusText}. Response: ${text}`,
        );
      }
    },
    [authenticatedUser],
  );

  useEffect(() => {
    if (authenticatedUser?.email) {
      fetchNotifications();
    }
  }, [authenticatedUser, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export { NotificationContextProvider, NotificationContext, defaultContext };
