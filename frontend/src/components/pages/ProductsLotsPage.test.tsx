import { describe, vi, expect, beforeEach, test } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductsLotsPage from './ProductsLotsPage';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ProductLot } from '../../types';

vi.mock('../AvailableLotCard', () => ({
  default: ({ lot }: { lot: ProductLot }) => (
    <div>AvailableLotCard: {lot.productLabel}</div>
  ),
}));
vi.mock('../SoldOutLotCard', () => ({
  default: ({ lot }: { lot: ProductLot }) => (
    <div>SoldOutLotCard: {lot.productLabel}</div>
  ),
}));
vi.mock('../PendingLotCard', () => ({
  default: ({ lot }: { lot: ProductLot }) => (
    <div>PendingLotCard: {lot.productLabel}</div>
  ),
}));

const lotA: ProductLot = {
  lotId: 1,
  productLabel: 'Lot A',
  productType: 'Fruit',
  imageUrl: '',
  producerEmail: '',
  unitPrice: 1,
  remainingQuantity: 10,
  availabilityDate: '',
  productUnit: 'kg',
  productDescription: 'desc',
  initialQuantity: 10,
  soldQuantity: 0,
  reservedQuantity: 0,
  productLotState: 'ACTIVE',
  producerName: '',
};

const lotB = { ...lotA, lotId: 2, productLabel: 'Lot B' };
const lotC = { ...lotA, lotId: 3, productLabel: 'Lot C' };
const lotD = { ...lotA, lotId: 4, productLabel: 'Lot D' };
const lotE = { ...lotA, lotId: 5, productLabel: 'Lot E' };

const theme = createTheme();

const renderPage = ({
  availableLots = [lotA, lotB, lotC, lotD, lotE],
  soldOutLots = [],
  pendingLots = [],
  acceptedLots = [],
  refusedLots = [],
}: {
  availableLots?: ProductLot[];
  soldOutLots?: ProductLot[];
  pendingLots?: ProductLot[];
  acceptedLots?: ProductLot[];
  refusedLots?: ProductLot[];
} = {}) => {
  const fetchAvailableLots = vi.fn();
  const fetchSoldOutLots = vi.fn();
  const fetchPendingLots = vi.fn();
  const fetchAcceptedLots = vi.fn();
  const fetchRefusedLots = vi.fn();

  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <ProductLotContext.Provider
          value={{
            availableLots,
            soldOutLots,
            pendingLots,
            acceptedLots,
            refusedLots,
            allLotsForManager: [],
            fetchAvailableLots,
            fetchSoldOutLots,
            fetchPendingLots,
            fetchAcceptedLots,
            fetchRefusedLots,
            fetchAllLots: vi.fn(),
            createLot: vi.fn(),
            fetchExistingImage: vi.fn(),
            fetchAllLotsForManager: vi.fn(),
            fetchProductSuggestions: vi.fn(),
            productOptions: [],
            existingImages: [],
            fetchProductLotById: vi.fn(),
            allLots: [],
            lot: null,
            updateLot: vi.fn(),
            changeLotState: vi.fn(),
            decreaseLotQuantity: vi.fn(),
            fetchSalesStatistics: vi.fn(),
          }}
        >
          <ProductsLotsPage />
        </ProductLotContext.Provider>
      </ThemeProvider>
    </MemoryRouter>,
  );
};

describe('ProductsLotsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders pending lots by default', async () => {
    renderPage({ pendingLots: [lotA, lotD] });
    await waitFor(() => {
      expect(screen.getByText(/PendingLotCard: Lot A/i)).toBeTruthy();
      expect(screen.getByText(/PendingLotCard: Lot D/i)).toBeTruthy();
    });
  });

  test('shows sold out lots when "Lots vendus" tab is clicked', async () => {
    renderPage({ availableLots: [], soldOutLots: [lotA] });

    fireEvent.click(screen.getByRole('tab', { name: /vendus/i }));
    await waitFor(() => {
      expect(screen.getByText(/SoldOutLotCard: Lot A/i)).toBeTruthy();
    });
  });

  test('shows pending lots when "en vente" tab is clicked', async () => {
    renderPage({ availableLots: [lotB], pendingLots: [] });

    fireEvent.click(screen.getByRole('tab', { name: /en vente/i }));
    await waitFor(() => {
      expect(screen.getByText(/AvailableLotCard: Lot B/i)).toBeTruthy();
    });
  });

  test('shows no lots message when list is empty', async () => {
    renderPage({ availableLots: [] });
    await waitFor(() => {
      expect(screen.getByText(/Aucun lot à afficher/i)).toBeTruthy();
    });
  });

  test('changes page when pagination is clicked', async () => {
    renderPage({ pendingLots: [lotA, lotB, lotC, lotD, lotE] });

    await waitFor(() => {
      expect(screen.getByText(/PendingLotCard: Lot A/)).toBeTruthy();
    });

    const page2Btn = screen.getByRole('button', { name: /go to page 2/i });

    fireEvent.click(page2Btn);

    await waitFor(() => {
      expect(screen.getByText(/PendingLotCard: Lot E/)).toBeTruthy();
    });
  });

  test('shows accepted lots when "acceptés" tab is selected', async () => {
    renderPage({ availableLots: [], pendingLots: [], acceptedLots: [lotC] });

    fireEvent.click(screen.getByRole('tab', { name: /acceptés/i }));

    await waitFor(() => {
      expect(screen.getByText(/PendingLotCard: Lot C/)).toBeTruthy();
    });
  });

  test('shows refused lots when "refusés" tab is selected', async () => {
    renderPage({ availableLots: [], pendingLots: [], refusedLots: [lotD] });

    fireEvent.click(screen.getByRole('tab', { name: /refusés/i }));

    await waitFor(() => {
      expect(screen.getByText(/PendingLotCard: Lot D/)).toBeTruthy();
    });
  });
});
