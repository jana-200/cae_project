import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
} from 'react';
import { NewLot, Product, ProductLot, ProductLotContextType } from '../types';
import { UserContext } from './UserContext';

const defaultProductLotContext: ProductLotContextType = {
  allLots: [],
  availableLots: [],
  soldOutLots: [],
  acceptedLots: [],
  refusedLots: [],
  allLotsForManager: [],
  fetchAvailableLots: async () => {},
  fetchAcceptedLots: async () => {},
  fetchRefusedLots: async () => {},
  fetchSoldOutLots: async () => {},
  fetchAllLots: async () => {},
  fetchAllLotsForManager: async () => {},
  createLot: async () => {},
  fetchExistingImage: async () => {},
  fetchProductSuggestions: async () => {},
  productOptions: [],
  existingImages: [],
  fetchPendingLots: async () => {},
  pendingLots: [],
  fetchProductLotById: async () => {},
  lot: null,
  updateLot: async () => {},
  changeLotState: async () => {},
  decreaseLotQuantity: async () => {},
  fetchSalesStatistics: async () => {
    return {
      totalReceived: 0,
      totalSold: 0,
      salesPerDay: {},
      receivedPerDay: {},
    };
  },
};

const ProductLotContext = createContext<ProductLotContextType>(
  defaultProductLotContext,
);

