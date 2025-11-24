import { createContext, useState, ReactNode, useContext } from 'react';
import {
  MyReservationsContextType,
  ReservationInfo,
  UserContextType,
} from '../types';
import { UserContext } from './UserContext';

const defaultContext: MyReservationsContextType = {
  reservations: [],
  fetchMyReservations: async () => {},
};

const MyReservationsContext =
  createContext<MyReservationsContextType>(defaultContext);

const MyReservationsProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<ReservationInfo[]>([]);
  const { authenticatedUser } = useContext<UserContextType>(UserContext);

  const fetchMyReservations = async (): Promise<void> => {
    try {
      if (!authenticatedUser || !authenticatedUser.token) {
        throw new Error('Utilisateur non authentifié');
      }

      const response = await fetch('/api/reservations', {
        headers: {
          Authorization: `${authenticatedUser.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des réservations');
      }

      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('MyReservationsContext::fetchMyReservations::error', error);
    }
  };

  const contextValue: MyReservationsContextType = {
    reservations,
    fetchMyReservations,
  };

  return (
    <MyReservationsContext.Provider value={contextValue}>
      {children}
    </MyReservationsContext.Provider>
  );
};

export { MyReservationsContext, MyReservationsProvider };
