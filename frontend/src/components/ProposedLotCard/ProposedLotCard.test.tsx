import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import ProposedLotCard from '.';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { MemoryRouter } from 'react-router-dom';
import { ProductLot } from '../../types';

const mockChangeLotState = vi.fn().mockResolvedValue(undefined);
const mockFetchAllLots = vi.fn().mockResolvedValue(undefined);

const mockLot: ProductLot = {
  lotId: 1,
  productLabel: 'Carottes',
  productType: 'Légume',
  unitPrice: 2.5,
  productUnit: 'kg',
  productDescription: 'Carottes bio bien croquantes',
  initialQuantity: 20,
  availabilityDate: new Date().toISOString(),
  productLotState: 'PENDING',
  imageUrl: '',
  producerName: 'Ferme Dupont',
  producerEmail: 'dupont@ferme.be',
  remainingQuantity: 0,
  soldQuantity: 0,
  reservedQuantity: 0,
};

const renderCard = (lot: Partial<ProductLot> = {}) => {
  return render(
    <MemoryRouter>
      <ProductLotContext.Provider
        value={{
          changeLotState: mockChangeLotState,
          allLots: [],
          acceptedLots: [],
          refusedLots: [],
          fetchAcceptedLots: vi.fn(),
          fetchRefusedLots: vi.fn(),
          availableLots: [],
          soldOutLots: [],
          allLotsForManager: [],
          pendingLots: [],
          existingImages: [],
          productOptions: [],
          lot: null,
          createLot: vi.fn(),
          updateLot: vi.fn(),
          fetchAvailableLots: vi.fn(),
          fetchSoldOutLots: vi.fn(),
          fetchAllLots: vi.fn(),
          fetchAllLotsForManager: vi.fn(),
          fetchProductLotById: vi.fn(),
          fetchExistingImage: vi.fn(),
          fetchProductSuggestions: vi.fn(),
          fetchPendingLots: vi.fn(),
          fetchSalesStatistics: vi.fn(),
          decreaseLotQuantity: vi.fn(),
        }}
      >
        <ProposedLotCard
          lot={{ ...mockLot, ...lot }}
          fetchAllLots={mockFetchAllLots}
        />
      </ProductLotContext.Provider>
    </MemoryRouter>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProposedLotCard', () => {
  test('displays lots information', () => {
    renderCard();
    expect(screen.getAllByText(/Carottes/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Carottes bio bien croquantes/)).toBeTruthy();
    expect(screen.getByText(/2.50 € \/ kg/)).toBeTruthy();
    expect(screen.getByText(/par : Ferme Dupont/)).toBeTruthy();
  });

  test('accept a batch with Accept button', async () => {
    renderCard();
    fireEvent.click(screen.getByText('Accepter'));

    await waitFor(() => {
      expect(mockChangeLotState).toHaveBeenCalledWith(1, 'ACCEPTED');
      expect(mockFetchAllLots).toHaveBeenCalled();
    });
  });

  test('opens and closes the refusal modal', async () => {
    renderCard();
    fireEvent.click(screen.getByText('Refuser'));
    expect(screen.getByText(/Motif du refus/)).toBeTruthy();

    fireEvent.click(screen.getByText('Annuler'));
    await waitFor(() => {
      expect(screen.queryByText(/Motif du refus/)).not.toBeTruthy();
    });
  });

  test('refuses a batch without a message', async () => {
    renderCard();
    fireEvent.click(screen.getByText('Refuser'));
    fireEvent.click(screen.getByText('Refuser sans message'));

    await waitFor(() => {
      expect(mockChangeLotState).toHaveBeenCalledWith(1, 'REJECTED');
      expect(mockFetchAllLots).toHaveBeenCalled();
    });
  });

  test('refuses a batch with a message', async () => {
    renderCard();
    fireEvent.click(screen.getAllByText('Refuser')[0]);

    fireEvent.change(
      screen.getByLabelText(/Ajouter un message au producteur/i),
      { target: { value: 'Pas assez de stock' } },
    );

    fireEvent.click(screen.getAllByText('Refuser')[1]);
    await waitFor(() => {
      expect(mockChangeLotState).toHaveBeenCalledWith(1, 'REJECTED');
      expect(mockFetchAllLots).toHaveBeenCalled();
    });
  });

  test('receives an ACCEPTED batch', async () => {
    renderCard({ productLotState: 'ACCEPTED' });
    fireEvent.click(screen.getByText('Réceptionner'));

    await waitFor(() => {
      expect(mockChangeLotState).toHaveBeenCalledWith(1, 'FOR_SALE');
      expect(mockFetchAllLots).toHaveBeenCalled();
    });
  });

  test('hides actions for lot SOLD_OUT', () => {
    renderCard({ productLotState: 'SOLD_OUT' });
    expect(screen.queryByText('Accepter')).not.toBeTruthy();
    expect(screen.queryByText('Refuser')).not.toBeTruthy();
    expect(screen.queryByText('Réceptionner')).not.toBeTruthy();
  });

  test('hides actions for lot FOR_SALE', () => {
    renderCard({ productLotState: 'FOR_SALE' });
    expect(screen.queryByText('Accepter')).not.toBeTruthy();
    expect(screen.queryByText('Refuser')).not.toBeTruthy();
    expect(screen.queryByText('Réceptionner')).not.toBeTruthy();
  });

  test('hides actions for lot REJECTED', () => {
    renderCard({ productLotState: 'REJECTED' });
    expect(screen.queryByText('Accepter')).not.toBeTruthy();
    expect(screen.queryByText('Refuser')).not.toBeTruthy();
    expect(screen.queryByText('Réceptionner')).not.toBeTruthy();
  });

  test('shows correct button text when refuseReason is not empty', async () => {
    renderCard();
    fireEvent.click(screen.getByText('Refuser'));

    fireEvent.change(
      screen.getByLabelText(/Ajouter un message au producteur/i),
      { target: { value: 'Produit non conforme' } },
    );

    await waitFor(() => {
      expect(screen.getAllByText(/^Refuser$/).length).toBeGreaterThan(0);
    });
  });

  test('closes dialog via onClose prop', async () => {
    renderCard();
    fireEvent.click(screen.getByText('Refuser'));

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText(/Motif du refus/)).not.toBeTruthy();
    });
  });
});
