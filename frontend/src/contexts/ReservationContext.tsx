import {
  ProductLot,
  ReservedItem,
  ReservationContextType,
  AuthenticatedUser,
  ReservationInfo,
} from '../types';
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
} from 'react';
import {
  clearReservationItems,
  getReservationItems,
  storeReservationItems,
} from '../utils/storage';
import { UserContext } from '../contexts/UserContext';

const defaultReservationContext: ReservationContextType = {
  items: [],
  addToReservation: () => {},
  clearReservation: () => {},
  submitReservation: async () => false,
  updateQuantity: () => {},
  removeFromReservation: () => {},
  fetchAllReservations: async () => [],
  updateReservationState: async () => {},
};

const ReservationContext = createContext<ReservationContextType>(
  defaultReservationContext,
);

const ReservationContextProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ReservedItem[]>(getReservationItems);
  const { authenticatedUser } = useContext(UserContext);

  useEffect(() => {
    storeReservationItems(items);
  }, [items]);

  const addToReservation = (product: ProductLot, quantity: number) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.lotId === product.lotId,
      );
      if (existingIndex !== -1) {
        const updatedItems = [...prev];
        updatedItems[existingIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [...prev, { product, quantity }];
      }
    });
  };

  const clearReservation = () => {
    setItems([]);
    clearReservationItems();
  };

  const updateQuantity = (lotId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.lotId === lotId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  };
  const removeFromReservation = (lotId: number) => {
    setItems((prev) => prev.filter((item) => item.product.lotId !== lotId));
  };
  const submitReservation = async (
    recoveryDate: string,
    user: AuthenticatedUser,
  ): Promise<boolean> => {
    try {
      if (!user || !user.token) {
        throw new Error(
          'Utilisateur non authentifié. Veuillez vous connecter.',
        );
      }

      const reservationData = {
        recoveryDate,
        reservedProducts: items.map((item) => ({
          productLotId: item.product.lotId,
          quantity: item.quantity,
        })),
      };
      const response = await fetch('api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${user.token}`,
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Erreur lors de la réservation.');
      }
      clearReservation();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const fetchAllReservations = async (): Promise<ReservationInfo[]> => {
    try {
      if (!authenticatedUser || !authenticatedUser.token) {
        throw new Error('Utilisateur non authentifié');
      }

      const response = await fetch('/api/reservations/all', {
        method: 'GET',
        headers: {
          Authorization: `${authenticatedUser.token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(
          errorMessage || 'Erreur lors de la récupération des réservations.',
        );
      }

      const data: ReservationInfo[] = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur lors de la récupération des réservations :', err);
      throw err;
    }
  };

  const updateReservationState = async (
    reservationId: number,
    newState: string,
  ): Promise<void> => {
    try {
      if (!authenticatedUser || !authenticatedUser.token) {
        throw new Error('Utilisateur non authentifié');
      }

      const response = await fetch(
        `/api/reservations/${reservationId}/state?newState=${newState}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `${authenticatedUser.token}`,
          },
        },
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(
          errorMessage || 'Erreur lors de la mise à jour de la réservation.',
        );
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la réservation :', err);
      throw err;
    }
  };

  const contextValue: ReservationContextType = {
    items,
    addToReservation,
    clearReservation,
    submitReservation,
    updateQuantity,
    removeFromReservation,
    fetchAllReservations,
    updateReservationState,
  };

  return (
    <ReservationContext.Provider value={contextValue}>
      {children}
    </ReservationContext.Provider>
  );
};

export { ReservationContext, ReservationContextProvider };
