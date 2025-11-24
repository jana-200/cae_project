interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: User) => Promise<void>;
  loginUser: (credentials: Credentials, rememberMe: boolean) => Promise<void>;
  clearUser: () => void;
  checkUserAuthentication: () => Promise<void>;
  isTokenExpired: boolean;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  fetchUserDetails: () => Promise<UserDetails>;
  isVolunteer: boolean;
  fetchIsDeactivated: (email: string) => Promise<boolean>;
}

interface ProductLot {
  lotId: number;
  producerId?: number;
  productLabel: string;
  productType: string;
  imageUrl: string;
  producerEmail: string;
  unitPrice: number;
  remainingQuantity: number;
  availabilityDate: string;
  productUnit: string;
  productDescription: string;
  initialQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  productLotState: string;
}

interface Notification {
  id: number;
  notificationTitle: string;
  message: string;
  notificationDate: string;
  status: 'READ' | 'UNREAD';
}

interface NotificationContextType {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: (email: string) => Promise<void>;
}

interface Producer {
  userId: number;
  email: string;
  firstname: string;
  lastname: string;
  companyName: string;
  deactivated: boolean;
  address: Address;
  phoneNumber: string;
}

interface ProductLotContextType {
  allLots: ProductLot[];
  availableLots: ProductLot[];
  soldOutLots: ProductLot[];
  acceptedLots: ProductLot[];
  refusedLots: ProductLot[];
  allLotsForManager: ProductLot[];
  fetchAvailableLots: () => Promise<void>;
  fetchAcceptedLots: () => Promise<void>;
  fetchRefusedLots: () => Promise<void>;
  fetchSoldOutLots: () => Promise<void>;
  fetchAllLots: () => Promise<void>;
  fetchAllLotsForManager: () => Promise<void>;
  createLot: (newLot: NewLot) => Promise<void>;
  fetchExistingImage: (productId: number) => Promise<void>;
  fetchProductSuggestions: (prefix: string) => Promise<void>;
  productOptions: Product[];
  existingImages: string[];
  fetchPendingLots: () => Promise<void>;
  pendingLots: ProductLot[];
  fetchProductLotById: (lotId: number) => Promise<void>;
  lot: ProductLot | null;
  updateLot: (lotId: number, image: File | undefined) => Promise<void>;
  changeLotState: (lotId: number, newState: string) => Promise<void>;
  decreaseLotQuantity: (lotId: number, quantity: number) => Promise<void>;
  fetchSalesStatistics: (
    productLabel: string,
    month?: number,
    year?: number,
  ) => Promise<{
    totalReceived: number;
    totalSold: number;
    salesPerDay: Record<string, number>;
    receivedPerDay: Record<string, number>;
  }>;
}

interface ProductContextType {
  availableProducts: ProductLot[];
  recentProducts: ProductLot[];
  fetchAavailableProducts: () => Promise<void>;
  fetchRecentProducts: () => Promise<void>;
}
interface ProductTypeContextType {
  productTypes: ProductType[];
  fetchProductTypes: () => Promise<void>;
}

interface OpenSalesContextType {
  items: ReservedItem[];
  createOpenSale: () => Promise<boolean>;
  removeFromOpenSale: (lotId: number) => void;
  updateQuantity: (lotId: number, quantity: number) => void;
  addToOpenSale: (product: ProductLot, quantity: number) => void;
}

interface OpenSale {
  productLotId: number;
  quantity: number;
}

interface ProductLot {
  lotId: number;
  productLabel: string;
  productType: string;
  imageUrl: string;
  producerEmail: string;
  unitPrice: number;
  remainingQuantity: number;
  availabilityDate: string;
  productUnit: string;
  productDescription: string;
  initialQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  productLotState: string;
  producerName: string;
}

interface Address {
  street: string;
  number: string;
  poBox: string;
  postalCode: string;
  city: string;
  country: string;
}

interface User {
  firstname: string;
  lastname: string;
  title: string;
  phoneNumber: string;
  email: string;
  password: string;
  address: Address;
  registrationDate?: string;
  role?: 'CUSTOMER' | 'PRODUCER' | 'MANAGER';
  accountCreatorManager?: string;
  companyName?: string;
}

interface AuthenticatedUser {
  email: string;
  token: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface UserDetails {
  id: number;
  email: string;
  title: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  address: Address;
  role: string;
  companyName?: string;
  deactivated: boolean;
}

interface NewLot {
  productLabel: string;
  productDescription: string;
  unit: string;
  productType: string;
  producer: number;
  unitPrice: number;
  initialQuantity: number;
  availabilityDate: string;
  image: File | undefined;
}

interface Product {
  productId: number;
  label: string;
  type: string;
  description: string;
  unit: string;
}

interface ReservedItem {
  product: ProductLot;
  quantity: number;
}

interface ReservationContextType {
  items: ReservedItem[];
  addToReservation: (product: ProductLot, quantity: number) => void;
  clearReservation: () => void;
  submitReservation: (
    recoveryDate: string,
    user: AuthenticatedUser,
  ) => Promise<boolean>;
  updateQuantity: (lotId: number, quantity: number) => void;
  removeFromReservation: (lotId: number) => void;
  fetchAllReservations: () => Promise<ReservationInfo[]>;
  updateReservationState: (
    reservationId: number,
    newState: string,
  ) => Promise<void>;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

interface ProductType {
  typeId: number;
  label: string;
}

interface ReservationInfo {
  reservationId: number;
  reservationDate: string;
  recoveryDate: string;
  state: string;
  totalPrice: number;
  customerEmail: string;
  customerLastname: string;
  customerFirstname: string;
}

interface MyReservationsContextType {
  reservations: ReservationInfo[];
  fetchMyReservations: () => Promise<void>;
}

export type {
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  Producer,
  UserContextType,
  Credentials,
  UserDetails,
  NewLot,
  Product,
  ProductLot,
  ProductLotContextType,
  ProductContextType,
  ProductTypeContextType,
  ProductType,
  ReservedItem,
  ReservationContextType,
  MyReservationsContextType,
  ReservationInfo,
  Notification,
  NotificationContextType,
  OpenSalesContextType,
  OpenSale,
};
