import { createContext, useState, useEffect, ReactNode } from 'react';
import { ProductType, ProductTypeContextType } from '../types';

const defaultProductTypeContext: ProductTypeContextType = {
  productTypes: [],
  fetchProductTypes: async () => {},
};
const ProductTypeContext = createContext(defaultProductTypeContext);

const ProductTypeContextProvider = ({ children }: { children: ReactNode }) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  const fetchProductTypes = async () => {
    try {
      const resTypes = await fetch('/api/product-types/');
      const dataTypes = await resTypes.json();
      if (Array.isArray(dataTypes)) {
        setProductTypes(dataTypes);
      } else {
        console.warn('Types mal formatés :', dataTypes);
        setProductTypes([]);
      }
    } catch (err) {
      console.error('Erreur chargement types de produits', err);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  return (
    <ProductTypeContext.Provider value={{ productTypes, fetchProductTypes }}>
      {children}
    </ProductTypeContext.Provider>
  );
};

export { ProductTypeContextProvider, ProductTypeContext };
