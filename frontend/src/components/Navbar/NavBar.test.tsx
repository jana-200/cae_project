import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, vi, expect } from 'vitest';
import NavBar from './';
import { UserContext } from '../../contexts/UserContext';
import { ReservationContext } from '../../contexts/ReservationContext';
import { ReservedItem, UserContextType, ProductLot } from '../../types';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const baseUserContext: UserContextType = {
  authenticatedUser: undefined,
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  checkUserAuthentication: vi.fn(),
  isTokenExpired: false,
  changePassword: vi.fn(),
  fetchUserDetails: vi.fn(),
  isVolunteer: false,
  fetchIsDeactivated: vi.fn(),
};

const renderNavBar = (
  userProps: Partial<UserContextType> = {},
  items: ReservedItem[] = [],
) => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ ...baseUserContext, ...userProps }}>
        <ReservationContext.Provider
          value={{
            items,
            addToReservation: vi.fn(),
            clearReservation: vi.fn(),
            submitReservation: vi.fn(),
            updateQuantity: vi.fn(),
            removeFromReservation: vi.fn(),
            fetchAllReservations: vi.fn(),
            updateReservationState: vi.fn(),
          }}
        >
          <NavBar />
        </ReservationContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('NavBar', () => {
  test('displays Login and Register when not authenticated', () => {
    renderNavBar();
    expect(screen.getByText(/Se connecter/i)).toBeTruthy();
    expect(screen.getByText(/S'inscrire/i)).toBeTruthy();
  });

  test('dipslays firstname and shooping cart if role is CUSTOMER', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ role: 'CUSTOMER', firstname: 'Léa' });

    renderNavBar(
      {
        authenticatedUser: { email: 'lea@test.com', token: 'fake' },
        fetchUserDetails: fetchMock,
      },
      [
        { product: { lotId: 1 } as ProductLot, quantity: 2 },
        { product: { lotId: 2 } as ProductLot, quantity: 3 },
      ],
    );

    await waitFor(() => {
      expect(screen.getByText('Léa')).toBeTruthy();
      expect(screen.getByText('5')).toBeTruthy();
    });
  });

  test('Badge content is capped at 99', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      role: 'CUSTOMER',
      firstname: 'Max',
    });
    renderNavBar(
      {
        authenticatedUser: { email: 'max@test.com', token: 'tok' },
        fetchUserDetails: fetchMock,
      },
      Array.from({ length: 100 }, (_, i) => ({
        product: { lotId: i + 1 } as ProductLot,
        quantity: 1,
      })),
    );

    await waitFor(() => {
      expect(screen.getByText('99+')).toBeTruthy();
    });
  });

  test('displays buttons "Mes lots" and "Proposer un lot" for PRODUCER', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ role: 'PRODUCER', firstname: 'Paul' });

    renderNavBar({
      authenticatedUser: { email: 'paul@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.getByText(/Mes lots/)).toBeTruthy();
      expect(screen.getByText(/Proposer un lot/)).toBeTruthy();
    });
  });

  test('dipslays "Créer un compte" for MANAGER', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ role: 'MANAGER', firstname: 'Milo' });

    renderNavBar({
      authenticatedUser: { email: 'milo@test.com', token: 'tok' },
      isVolunteer: false,
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.getByText(/créer un compte/i)).toBeTruthy();
    });
  });

  test('redirects to home page on logo click', () => {
    renderNavBar();
    const logo = screen.getByRole('img', { name: /logo/i });
    logo.click();
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  test('navigates to profile page via user menu', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      role: 'CUSTOMER',
      firstname: 'Léna',
    });

    renderNavBar({
      authenticatedUser: { email: 'lena@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.getByText('Léna')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Léna'));

    const menuItems = await screen.findAllByRole('menuitem');
    const profilItem = menuItems.find((item) =>
      item.textContent?.toLowerCase().includes('profil'),
    );

    expect(profilItem).toBeTruthy();
    fireEvent.click(profilItem!);

    expect(navigateMock).toHaveBeenCalledWith('/profile');
  });

  test('log out user via the button on the menu', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      role: 'CUSTOMER',
      firstname: 'Léna',
    });

    const clearUser = vi.fn();

    renderNavBar({
      authenticatedUser: { email: 'lena@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
      clearUser,
    });

    await waitFor(() => {
      expect(screen.getByText('Léna')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Léna'));

    const menuItems = await screen.findAllByRole('menuitem');
    const logoutItem = menuItems.find((item) =>
      item.textContent?.toLowerCase().includes('déconnexion'),
    );

    expect(logoutItem).toBeTruthy();
    fireEvent.click(logoutItem!);

    expect(clearUser).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('redirects to /my-reservation when the cart is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      role: 'CUSTOMER',
      firstname: 'Lucie',
    });

    renderNavBar(
      {
        authenticatedUser: { email: 'lucie@test.com', token: 'tok' },
        fetchUserDetails: fetchMock,
      },
      [{ product: { lotId: 1 } as ProductLot, quantity: 3 }],
    );

    await waitFor(() => {
      expect(screen.getByText('Lucie')).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
    });

    const cartIcon = screen.getByTestId('ShoppingCartIcon');
    const button = cartIcon.closest('button');

    expect(button).toBeTruthy();
    button?.click();

    expect(navigateMock).toHaveBeenCalledWith('/my-reservation');
  });

  test('displays only the Logout button when user is a benevol', () => {
    renderNavBar({
      authenticatedUser: { email: 'volunteer@test.com', token: 'tok' },
      isVolunteer: true,
    });

    const volunteerIcon = screen.getByText('Bénévole');
    fireEvent.click(volunteerIcon);

    expect(screen.getByText('Déconnexion')).toBeTruthy();
    expect(screen.queryByText(/profil/i)).toBeNull();
    expect(screen.queryByText(/mes lots/i)).toBeNull();
  });

  test('displays the correct total quantity in the cart badge', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      role: 'CUSTOMER',
      firstname: 'Nina',
    });

    renderNavBar(
      {
        authenticatedUser: { email: 'nina@test.com', token: 'tok' },
        fetchUserDetails: fetchMock,
      },
      [
        { product: { lotId: 1 } as ProductLot, quantity: 3 },
        { product: { lotId: 2 } as ProductLot, quantity: 2 },
      ],
    );

    await waitFor(() => {
      expect(screen.getByText('Nina')).toBeTruthy();
      expect(screen.getByText('5')).toBeTruthy();
    });
  });

  test('opens and closes the user menu', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ role: 'CUSTOMER', firstname: 'Alice' });

    renderNavBar({
      authenticatedUser: { email: 'alice@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });

    const avatar = screen.getByText('Alice');
    fireEvent.click(avatar);

    await waitFor(() => {
      expect(screen.getByText(/Profil/)).toBeTruthy();
      expect(screen.getByText(/Déconnexion/)).toBeTruthy();
    });
  });

  test('triggers logout from the user menu', async () => {
    const clearUser = vi.fn();
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ role: 'CUSTOMER', firstname: 'Alice' });

    renderNavBar({
      authenticatedUser: { email: 'alice@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
      clearUser,
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Alice'));
    fireEvent.click(await screen.findByText(/Déconnexion/));

    expect(clearUser).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('logs an error if fetchUserDetails fails', async () => {
    const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('Fetch failed'));
    renderNavBar({
      authenticatedUser: { email: 'fail@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(errorMock).toHaveBeenCalledWith('Erreur:', expect.any(Error));
    });
    errorMock.mockRestore();
  });

  test('navigates to /register and /login when not authenticated', () => {
    renderNavBar();

    fireEvent.click(screen.getByText(/Se connecter/i));
    expect(navigateMock).toHaveBeenCalledWith('/login');

    fireEvent.click(screen.getByText(/S'inscrire/i));
    expect(navigateMock).toHaveBeenCalledWith('/register');
  });

  test('navigates to /my-lots and /create-lot when PRODUCER clicks buttons', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ role: 'PRODUCER', firstname: 'Paul' });

    renderNavBar({
      authenticatedUser: { email: 'paul@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.getByText(/Mes lots/)).toBeTruthy();
      expect(screen.getByText(/Proposer un lot/)).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Mes lots/));
    expect(navigateMock).toHaveBeenCalledWith('/my-lots');

    fireEvent.click(screen.getByText(/Proposer un lot/));
    expect(navigateMock).toHaveBeenCalledWith('/create-lot');
  });

  test('navigates to /account-creation when MANAGER clicks "Créer un compte"', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ role: 'MANAGER', firstname: 'Milo' });

    renderNavBar({
      authenticatedUser: { email: 'milo@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
      isVolunteer: false,
    });

    await waitFor(() => {
      expect(screen.getByText(/créer un compte/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/créer un compte/i));
    expect(navigateMock).toHaveBeenCalledWith('/account-creation');
  });

  test('navigates to /my-reservations from user menu when CUSTOMER clicks the button', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      role: 'CUSTOMER',
      firstname: 'Léa',
    });

    renderNavBar({
      authenticatedUser: { email: 'lea@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => expect(screen.getByText('Léa')).toBeTruthy());
    fireEvent.click(screen.getByText('Léa'));

    const mesReservationsBtn = await screen.findByText(/mes réservations/i);
    fireEvent.click(mesReservationsBtn);

    expect(navigateMock).toHaveBeenCalledWith('/my-reservations');
  });

  test('displays empty string if no firstname or email is available', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      role: 'CUSTOMER',
      firstname: undefined,
    });

    renderNavBar({
      authenticatedUser: undefined,
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.queryByText('Léa')).toBeNull();
      expect(screen.queryByText('test@test.com')).toBeNull();
    });
  });

  test('closes user menu when onClose is triggered', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      role: 'CUSTOMER',
      firstname: 'Alice',
    });

    renderNavBar({
      authenticatedUser: { email: 'alice@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Alice'));

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
  });

  test('logs out immediately for volunteer', async () => {
    const clearUser = vi.fn();

    renderNavBar({
      authenticatedUser: { email: 'volunteer@test.com', token: 'tok' },
      isVolunteer: true,
      clearUser,
    });

    const volunteerIcon = screen.getByText('Bénévole');
    fireEvent.click(volunteerIcon);

    const logoutBtn = await screen.findByText('Déconnexion');
    fireEvent.click(logoutBtn);

    expect(clearUser).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('displays firstname if available', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ firstname: 'John' });

    renderNavBar({
      authenticatedUser: { email: 'john@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.getByText('John')).toBeTruthy();
    });
  });

  test('displays email if firstname is not available', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ firstname: undefined });

    renderNavBar({
      authenticatedUser: { email: 'john@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.getByText('john@test.com')).toBeTruthy();
    });
  });

  test('navigates to notifications page when clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ role: 'CUSTOMER', firstname: 'John' });

    renderNavBar({
      authenticatedUser: { email: 'john@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
    });

    await waitFor(() => {
      expect(screen.getByText('John')).toBeTruthy();
    });
    fireEvent.click(screen.getByText('John'));
    fireEvent.click(screen.getByText(/Notifications/i));

    expect(navigateMock).toHaveBeenCalledWith('/notifications');
  });

  test('navigates to all MANAGER pages', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      role: 'MANAGER',
      firstname: 'Milo',
    });

    renderNavBar({
      authenticatedUser: { email: 'milo@test.com', token: 'tok' },
      fetchUserDetails: fetchMock,
      isVolunteer: false,
    });

    await waitFor(() => {
      expect(screen.getByText(/créer un compte/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Propositions de lots/i));
    expect(navigateMock).toHaveBeenCalledWith('/proposed-lots');

    fireEvent.click(screen.getByText(/Réservations/i));
    expect(navigateMock).toHaveBeenCalledWith('/reservations-management');

    fireEvent.click(screen.getByText(/Tableau de bord/i));
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
  });
});
