import { describe, vi, expect, beforeAll, beforeEach, test } from 'vitest';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from './HomePage';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { ReservationContext } from '../../contexts/ReservationContext';
import {
  UserContextType,
  ReservationContextType,
  ProductLot,
  ProductLotContextType,
  OpenSalesContextType,
} from '../../types';
import { OpenSalesContext } from '../../contexts/OpenSalesContext';
import { ProductLotContext } from '../../contexts/ProductLotContext';
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
const mockUserContextWithRole: UserContextType = {
  authenticatedUser: {
    email: 'test@mail.com',
    token: '123',
  },
  fetchUserDetails: vi.fn().mockResolvedValue({ role: 'CUSTOMER' }),
  isVolunteer: false,
  isTokenExpired: false,
  clearUser: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  changePassword: vi.fn(),
  checkUserAuthentication: vi.fn(),
  fetchIsDeactivated: vi.fn(),
};

const mockProductLotContext: ProductLotContextType = {
  allLots: [],
  availableLots: [],
  soldOutLots: [],
  acceptedLots: [],
  refusedLots: [],
  allLotsForManager: [],
  pendingLots: [],
  lot: null,
  existingImages: [],
  productOptions: [],
  fetchAvailableLots: vi.fn(),
  fetchAcceptedLots: vi.fn(),
  fetchRefusedLots: vi.fn(),
  fetchSoldOutLots: vi.fn(),
  fetchAllLots: vi.fn(),
  fetchAllLotsForManager: vi.fn(),
  createLot: vi.fn(),
  fetchExistingImage: vi.fn(),
  fetchProductSuggestions: vi.fn(),
  fetchPendingLots: vi.fn(),
  fetchProductLotById: vi.fn(),
  updateLot: vi.fn(),
  changeLotState: vi.fn(),
  decreaseLotQuantity: vi.fn(),
  fetchSalesStatistics: vi.fn(),
};

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
});

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    switch (url) {
      case '/api/product-lots/?state=FOR_SALE':
        return Promise.resolve({
          json: () =>
            Promise.resolve([
              {
                lotId: 1,
                productLabel: 'Pommes',
                productDescription: 'Pommes rouges et juteuses',
                unitPrice: 2.5,
                remainingQuantity: 12,
                imageUrl: '/test1.jpg',
                productType: 'Fruits',
              } as ProductLot,
            ]),
        } as Response);

      case '/api/product-lots/recent':
        return Promise.resolve({
          json: () =>
            Promise.resolve([
              {
                lotId: 2,
                productLabel: 'Carottes',
                productDescription: 'Bio, croquantes',
                unitPrice: 1.5,
                remainingQuantity: 5,
                imageUrl: '/test-carousel.jpg',
                productType: 'Légumes',
              } as ProductLot,
            ]),
        } as Response);

      case '/api/product-types/':
        return Promise.resolve({
          json: () =>
            Promise.resolve([
              { typeId: 1, label: 'Fruits' },
              { typeId: 2, label: 'Légumes' },
            ]),
        } as Response);

      default:
        return Promise.reject(new Error('Unknown URL'));
    }
  });
});

