import { render, screen, waitFor } from '@testing-library/react';
import LotDetailsPage from '../pages/LotDetailsPage';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { UserContext } from '../../contexts/UserContext';
import { ReservationContext } from '../../contexts/ReservationContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import theme from '../../themes';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import type {
  ProductLotContextType,
  UserContextType,
  ReservationContextType,
  ProductLot,
  UserDetails,
} from '../../types';
import { OpenSalesContext } from '../../contexts/OpenSalesContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockLot: ProductLot = {
  lotId: 1,
  productLabel: 'Pommes Bio',
  productType: 'Fruits',
  imageUrl: 'image.png',
  producerEmail: 'producer@test.com',
  unitPrice: 2,
  remainingQuantity: 5,
  availabilityDate: '2024-12-01',
  productUnit: 'kg',
  productDescription: 'Des pommes naturelles',
  initialQuantity: 10,
  soldQuantity: 3,
  reservedQuantity: 2,
  productLotState: 'FOR_SALE',
  producerName: 'Jean Bio',
};

const renderPage = (options?: {
  lot?: ProductLot | null;
  fetchProductLotById?: ProductLotContextType['fetchProductLotById'];
  authenticatedUser?: UserContextType['authenticatedUser'];
  fetchUserDetails?: () => Promise<UserDetails>;
  clearUser?: () => void;
  userDetails?: UserDetails | null;
  addToReservation?: ReservationContextType['addToReservation'];
  decreaseLotQuantity?: ProductLotContextType['decreaseLotQuantity'];
  createOpenSale?: () => Promise<boolean>;
}) => {
  const {
    lot = mockLot,
    fetchProductLotById = vi.fn(),
    authenticatedUser,
    fetchUserDetails = vi.fn().mockResolvedValue({ role: 'CUSTOMER' }),
    clearUser = vi.fn(),
    addToReservation = vi.fn(),
  } = options || {};

  const resolvedAuthenticatedUser =
    options &&
    Object.prototype.hasOwnProperty.call(options, 'authenticatedUser')
      ? authenticatedUser
      : { email: 'user@test.com', token: 'token' };

  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MemoryRouter initialEntries={['/lots/1']}>
        <Routes>
          <Route
            path="/lots/:lotId"
            element={
              <UserContext.Provider
                value={{
                  authenticatedUser: resolvedAuthenticatedUser,
                  registerUser: vi.fn(),
                  loginUser: vi.fn(),
                  clearUser,
                  checkUserAuthentication: vi.fn(),
                  isTokenExpired: false,
                  changePassword: vi.fn(),
                  fetchUserDetails,
                  isVolunteer: false,
                  fetchIsDeactivated: vi.fn(),
                }}
              >
                <ProductLotContext.Provider
                  value={
                    {
                      fetchProductLotById,
                      lot,
                      decreaseLotQuantity:
                        options?.decreaseLotQuantity ?? vi.fn(),
                    } as ProductLotContextType
                  }
                >
                  <ReservationContext.Provider
                    value={{
                      items: [],
                      addToReservation,
                      clearReservation: vi.fn(),
                      submitReservation: vi.fn(),
                      updateQuantity: vi.fn(),
                      removeFromReservation: vi.fn(),
                      fetchAllReservations: vi.fn(),
                      updateReservationState: vi.fn(),
                    }}
                  >
                    <OpenSalesContext.Provider
                      value={{
                        createOpenSale:
                          options?.createOpenSale ??
                          vi.fn().mockResolvedValue(true),

                        items: [],
                        addToOpenSale: vi.fn(),
                        updateQuantity: vi.fn(),
                        removeFromOpenSale: vi.fn(),
                      }}
                    >
                      <LotDetailsPage />
                    </OpenSalesContext.Provider>
                  </ReservationContext.Provider>
                </ProductLotContext.Provider>
              </UserContext.Provider>
            }
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
};
describe('LotDetailsPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('displays lot information correctly', () => {
    renderPage();
    expect(screen.getByTestId('product-label').textContent).toContain(
      'Pommes Bio',
    );
    expect(screen.getByTestId('unit-price').textContent).toContain(
      '2.00 € / kg',
    );
  });

  test('shows error if lot not found', async () => {
    const fetchMock = vi.fn().mockImplementation(() => {
      throw new Error('not found');
    });
    renderPage({ lot: null, fetchProductLotById: fetchMock });
    await waitFor(() =>
      expect(screen.getByTestId('error-message').textContent).toContain(
        'Lot demandé introuvable',
      ),
    );
  });

  test('opens non-customer dialog if user is not CUSTOMER', async () => {
    const userDetails = { role: 'PRODUCER' } as UserDetails;
    const fetchUserDetails = vi.fn().mockResolvedValue(userDetails);
    renderPage({ fetchUserDetails });
    await waitFor(() => expect(fetchUserDetails).toHaveBeenCalled());
    await userEvent.click(screen.getByTestId('add-to-reservation-button'));
    const dialog = await screen.findByTestId('dialog-registration-message');
    expect(dialog).toBeInTheDocument();
  });

  test('confirms reservation and navigates when user is CUSTOMER', async () => {
    const addToReservation = vi.fn();
    const fetchUserDetails = vi.fn().mockResolvedValue({ role: 'CUSTOMER' });
    renderPage({ fetchUserDetails, addToReservation });

    await userEvent.click(screen.getByTestId('add-to-reservation-button'));

    await waitFor(() =>
      expect(screen.getByTestId('dialog-confirmation-dialog')).toBeTruthy(),
    );

    await userEvent.click(screen.getByTestId('dialog-confirmation-button'));

    await waitFor(() => {
      expect(addToReservation).toHaveBeenCalledWith(mockLot, 1);
      expect(mockNavigate).toHaveBeenCalledWith('/my-reservation');
    });
  });

  test('displays quantity error when exceeding available stock', async () => {
    renderPage();
    const input = screen.getByTestId('quantity-input').querySelector('input')!;
    await userEvent.clear(input);
    await userEvent.type(input, '99');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('resets quantity to 1 if empty onBlur', async () => {
    renderPage();
    const input = screen.getByTestId('quantity-input').querySelector('input')!;
    await userEvent.clear(input);
    expect(input).toHaveValue(null);
    input.blur();
    await waitFor(() => expect(input).toHaveValue(1));
  });

  test('resets quantity to 1 if value is NaN on blur', async () => {
    renderPage();
    const input = screen.getByTestId('quantity-input').querySelector('input')!;
    await userEvent.clear(input);
    await userEvent.type(input, 'abc');
    input.blur();
    await waitFor(() => expect(input).toHaveValue(1));
  });

  test('navigates to register and clears user if not a CUSTOMER', async () => {
    const clearUser = vi.fn();
    const fetchUserDetails = vi.fn().mockResolvedValue({ role: 'PRODUCER' });
    renderPage({ clearUser, fetchUserDetails });

    await userEvent.click(screen.getByTestId('add-to-reservation-button'));
    await waitFor(() =>
      expect(screen.getByTestId('dialog-registration-message')).toBeTruthy(),
    );

    const registerButton = screen.getByText('Créer un compte client');
    await userEvent.click(registerButton);

    expect(clearUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('navigates to login and clears user if not a CUSTOMER', async () => {
    const clearUser = vi.fn();
    const fetchUserDetails = vi.fn().mockResolvedValue({ role: 'PRODUCER' });
    renderPage({ clearUser, fetchUserDetails });

    await userEvent.click(screen.getByTestId('add-to-reservation-button'));
    await waitFor(() =>
      expect(screen.getByTestId('dialog-registration-message')).toBeTruthy(),
    );

    const loginButton = screen.getByText('Connectez-vous');
    await userEvent.click(loginButton);

    expect(clearUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('resets quantity to 1 if input is below minimum', async () => {
    renderPage();
    const input = screen.getByTestId('quantity-input').querySelector('input')!;
    await userEvent.clear(input);
    await userEvent.type(input, '0');
    input.blur();
    await waitFor(() => expect(input).toHaveValue(1));
  });

  test('resets quantity to max if value exceeds stock on blur', async () => {
    renderPage();
    const input = screen.getByTestId('quantity-input').querySelector('input')!;
    await userEvent.clear(input);
    await userEvent.type(input, '999');
    input.blur();
    await waitFor(() => expect(input).toHaveValue(mockLot.remainingQuantity));
  });

  test('logs an error if fetchUserDetails throws', async () => {
    const fetchUserDetails = vi.fn().mockRejectedValue(new Error('fail'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderPage({ fetchUserDetails });

    await userEvent.click(screen.getByTestId('add-to-reservation-button'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erreur:', expect.any(Error));
    });
  });

  test('displays manager buttons when user is MANAGER', async () => {
    const fetchUserDetails = vi.fn().mockResolvedValue({ role: 'MANAGER' });
    renderPage({ fetchUserDetails });

    await waitFor(() => expect(fetchUserDetails).toHaveBeenCalled());

    expect(screen.getByText('Vente libre')).toBeInTheDocument();
    expect(screen.getByText('🗑️')).toBeInTheDocument();
  });

  test('calls decreaseLotQuantity when manager clicks delete then confirm', async () => {
    const decreaseLotQuantity = vi.fn();
    const fetchUserDetails = vi.fn().mockResolvedValue({ role: 'MANAGER' });

    renderPage({ fetchUserDetails, decreaseLotQuantity });

    await waitFor(() => expect(fetchUserDetails).toHaveBeenCalled());

    await userEvent.click(screen.getByText('🗑️'));
    await userEvent.click(screen.getByTestId('dialog-confirmation-button'));

    await waitFor(() => {
      expect(decreaseLotQuantity).toHaveBeenCalledWith(mockLot.lotId, 1);
    });
  });

  test('calls createOpenSale when manager clicks free sale then confirm', async () => {
    const createOpenSale = vi.fn();
    const fetchUserDetails = vi.fn().mockResolvedValue({ role: 'MANAGER' });

    renderPage({ fetchUserDetails, createOpenSale });

    await waitFor(() => expect(fetchUserDetails).toHaveBeenCalled());

    await userEvent.click(screen.getByText('Vente libre'));
    await userEvent.click(screen.getByTestId('dialog-confirmation-button'));
  });

  test('sets manager action and opens dialog when clicking free sale', async () => {
    const fetchUserDetails = vi.fn().mockResolvedValue({ role: 'MANAGER' });
    renderPage({ fetchUserDetails });

    const button = await screen.findByText('Vente libre');
    await userEvent.click(button);

    const dialog = await screen.findByTestId('dialog-confirmation-dialog');
    expect(dialog).toBeInTheDocument();
  });

  test('closes confirmation dialog on cancel click', async () => {
    const fetchUserDetails = vi.fn().mockResolvedValue({ role: 'MANAGER' });
    renderPage({ fetchUserDetails });

    await waitFor(() => expect(fetchUserDetails).toHaveBeenCalled());

    await userEvent.click(screen.getByText('Vente libre'));
    const cancelButton = screen.getByText('Annuler');
    await userEvent.click(cancelButton);

    await waitFor(() =>
      expect(
        screen.queryByTestId('dialog-confirmation-dialog'),
      ).not.toBeInTheDocument(),
    );
  });

  test('closes customer-required dialog on Escape (unauthenticated)', async () => {
    renderPage({ authenticatedUser: undefined });

    await userEvent.click(screen.getByTestId('add-to-reservation-button'));

    const dialog = await screen.findByTestId('dialog-customer-message');
    expect(dialog).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        screen.queryByTestId('dialog-customer-message'),
      ).not.toBeInTheDocument(),
    );
  });

  test('closes confirmation dialog on Escape', async () => {
    renderPage({
      userDetails: {
        role: 'CUSTOMER',
        id: 0,
        email: '',
        title: '',
        firstname: '',
        lastname: '',
        phoneNumber: '',
        address: {
          street: '123 Main St',
          number: '456',
          poBox: '789',
          city: 'Sample City',
          postalCode: '12345',
          country: 'Sample Country',
        },
        deactivated: false,
      },
    });

    await userEvent.click(screen.getByTestId('add-to-reservation-button'));

    const dialog = await screen.findByTestId('dialog-confirmation-dialog');
    expect(dialog).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        screen.queryByTestId('dialog-confirmation-dialog'),
      ).not.toBeInTheDocument(),
    );
  });
});