const ProductLotContextProvider = ({ children }: { children: ReactNode }) => {
  const [availableLots, setAvailableLots] = useState<ProductLot[]>([]);
  const [pendingLots, setPendingLots] = useState<ProductLot[]>([]);
  const [acceptedLots, setAcceptedLots] = useState<ProductLot[]>([]);
  const [refusedLots, setRefusedLots] = useState<ProductLot[]>([]);
  const [soldOutLots, setSoldOutLots] = useState<ProductLot[]>([]);
  const [allLots, setAllLots] = useState<ProductLot[]>([]);
  const [allLotsForManager, setAllLotsForManager] = useState<ProductLot[]>([]);
  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const { authenticatedUser } = useContext(UserContext);
  const [lot, setLot] = useState<ProductLot | null>(null);
  const email = authenticatedUser?.email;

  const fetchProductLotById = async (lotId: number) => {
    try {
      const res = await fetch(`/api/product-lots/${lotId}`);
      if (!res.ok) {
        throw new Error(`Erreur : ${res.status} ${res.statusText}`);
      }
      const data: ProductLot = await res.json();
      setLot(data);
    } catch (error) {
      console.error('fetchProductLotById::Error', error);
      throw error;
    }
  };

  const fetchAvailableLots = useCallback(async () => {
    if (!email) return;
    const url = `/api/product-lots/?state=FOR_SALE&email=${encodeURIComponent(email)}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur : ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAvailableLots(data);
    } catch (error) {
      console.error('fetchAvailableLots::Error', error);
    }
  }, [email]);

  const fetchAcceptedLots = useCallback(async () => {
    if (!email) return;
    const url = `/api/product-lots/?state=ACCEPTED&email=${encodeURIComponent(email)}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur : ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAcceptedLots(data);
    } catch (error) {
      console.error('fetchAcceptedLots::Error', error);
    }
  }, [email]);

  const fetchRefusedLots = useCallback(async () => {
    if (!email) return;
    const url = `/api/product-lots/?state=REJECTED&email=${encodeURIComponent(email)}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur : ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setRefusedLots(data);
    } catch (error) {
      console.error('fetchAcceptedLots::Error', error);
    }
  }, [email]);

  const fetchPendingLots = useCallback(async () => {
    if (!email) return;
    const url = `/api/product-lots/?state=PENDING&email=${encodeURIComponent(email)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur : ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPendingLots(data);
    } catch (error) {
      console.error('fetchPendingLots::Error', error);
    }
  }, [authenticatedUser?.token, email]);

  const fetchSoldOutLots = useCallback(async () => {
    if (!email) return;
    const url = `/api/product-lots/?state=SOLD_OUT&email=${encodeURIComponent(email)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur : ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSoldOutLots(data);
    } catch (error) {
      console.error('fetchSoldOutLots::Error', error);
    }
  }, [authenticatedUser?.token, email]);

  const fetchAllLots = useCallback(async () => {
    const url = `/api/product-lots/?state=FOR_SALE`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur : ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAllLots(data);
    } catch (error) {
      console.error('fetchAllLots::Error', error);
    }
  }, []);

  const fetchAllLotsForManager = useCallback(async () => {
    const url = `/api/product-lots/`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur : ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAllLotsForManager(data);
    } catch (error) {
      console.error('fetchAllLotsForManager::Error', error);
    }
  }, []);

  const createLot = async (newLot: NewLot) => {
    try {
      if (!newLot.producer) {
        throw new Error("Le champ 'producer' est requis pour créer un lot.");
      }
      const formData = new FormData();

      const lotToBeAdded = JSON.parse(JSON.stringify(newLot));
      delete lotToBeAdded.image;

      if (newLot.image) {
        formData.append('image', newLot.image);
      }

      formData.append(
        'NewProductLot',
        new Blob([JSON.stringify(lotToBeAdded)], { type: 'application/json' }),
      );

      const options = {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `${authenticatedUser?.token || ''}`,
        },
      };

      const response = await fetch('/api/product-lots/', options);

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          `fetch failed: ${response.status} ${response.statusText}`,
        );
        console.error(`Response body: ${responseText}`);
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );
      }
    } catch (err) {
      console.error('createLot::error: ', err);
      throw err;
    }
  };

  const updateLot = async (lotId: number, image: File | undefined) => {
    try {
      if (!image) {
        throw new Error('Image is required');
      }

      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(`/api/product-lots/${lotId}/image`, {
        method: 'PUT',
        body: formData,
        headers: {
          Authorization: `${authenticatedUser?.token || ''}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Failed to update lot image: ${response.status} ${response.statusText}. Response: ${text}`,
        );
      }

      return;
    } catch (err) {
      console.error('updateLot::error: ', err);
      throw err;
    }
  };

  const fetchExistingImage = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        headers: {
          Authorization: `${authenticatedUser?.token || ''}`,
        },
      });
      if (!res.ok) throw new Error();
      const data: string[] = await res.json();
      setExistingImages(data);
    } catch (err) {
      console.error(
        'Erreur lors de la récupération des images existantes :',
        err,
      );
    }
  };

  const fetchProductSuggestions = async (prefix: string) => {
    if (!prefix.trim()) return;
    try {
      const res = await fetch(`/api/products/?label=${prefix}`);
      if (!res.ok) return;
      const data: Product[] = await res.json();
      setProductOptions(data);
    } catch (error) {
      console.error('Error fetching product suggestions:', error);
    }
  };

  useEffect(() => {
    if (!email) return;
    fetchAvailableLots();
    fetchSoldOutLots();
    fetchAllLots();
  }, [email, fetchAvailableLots, fetchSoldOutLots, fetchAllLots]);

  const changeLotState = async (lotId: number, newState: string) => {
    try {
      const response = await fetch(
        `/api/product-lots/${lotId}/state?newState=${newState}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${authenticatedUser?.token || ''}`,
          },
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur ${response.status} : ${text}`);
      }
    } catch (err) {
      console.error('changeLotState::error', err);
    }
  };

  const fetchSalesStatistics = async (
    productLabel: string,
    month?: number,
    year?: number,
  ): Promise<{
    totalReceived: number;
    totalSold: number;
    salesPerDay: Record<string, number>;
    receivedPerDay: Record<string, number>;
  }> => {
    try {
      const url = `/api/product-lots/stats?productLabel=${encodeURIComponent(
        productLabel,
      )}${month ? `&month=${month}` : ''}${year ? `&year=${year}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur : ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (
        typeof data.totalReceived !== 'number' ||
        typeof data.totalSold !== 'number' ||
        typeof data.salesPerDay !== 'object' ||
        typeof data.receivedPerDay !== 'object'
      ) {
        throw new Error('Missing or invalid fields in backend response');
      }

      return data;
    } catch (error) {
      console.error('fetchSalesStatistics::Error', error);
      throw error;
    }
  };

  const decreaseLotQuantity = async (id: number, qty: number) => {
    try {
      const response = await fetch(
        `/api/product-lots/remove/${id}?qty=${qty}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${authenticatedUser?.token || ''}`,
          },
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur ${response.status} : ${text}`);
      }
    } catch (err) {
      console.error('decreaseLotQuantity::error', err);
    }
  };

  return (
    <ProductLotContext.Provider
      value={{
        allLots,
        availableLots,
        soldOutLots,
        acceptedLots,
        refusedLots,
        allLotsForManager,
        fetchAvailableLots,
        fetchAcceptedLots,
        fetchRefusedLots,
        fetchSoldOutLots,
        fetchAllLots,
        fetchAllLotsForManager,
        createLot,
        fetchExistingImage,
        fetchProductSuggestions,
        productOptions,
        existingImages,
        fetchPendingLots,
        pendingLots,
        fetchProductLotById,
        lot,
        updateLot,
        changeLotState,
        decreaseLotQuantity,
        fetchSalesStatistics,
      }}
    >
      {children}
    </ProductLotContext.Provider>
  );
};

export { ProductLotContextProvider, ProductLotContext };
