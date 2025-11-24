import {
  createContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { ProductLot, ProductContextType } from '../types';

const defaultContext: ProductContextType = {
  availableProducts: [],
  recentProducts: [],
  fetchAavailableProducts: async () => {},
  fetchRecentProducts: async () => {},
};

const ProductContext = createContext<ProductContextType>(defaultContext);

const ProductContextProvider = ({ children }: { children: ReactNode }) => {
  const [availableProducts, setAvailableProducts] = useState<ProductLot[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductLot[]>([]);

  const fetchAavailableProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/product-lots/?state=FOR_SALE');
      const data = await res.json();
      setAvailableProducts(data);
    } catch (err) {
      console.error('Erreur chargement produits', err);
    }
  }, []);

  const fetchRecentProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/product-lots/recent');
      const data = await res.json();
      setRecentProducts(data);
    } catch (err) {
      console.error('Erreur chargement produits récents', err);
    }
  }, []);

  useEffect(() => {
    fetchAavailableProducts();
    fetchRecentProducts();
  }, [fetchAavailableProducts, fetchRecentProducts]);

  return (
    <ProductContext.Provider
      value={{
        availableProducts,
        recentProducts,
        fetchAavailableProducts,
        fetchRecentProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export { ProductContextProvider, ProductContext };
