import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, vi, beforeEach, expect } from 'vitest';
import LotCreationPage from '../../components/pages/LotCreationPage';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { ProductTypeContext } from '../../contexts/ProductTypeContext';
import { UserContext } from '../../contexts/UserContext';

const mockCreateLot = vi.fn();
const mockFetchExistingImage = vi.fn();
const mockFetchProductSuggestions = vi.fn();
const mockFetchUserDetails = vi.fn().mockResolvedValue({ id: 42 });

const mockContextValue = {
  allLots: [],
  availableLots: [],
  soldOutLots: [],
  acceptedLots: [],
  refusedLots: [],
  fetchAcceptedLots: vi.fn(),
  fetchRefusedLots: vi.fn(),
  allLotsForManager: [],
  pendingLots: [],
  productOptions: [],
  existingImages: [],
  lot: null,
  createLot: mockCreateLot,
  fetchExistingImage: mockFetchExistingImage,
  fetchProductSuggestions: mockFetchProductSuggestions,
  fetchAllLotsForManager: vi.fn(),
  fetchAvailableLots: vi.fn(),
  fetchSoldOutLots: vi.fn(),
  fetchAllLots: vi.fn(),
  fetchPendingLots: vi.fn(),
  fetchProductLotById: vi.fn(),
  updateLot: vi.fn(),
  changeLotState: vi.fn(),
  decreaseLotQuantity: vi.fn(),
  fetchSalesStatistics: vi.fn(),
};

const mockProductTypeContext = {
  productTypes: [{ typeId: 1, label: 'Légume' }],
  fetchProductTypes: vi.fn(),
};

const mockUserContext = {
  authenticatedUser: { email: 'test@example.com', token: 'fake-token' },
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  checkUserAuthentication: vi.fn(),
  isTokenExpired: false,
  changePassword: vi.fn(),
  fetchUserDetails: mockFetchUserDetails,
  isVolunteer: false,
  fetchIsDeactivated: vi.fn(),
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <UserContext.Provider value={mockUserContext}>
        <ProductLotContext.Provider value={mockContextValue}>
          <ProductTypeContext.Provider value={mockProductTypeContext}>
            <LotCreationPage />
          </ProductTypeContext.Provider>
        </ProductLotContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  );

