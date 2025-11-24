import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProposedLotsPage from './ProposedLotsPage';
import { MemoryRouter } from 'react-router-dom';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { ProductLot } from '../../types';

const mockFetchAllLotsForManager = vi.fn();

const mockLots: ProductLot[] = [
  {
    lotId: 1,
    productLabel: 'Tomates',
    productType: 'Légume',
    unitPrice: 3.5,
    productUnit: 'kg',
    productDescription: 'Rouges et juteuses',
    initialQuantity: 30,
    availabilityDate: new Date().toISOString(),
    productLotState: 'FOR_SALE',
    imageUrl: '',
    producerName: 'Ferme A',
    producerEmail: 'a@ferme.be',
    remainingQuantity: 10,
    soldQuantity: 10,
    reservedQuantity: 10,
  },
];

const renderPage = (lots: ProductLot[] = mockLots) => {
  render(
    <MemoryRouter>
      <ProductLotContext.Provider
        value={{
          allLotsForManager: lots,
          fetchAllLotsForManager: mockFetchAllLotsForManager,
          changeLotState: vi.fn(),
          createLot: vi.fn(),
          updateLot: vi.fn(),
          fetchAvailableLots: vi.fn(),
          fetchSoldOutLots: vi.fn(),
          fetchAllLots: vi.fn(),
          fetchProductLotById: vi.fn(),
          fetchExistingImage: vi.fn(),
          fetchProductSuggestions: vi.fn(),
          fetchPendingLots: vi.fn(),
          fetchSalesStatistics: vi.fn(),
          fetchAcceptedLots: vi.fn(),
          fetchRefusedLots: vi.fn(),
          decreaseLotQuantity: vi.fn(),
          allLots: [],
          acceptedLots: [],
          refusedLots: [],
          availableLots: [],
          soldOutLots: [],
          pendingLots: [],
          existingImages: [],
          productOptions: [],
          lot: null,
        }}
      >
        <ProposedLotsPage />
      </ProductLotContext.Provider>
    </MemoryRouter>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProposedLotsPage', () => {
  test('renders title and tabs', () => {
    renderPage();
    expect(screen.getByText(/Propositions de lots/i)).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  test('fetchAllLotsForManager is called on mount', () => {
    renderPage();
    expect(mockFetchAllLotsForManager).toHaveBeenCalled();
  });

  test('displays lot when it matches the selected tab', () => {
    renderPage();
    expect(screen.getByText(/Tomates/)).toBeTruthy();
  });

  test('filters lots by tab', () => {
    const lots = [
      { ...mockLots[0], productLotState: 'PENDING' },
      { ...mockLots[0], productLotState: 'ACCEPTED' },
      { ...mockLots[0], productLotState: 'REJECTED' },
      { ...mockLots[0], productLotState: 'FOR_SALE' },
      { ...mockLots[0], productLotState: 'SOLD_OUT' },
    ];
    renderPage(lots);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);
    expect(screen.getByText(/Tomates/)).toBeTruthy();

    fireEvent.click(tabs[2]);
    expect(screen.getByText(/Tomates/)).toBeTruthy();

    fireEvent.click(tabs[3]);
    expect(screen.getByText(/Tomates/)).toBeTruthy();

    fireEvent.click(tabs[4]);
    expect(screen.getByText(/Tomates/)).toBeTruthy();
  });

  test('displays "Aucun lot à afficher." when no lots match filter', () => {
    renderPage([]);
    expect(screen.getByText(/Aucun lot à afficher/)).toBeTruthy();
  });

  test('changes page when clicking pagination', () => {
    const manyLots = Array.from({ length: 10 }, (_, i) => ({
      ...mockLots[0],
      lotId: i + 1,
      productLotState: 'FOR_SALE',
    }));

    renderPage(manyLots);

    const page2Button = screen.getByRole('button', { name: /go to page 2/i });
    expect(page2Button).toBeTruthy();

    fireEvent.click(page2Button);
  });
});
