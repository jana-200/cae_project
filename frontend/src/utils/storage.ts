import { ReservedItem } from '../types';

const storeReservationItems = (items: ReservedItem[]) => {
  localStorage.setItem('reservationItems', JSON.stringify(items));
};

const storeOpenSaleItems = (items: ReservedItem[]) => {
  localStorage.setItem('openSalesItems', JSON.stringify(items));
};

const getReservationItems = (): ReservedItem[] => {
  try {
    const saved = localStorage.getItem('reservationItems');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getOpenSaleItems = (): ReservedItem[] => {
  try {
    const saved = localStorage.getItem('openSalesItems');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const clearReservationItems = () => {
  localStorage.removeItem('reservationItems');
};

const clearOpenSaleItems = () => {
  localStorage.removeItem('openSalesItems');
};

export {
  storeReservationItems,
  getReservationItems,
  clearReservationItems,
  storeOpenSaleItems,
  getOpenSaleItems,
  clearOpenSaleItems,
};
