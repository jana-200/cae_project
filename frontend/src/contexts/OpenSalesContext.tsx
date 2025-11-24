import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserContext } from './UserContext';
import {
  OpenSalesContextType,
  ProductLot,
  ReservedItem,
  UserContextType,
} from '../types';
import {
  clearOpenSaleItems,
  getOpenSaleItems,
  storeOpenSaleItems,
} from '../utils/storage';

const defaultContext: OpenSalesContextType = {
  items: [],
  createOpenSale: async () => false,
  removeFromOpenSale: () => {},
  updateQuantity: () => {},
  addToOpenSale: () => {},
};

const OpenSalesContext = createContext<OpenSalesContextType>(defaultContext);

const OpenSalesProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ReservedItem[]>(getOpenSaleItems);
  const { authenticatedUser } = useContext<UserContextType>(UserContext);

  useEffect(() => {
    storeOpenSaleItems(items);
  }, [items]);

  const addToOpenSale = (product: ProductLot, quantity: number) => {
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

  const clearOpenSale = () => {
    setItems([]);
    clearOpenSaleItems();
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
  const removeFromOpenSale = (lotId: number) => {
    setItems((prev) => prev.filter((item) => item.product.lotId !== lotId));
  };

  const createOpenSale = async (): Promise<boolean> => {
    try {
      if (!authenticatedUser || !authenticatedUser.token) {
        throw new Error('Utilisateur non authentifié');
      }

      const openSaleData = {
        reservedProducts: items.map((item) => ({
          productLotId: item.product.lotId,
          quantity: item.quantity,
        })),
      };
      try {
        if (!authenticatedUser || !authenticatedUser.token) {
          throw new Error('Utilisateur non authentifié');
        }

        const response = await fetch('http://localhost:3000/open_sales/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${authenticatedUser.token}`,
          },
          body: JSON.stringify(openSaleData),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'enregistrement d’une vente libre");
        }
      } catch (error) {
        console.error('OpenSalesCreation Error', error);
      }
      clearOpenSale();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const contextValue: OpenSalesContextType = {
    items,
    createOpenSale,
    removeFromOpenSale,
    updateQuantity,
    addToOpenSale,
  };

  return (
    <OpenSalesContext.Provider value={contextValue}>
      {children}
    </OpenSalesContext.Provider>
  );
};

export { OpenSalesContext, OpenSalesProvider };
