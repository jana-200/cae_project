import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useParams, useNavigate } from 'react-router-dom';
import { describe, test, vi, beforeEach, expect } from 'vitest';
import EditLotImagePage from '../../components/pages/EditLotImagePage';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { ProductLotContextType } from '../../types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});
global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake');
describe('EditLotImagePage', () => {
  const fetchProductLotById = vi.fn();
  const fetchProductSuggestions = vi.fn();
  const fetchExistingImage = vi.fn();
  const updateLot = vi.fn();
  const navigate = vi.fn();

  const mockContext: ProductLotContextType = {
    allLots: [],
    availableLots: [],
    soldOutLots: [],
    acceptedLots: [],
    refusedLots: [],
    fetchAcceptedLots: vi.fn(),
    fetchRefusedLots: vi.fn(),
    allLotsForManager: [],
    pendingLots: [],
    existingImages: ['https://example.com/image1.jpg'],
    productOptions: [
      {
        label: 'Tomates',
        productId: 5,
        type: 'Fruit',
        description: '',
        unit: 'kg',
      },
    ],
    lot: {
      lotId: 1,
      productLabel: 'Tomates',
      productType: 'Fruit',
      imageUrl: '',
      producerEmail: 'test@test.com',
      unitPrice: 1.5,
      remainingQuantity: 10,
      availabilityDate: '2025-04-01',
      productUnit: 'kg',
      productDescription: 'Des tomates bio',
      initialQuantity: 10,
      soldQuantity: 0,
      reservedQuantity: 0,
      productLotState: 'PENDING',
      producerName: 'Ferme Test',
    },
    fetchAvailableLots: vi.fn(),
    fetchSoldOutLots: vi.fn(),
    fetchAllLots: vi.fn(),
    fetchAllLotsForManager: vi.fn(),
    fetchPendingLots: vi.fn(),
    createLot: vi.fn(),
    fetchExistingImage,
    fetchProductSuggestions,
    fetchProductLotById,
    updateLot,
    changeLotState: vi.fn(),
    decreaseLotQuantity: vi.fn(),
    fetchSalesStatistics: vi.fn(),
  };

  vi.mocked(useParams).mockReturnValue({ lotId: '42' });
  vi.mocked(useNavigate).mockReturnValue(navigate);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders form with inputs and buttons', () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContext}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/Importer une image/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Valider/i })).toBeTruthy();
    expect(
      screen.getByRole('button', {
        name: /Choisir une image existante/i,
      }),
    ).toBeTruthy();
  });

  test('calls fetchProductLotById on mount', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContext}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(fetchProductLotById).toHaveBeenCalledWith(42);
    });
  });

  test('calls fetchProductSuggestions with label', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContext}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(fetchProductSuggestions).toHaveBeenCalledWith('Tomates');
    });
  });

  test('can upload a file and submit successfully', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContext}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(
      /Importer une image/i,
    ) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
    });
    fireEvent.change(input);

    fireEvent.click(screen.getByRole('button', { name: /Valider/i }));

    await waitFor(() => {
      expect(updateLot).toHaveBeenCalledWith(42, file);
    });
  });

  test('fetches existing image when button clicked', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContext}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Choisir une image existante/i,
      }),
    );

    await waitFor(() => {
      expect(fetchExistingImage).toHaveBeenCalledWith(5);
    });
  });

  test('shows error if no image selected on submit', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContext}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Valider/i }));

    expect(
      await screen.findByText(/Veuillez sélectionner ou importer une image/i),
    ).toBeTruthy();
  });

  test('displays error if lot is not found on fetch', async () => {
    fetchProductLotById.mockRejectedValueOnce(new Error('not found'));
    const context = { ...mockContext, lot: null };

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={context}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Ce lot est introuvable ou n'existe pas/i),
      ).toBeTruthy();
    });
  });

  test('handleSelectExistingImage does nothing if productLabel is missing', async () => {
    const context = {
      ...mockContext,
      lot: {
        lotId: 1,
        productLabel: undefined as unknown as string,
        productType: '',
        imageUrl: '',
        producerEmail: '',
        unitPrice: 0,
        remainingQuantity: 0,
        availabilityDate: '',
        productUnit: '',
        productDescription: '',
        initialQuantity: 0,
        soldQuantity: 0,
        reservedQuantity: 0,
        productLotState: 'PENDING',
        producerName: '',
      },
    };

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={context}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Choisir une image existante/i }),
    );

    await waitFor(() => {
      expect(fetchExistingImage).not.toHaveBeenCalled();
    });
  });

  test('shows error if product not found in productOptions when selecting image', async () => {
    const context = {
      ...mockContext,
      productOptions: [],
    };

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={context}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Choisir une image existante/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Produit associé non trouvé dans la liste/i),
      ).toBeTruthy();
    });
  });

  test('shows error if fetchExistingImage throws', async () => {
    fetchExistingImage.mockRejectedValueOnce(new Error('failed'));

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContext}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Choisir une image existante/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /Erreur lors de la récupération des images existantes/i,
        ),
      ).toBeTruthy();
    });
  });

  test('selects an image from existingImages when clicked', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      blob: () => new Blob(['dummy'], { type: 'image/jpeg' }),
    });

    render(
      <MemoryRouter>
        <ProductLotContext.Provider
          value={{
            ...mockContext,
            existingImages: ['https://example.com/image1.jpg'],
          }}
        >
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Choisir une image existante/i }),
    );

    await waitFor(() => {
      const img = screen.getByAltText(/img-0/i);
      fireEvent.click(img);
    });

    expect(screen.getByText(/Image sélectionnée avec succès/i)).toBeTruthy();
  });

  test('shows error if updateLot throws on submit', async () => {
    updateLot.mockRejectedValueOnce(new Error('Update failed'));

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContext}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(
      /Importer une image/i,
    ) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
    });
    fireEvent.change(input);

    fireEvent.click(screen.getByRole('button', { name: /Valider/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Une erreur est survenue. Veuillez réessayer plus tard/i,
        ),
      ).toBeTruthy();
    });
  });

  test('shows error if image loading from existingImages fails', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('fetch failed'));

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContext}>
          <EditLotImagePage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Choisir une image existante/i }),
    );

    const img = await screen.findByAltText(/img-0/i);
    fireEvent.click(img);

    await waitFor(() => {
      expect(
        screen.getByText(/Erreur lors du chargement de cette image/i),
      ).toBeTruthy();
    });
  });
});