describe('LotCreationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all required fields', () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <ProductTypeContext.Provider value={mockProductTypeContext}>
            <UserContext.Provider value={mockUserContext}>
              <LotCreationPage />
            </UserContext.Provider>
          </ProductTypeContext.Provider>
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/Nom du produit/i)).toBeTruthy();
    expect(screen.getByLabelText(/Description du produit/i)).toBeTruthy();
    expect(screen.getByLabelText(/Unité/i)).toBeTruthy();
    expect(screen.getByLabelText(/Date de disponibilité/i)).toBeTruthy();
    expect(screen.getByLabelText(/Quantité initiale/i)).toBeTruthy();
    expect(screen.getByLabelText(/Prix unitaire/i)).toBeTruthy();
  });

  test('displays validation errors if form is invalid', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <ProductTypeContext.Provider value={mockProductTypeContext}>
            <UserContext.Provider value={mockUserContext}>
              <LotCreationPage />
            </UserContext.Provider>
          </ProductTypeContext.Provider>
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Date de disponibilité/i), {
      target: { value: '2022-01-01' },
    });

    fireEvent.change(screen.getByLabelText(/Quantité initiale/i), {
      target: { value: '-5' },
    });

    fireEvent.change(screen.getByLabelText(/Prix unitaire/i), {
      target: { value: '-10' },
    });

    fireEvent.click(screen.getByText(/Valider/i));
    fireEvent.submit(screen.getByTestId('lot-form'));

    await waitFor(() => {
      expect(screen.getByTestId('error-0')).toBeTruthy();
      expect(screen.getByTestId('error-1')).toBeTruthy();
      expect(screen.getByTestId('error-2')).toBeTruthy();
      expect(screen.getByTestId('error-3')).toBeTruthy();
    });
  });

  test('prevents submission if no image is selected or chosen', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <ProductTypeContext.Provider value={mockProductTypeContext}>
            <UserContext.Provider value={mockUserContext}>
              <LotCreationPage />
            </UserContext.Provider>
          </ProductTypeContext.Provider>
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Quantité initiale/i), {
      target: { value: '10' },
    });

    fireEvent.change(screen.getByLabelText(/Prix unitaire/i), {
      target: { value: '2.5' },
    });

    fireEvent.change(screen.getByLabelText(/Description du produit/i), {
      target: { value: 'heyoooooo' },
    });
    fireEvent.change(screen.getByLabelText(/Unité/i), {
      target: { value: 'kg' },
    });

    fireEvent.click(screen.getByText(/Valider/i));
    fireEvent.submit(screen.getByTestId('lot-form'));

    await waitFor(() => {
      expect(
        screen.getByText(/Veuillez sélectionner ou importer une image/i),
      ).toBeTruthy();
      expect(mockCreateLot).not.toHaveBeenCalled();
    });
  });

  test('calls fetchExistingImage when a matching product is found', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider
          value={{
            ...mockContextValue,
            productOptions: [
              {
                label: 'Carotte',
                productId: 123,
                description: '',
                type: '',
                unit: '',
              },
            ],
          }}
        >
          <ProductTypeContext.Provider value={mockProductTypeContext}>
            <UserContext.Provider value={mockUserContext}>
              <LotCreationPage />
            </UserContext.Provider>
          </ProductTypeContext.Provider>
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/Nom du produit/i);
    fireEvent.change(input, { target: { value: 'Carotte' } });

    fireEvent.click(screen.getByText(/Choisir une image existante/i));

    await waitFor(() => {
      expect(mockFetchExistingImage).toHaveBeenCalledWith(123);
    });
  });

  test('displays errors and red borders when invalid values are submitted', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <ProductTypeContext.Provider value={mockProductTypeContext}>
            <UserContext.Provider value={mockUserContext}>
              <LotCreationPage />
            </UserContext.Provider>
          </ProductTypeContext.Provider>
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const dateField = screen.getByLabelText(/Date de disponibilité/i);
    fireEvent.change(dateField, { target: { value: '2000-01-01' } });

    const quantityField = screen.getByLabelText(/Quantité initiale/i);
    fireEvent.change(quantityField, { target: { value: '-5' } });

    const priceField = screen.getByLabelText(/Prix unitaire/i);
    fireEvent.change(priceField, { target: { value: '0' } });

    const form = screen.getByTestId('lot-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(
          /La date de disponibilité doit être au moins dans 3 jours/i,
        ),
      ).toBeTruthy();
      expect(
        screen.getByText(/La quantité initiale doit être un nombre positif/i),
      ).toBeTruthy();
      expect(
        screen.getByText(/Le prix unitaire doit être un nombre positif/i),
      ).toBeTruthy();
      expect(
        screen.getByText(/Veuillez sélectionner ou importer une image/i),
      ).toBeTruthy();

      expect(dateField.getAttribute('aria-invalid')).toBe('true');
      expect(quantityField.getAttribute('aria-invalid')).toBe('true');
      expect(priceField.getAttribute('aria-invalid')).toBe('true');
    });
  });

  test('shows error if quantity is negative', async () => {
    renderComponent();

    const quantityInput = screen.getByLabelText(/Quantité initiale/i);
    fireEvent.change(quantityInput, { target: { value: '-5' } });

    const form = screen.getByTestId('lot-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('error-0')).toBeTruthy();
      expect(quantityInput.getAttribute('aria-invalid')).toBe('true');
    });
  });

  test('shows error if availability date is in the past', async () => {
    renderComponent();

    const dateInput = screen.getByLabelText(/Date de disponibilité/i);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];
    fireEvent.change(dateInput, { target: { value: yesterday } });

    const form = screen.getByTestId('lot-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('error-0')).toBeTruthy();
      expect(dateInput.getAttribute('aria-invalid')).toBe('true');
    });
  });

  test('shows error if product description exceeds 120 characters', async () => {
    renderComponent();

    const descriptionInput = screen.getByLabelText(/Description du produit/i);
    const longDescription = 'a'.repeat(121);
    fireEvent.change(descriptionInput, { target: { value: longDescription } });

    const form = screen.getByTestId('lot-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('error-0')).toBeTruthy();

      expect(descriptionInput.getAttribute('aria-invalid')).toBe('true');
    });
  });

  test('shows error if image is not selected', async () => {
    renderComponent();

    const unitPriceInput = screen.getByLabelText(/Prix unitaire/i);
    fireEvent.change(unitPriceInput, { target: { value: '10' } });

    const quantityInput = screen.getByLabelText(/Quantité initiale/i);
    fireEvent.change(quantityInput, { target: { value: '10' } });

    const dateInput = screen.getByLabelText(/Date de disponibilité/i);
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0];
    fireEvent.change(dateInput, { target: { value: tomorrow } });

    const form = screen.getByTestId('lot-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('error-0')).toBeTruthy();
      expect(
        screen.getByText(/Veuillez sélectionner ou importer une image/i),
      ).toBeTruthy();
    });
  });

  test('displays error if no existing product matches when selecting existing image', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContext.Provider
            value={{
              ...mockContextValue,
              productOptions: [],
            }}
          >
            <ProductTypeContext.Provider value={mockProductTypeContext}>
              <LotCreationPage />
            </ProductTypeContext.Provider>
          </ProductLotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/Nom du produit/i), {
      target: { value: 'Inconnu' },
    });
    fireEvent.click(screen.getByText(/Choisir une image existante/i));
    await waitFor(() => {
      const errorMessage = screen.getByTestId('image-error');
      expect(errorMessage).toBeTruthy();
    });
  });

  test('calls fetchProductSuggestions when input value changes', () => {
    renderComponent();

    const input = screen.getByLabelText(/Nom du produit/i);
    fireEvent.change(input, { target: { value: 'Tomate' } });

    expect(mockFetchProductSuggestions).toHaveBeenCalledWith('Tomate');
  });

  test('resets product fields when input is cleared', () => {
    renderComponent();

    const input = screen.getByLabelText(/Nom du produit/i);

    fireEvent.change(input, { target: { value: 'Tomate' } });
    expect(mockFetchProductSuggestions).toHaveBeenCalledWith('Tomate');

    fireEvent.change(input, { target: { value: '' } });

    expect(
      screen.getByLabelText(/Description du produit/i).getAttribute('value'),
    ).toBe('');
    expect(screen.getByLabelText(/Unité/i).getAttribute('value')).toBe('');
    expect(
      screen.getByLabelText(/Date de disponibilité/i).getAttribute('value'),
    ).toBe('');
  });

  test('displays an error if fetchUserDetails fails', async () => {
    const mockError = vi.fn();
    const originalConsoleError = console.error;
    console.error = mockError;

    const erroringUserContext = {
      ...mockUserContext,
      fetchUserDetails: vi.fn().mockRejectedValue(new Error('fetch failed')),
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={erroringUserContext}>
          <ProductLotContext.Provider value={mockContextValue}>
            <ProductTypeContext.Provider value={mockProductTypeContext}>
              <LotCreationPage />
            </ProductTypeContext.Provider>
          </ProductLotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(erroringUserContext.fetchUserDetails).toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledWith(
        'Erreur lors de la récupération du user',
      );
    });

    console.error = originalConsoleError;
  });
});