describe('HomePage', () => {
  const mockUserContext: UserContextType = {
    authenticatedUser: {
      email: 'test@mail.com',
      token: '123',
    },
    checkUserAuthentication: vi.fn(),
    loginUser: vi.fn(),
    registerUser: vi.fn(),
    changePassword: vi.fn(),
    isVolunteer: false,
    isTokenExpired: false,
    clearUser: vi.fn(),
    fetchUserDetails: vi.fn(),
    fetchIsDeactivated: vi.fn(),
  };

  const mockReservationContext: ReservationContextType = {
    items: [],
    addToReservation: vi.fn(),
    clearReservation: vi.fn(),
    submitReservation: vi.fn(),
    updateQuantity: vi.fn(),
    removeFromReservation: vi.fn(),
    fetchAllReservations: vi.fn(),
    updateReservationState: vi.fn(),
  };

  const renderHomePage = () =>
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

  test('renders main sections and UI elements', async () => {
    renderHomePage();

    expect(
      await screen.findByText('Découvrez nos produits récents'),
    ).toBeTruthy();
    expect(
      await screen.findByText('Produits disponibles à la réservation'),
    ).toBeTruthy();

    expect(screen.getByLabelText('Rechercher un produit')).toBeTruthy();
    expect(screen.getByText('Rechercher')).toBeTruthy();

    expect(screen.getByLabelText('Type de produit')).toBeTruthy();

    expect(await screen.findAllByText('Carottes')).toBeTruthy();
    expect(await screen.findAllByText('Pommes')).toBeTruthy();
  });
  test('filters products by search term', async () => {
    renderHomePage();

    const input = await screen.findByLabelText('Rechercher un produit');
    await userEvent.clear(input);
    await userEvent.type(input, 'Pom');

    const button = screen.getByText('Rechercher');
    await userEvent.click(button);

    expect(await screen.findAllByText('Pommes')).toBeTruthy();
  });

  test('filters products by type', async () => {
    renderHomePage();
    const selectButton = await screen.findByLabelText('Type de produit');
    await userEvent.click(selectButton);

    const legumesOption = await screen.findByText('Légumes');
    await userEvent.click(legumesOption);

    const searchBtn = screen.getByText('Rechercher');
    await userEvent.click(searchBtn);
    expect(await screen.findAllByText('Carottes')).toBeTruthy();
    expect(screen.queryByText('Pommes')).toBeNull();
  });

  test('shows confirmation dialog when user is logged in', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextWithRole}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const button = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(button);

    expect(await screen.findByText('Confirmation')).toBeTruthy();
    expect(
      screen.getAllByText(
        (_content, node) =>
          !!node?.textContent &&
          node.textContent.includes('Voulez-vous ajouter') &&
          node.textContent.includes('Pommes'),
      ),
    ).toBeTruthy();
  });

  test('calls addToReservation when user confirms reservation', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextWithRole}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const addBtn = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(addBtn);

    const confirm = await screen.findByText('Confirmer');
    await userEvent.click(confirm);

    expect(mockReservationContext.addToReservation).toHaveBeenCalledOnce();
    expect(mockReservationContext.addToReservation).toHaveBeenCalledWith(
      expect.objectContaining({ productLabel: 'Pommes' }),
      1,
    );
  });

  test('opens login/register dialog if user is not authenticated', async () => {
    const mockUserWithoutAuth: UserContextType = {
      ...mockUserContext,
      authenticatedUser: undefined,
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserWithoutAuth}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const button = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(button);

    expect(
      await screen.findByText(/vous devez être inscrit et connecté/i),
    ).toBeTruthy();
    expect(screen.getByText('Inscrivez-vous')).toBeTruthy();
    expect(screen.getByText('Connectez-vous')).toBeTruthy();
  });

  test('shows no product message when search does not match', async () => {
    renderHomePage();

    const input = await screen.findByLabelText('Rechercher un produit');
    await userEvent.clear(input);
    await userEvent.type(input, 'XYZ');

    const button = screen.getByText('Rechercher');
    await userEvent.click(button);

    expect(await screen.findByText(/aucun produit/i)).toBeTruthy();
  });

  test('ensures quantity cannot be lower than 1', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextWithRole}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );
    const quantityField = await screen.findByRole('spinbutton');
    await userEvent.clear(quantityField);
    await userEvent.type(quantityField, '0');

    quantityField.blur();

    const addButton = screen.getByText('Ajouter à la réservation');
    await userEvent.click(addButton);
    await screen.findByText('Confirmation');

    const confirmButton = screen.getByText('Confirmer');
    await userEvent.click(confirmButton);

    expect(mockReservationContext.addToReservation).toHaveBeenCalledWith(
      expect.objectContaining({ productLabel: 'Pommes' }),
      1,
    );
  });

  test('calls addToReservation with correct data', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextWithRole}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );
    const btn = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(btn);
    const confirm = await screen.findByText('Confirmer');
    await userEvent.click(confirm);
    expect(mockReservationContext.addToReservation).toHaveBeenCalled();
  });

  test('scrollByAmount is called on carousel navigation buttons', async () => {
    renderHomePage();
    const leftArrow = screen.findByTestId('arrow1');
    const rightArrow = screen.findByTestId('arrow2');
    expect(leftArrow).toBeTruthy();
    expect(rightArrow).toBeTruthy();
  });

  test('changes page on pagination click', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === '/api/product-lots/?state=FOR_SALE') {
        return Promise.resolve({
          json: () =>
            Promise.resolve(
              Array.from({ length: 12 }, (_, i) => ({
                lotId: i + 1,
                productLabel: `Produit ${i + 1}`,
                productDescription: 'Test',
                unitPrice: 1.0,
                remainingQuantity: 10,
                imageUrl: '/img.jpg',
                productType: 'Fruits',
              })),
            ),
        } as Response);
      }
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('Not handled');
    });

    renderHomePage();

    expect(await screen.findByText('Produit 1')).toBeTruthy();

    const page2 = await screen.findByText('2');
    await userEvent.click(page2);

    expect(await screen.findByText('Produit 9')).toBeTruthy();
  });

  test('shows login/register modal when unauthenticated user tries to reserve', async () => {
    const mockUserWithoutAuth: UserContextType = {
      ...mockUserContext,
      authenticatedUser: undefined,
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserWithoutAuth}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const reserveBtn = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(reserveBtn);

    expect(await screen.findByText(/vous devez être inscrit/i)).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /inscrivez-vous/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /connectez-vous/i }),
    ).toBeTruthy();
  });

  test('redirects to /register when clicking "Inscrivez-vous"', async () => {
    const mockUserWithoutAuth: UserContextType = {
      ...mockUserContext,
      authenticatedUser: undefined,
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserWithoutAuth}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const reserveBtn = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(reserveBtn);

    const registerBtn = await screen.findByRole('button', {
      name: /inscrivez-vous/i,
    });
    await userEvent.click(registerBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('redirects to /login when clicking "Connectez-vous"', async () => {
    const mockUserWithoutAuth: UserContextType = {
      ...mockUserContext,
      authenticatedUser: undefined,
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserWithoutAuth}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const reserveBtn = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(reserveBtn);

    const loginBtn = await screen.findByRole('button', {
      name: /connectez-vous/i,
    });
    await userEvent.click(loginBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('clears user and redirects to /register when "Créer un compte client" clicked', async () => {
    const mockClear = vi.fn();

    render(
      <MemoryRouter>
        <UserContext.Provider
          value={{
            ...mockUserContext,
            authenticatedUser: { email: 'not@customer.com', token: '123' },
            fetchUserDetails: vi.fn().mockResolvedValue({ role: 'ADMIN' }),
            clearUser: mockClear,
          }}
        >
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const btn = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(btn);

    const createBtn = await screen.findByRole('button', {
      name: /Créer un compte client/i,
    });
    await userEvent.click(createBtn);

    expect(mockClear).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('shows "Stock max" warning if quantity exceeds available stock', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextWithRole}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const quantityInput = await screen.findByRole('spinbutton');
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '100');

    quantityInput.blur();

    expect(await screen.findByText(/Stock max: 12/i)).toBeTruthy();
  });

  test('resets quantity to 1 if input is empty on blur', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextWithRole}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const quantityInput = await screen.findByRole('spinbutton');
    await userEvent.clear(quantityInput);
    quantityInput.blur();

    const addBtn = screen.getByText('Ajouter à la réservation');
    await userEvent.click(addBtn);
    await screen.findByText('Confirmation');

    const confirm = screen.getByText('Confirmer');
    await userEvent.click(confirm);

    expect(mockReservationContext.addToReservation).toHaveBeenCalledWith(
      expect.objectContaining({ productLabel: 'Pommes' }),
      1,
    );
  });

  test('calls scrollByAmount on carousel arrow click', async () => {
    const scrollByMock = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
      value: scrollByMock,
      writable: true,
    });

    renderHomePage();
    const rightArrow = await screen.findByTestId('arrow2');
    await userEvent.click(rightArrow);

    expect(scrollByMock).toHaveBeenCalled();
  });

  test('closes confirmation dialog on cancel', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextWithRole}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const addBtn = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(addBtn);

    const cancelBtn = await screen.findByText('Annuler');
    await userEvent.click(cancelBtn);

    await waitForElementToBeRemoved(() =>
      screen.queryByText(/voulez-vous ajouter/i),
    );
  });

  test('executes search on Enter key press', async () => {
    renderHomePage();

    const input = await screen.findByLabelText('Rechercher un produit');
    await userEvent.clear(input);
    await userEvent.type(input, 'Pom{enter}');

    expect(await screen.findAllByText('Pommes')).toBeTruthy();
  });

  test('calls scrollByAmount when left arrow is clicked', async () => {
    const scrollByMock = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
      value: scrollByMock,
      writable: true,
    });

    renderHomePage();
    const leftArrow = await screen.findByTestId('arrow1');
    await userEvent.click(leftArrow);

    expect(scrollByMock).toHaveBeenCalled();
  });
  test('calls createOpenSale when manager confirms FREE_SALE', async () => {
    const mockCreateOpenSale = {
      createOpenSale: vi.fn(),
      items: [],
      removeFromOpenSale: vi.fn(),
      updateQuantity: vi.fn(),
      addToOpenSale: vi.fn(),
    };

    const mockUserManager: UserContextType = {
      ...mockUserContext,
      authenticatedUser: { email: 'manager@test.com', token: '123' },
      fetchUserDetails: vi.fn().mockResolvedValue({ role: 'MANAGER' }),
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserManager}>
          <ReservationContext.Provider value={mockReservationContext}>
            <OpenSalesContext.Provider value={{ ...mockCreateOpenSale }}>
              <ProductLotContext.Provider value={mockProductLotContext}>
                <HomePage />
              </ProductLotContext.Provider>
            </OpenSalesContext.Provider>
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const venteLibreBtn = await screen.findAllByRole('button', {
      name: /vente libre/i,
    });

    await userEvent.click(venteLibreBtn[0]);
    const confirm = await screen.findByText('Confirmer');
    await userEvent.click(confirm);
  });

  test('fetchProductSuggestions is called on input change', async () => {
    const mockFetchSuggestions = vi.fn();
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextWithRole}>
          <ReservationContext.Provider value={mockReservationContext}>
            <ProductLotContext.Provider
              value={{
                ...mockProductLotContext,
                fetchProductSuggestions: mockFetchSuggestions,
              }}
            >
              <HomePage />
            </ProductLotContext.Provider>
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const input = await screen.findByLabelText('Rechercher un produit');
    await userEvent.type(input, 'po');
    expect(mockFetchSuggestions).toHaveBeenCalledWith('po');
  });

  const mockOpenSalesContext: OpenSalesContextType = {
    createOpenSale: vi.fn(),
    items: [],
    removeFromOpenSale: vi.fn(),
    updateQuantity: vi.fn(),
    addToOpenSale: vi.fn(),
  };

  test('confirms deletion and calls decreaseLotQuantity', async () => {
    const mockDecrease = vi.fn();

    const mockUserManager: UserContextType = {
      ...mockUserContext,
      authenticatedUser: { email: 'manager@test.com', token: '123' },
      fetchUserDetails: vi.fn().mockResolvedValue({ role: 'MANAGER' }),
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserManager}>
          <ReservationContext.Provider value={mockReservationContext}>
            <ProductLotContext.Provider
              value={{
                ...mockProductLotContext,
                decreaseLotQuantity: mockDecrease,
              }}
            >
              <OpenSalesContext.Provider value={mockOpenSalesContext}>
                <HomePage />
              </OpenSalesContext.Provider>
            </ProductLotContext.Provider>
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const deleteBtn = await screen.findByTestId('delete-button');
    await userEvent.click(deleteBtn);
    await userEvent.click(deleteBtn);

    const confirmBtn = await screen.findByText('Confirmer');
    await userEvent.click(confirmBtn);

    expect(mockDecrease).toHaveBeenCalled();
  });

  test('navigates to /login when manager clicks "Connectez-vous"', async () => {
    const clearUser = vi.fn();

    render(
      <MemoryRouter>
        <UserContext.Provider
          value={{
            ...mockUserContext,
            authenticatedUser: { email: 'admin@ex.com', token: '123' },
            fetchUserDetails: vi.fn().mockResolvedValue({ role: 'ADMIN' }),
            clearUser,
          }}
        >
          <ReservationContext.Provider value={mockReservationContext}>
            <ProductLotContext.Provider value={mockProductLotContext}>
              <OpenSalesContext.Provider value={mockOpenSalesContext}>
                <HomePage />
              </OpenSalesContext.Provider>
            </ProductLotContext.Provider>
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const addBtn = await screen.findByText('Ajouter à la réservation');
    await userEvent.click(addBtn);

    const connectBtn = await screen.findByRole('button', {
      name: /connectez-vous/i,
    });
    await userEvent.click(connectBtn);

    expect(clearUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
