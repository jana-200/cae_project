import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReservationHistoryPage from './ReservationHistoryPage';
import { MyReservationsContext } from '../../contexts/MyReservationsContext';
import { UserContext } from '../../contexts/UserContext';
import { describe, vi, expect, beforeEach, test } from 'vitest';
import '@testing-library/jest-dom';
import type { UserContextType } from '../../types';
import type { ReservationInfo } from '../../types';

const mockUserContextValue = (token?: string): UserContextType => ({
  authenticatedUser: token ? { email: 'user@test.com', token } : undefined,
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  checkUserAuthentication: vi.fn(),
  isTokenExpired: false,
  changePassword: vi.fn(),
  fetchUserDetails: vi.fn(),
  isVolunteer: false,
  fetchIsDeactivated: vi.fn(),
});

const mockFetchMyReservations = vi.fn();

const renderPage = ({
  reservations,
  token = 'fake-token',
}: {
  reservations: ReservationInfo[];
  token?: string;
}) => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={mockUserContextValue(token)}>
        <MyReservationsContext.Provider
          value={{
            reservations,
            fetchMyReservations: mockFetchMyReservations,
          }}
        >
          <ReservationHistoryPage />
        </MyReservationsContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('ReservationHistoryPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('display message when no reservation', () => {
    renderPage({ reservations: [] });
    expect(screen.getByText('Aucune réservation trouvée')).toBeTruthy();
  });

  test('displays a current reservation with cancellation', async () => {
    const mockRes = [
      {
        reservationId: 1,
        reservationDate: '2099-04-20',
        recoveryDate: '2099-04-22',
        state: 'RESERVED',
        totalPrice: 15,
        customerEmail: 'john@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'John',
      },
    ];

    renderPage({ reservations: mockRes });

    expect(screen.getByText(/Réservation n°1/)).toBeTruthy();
    expect(screen.getByText('15.00 €')).toBeTruthy();
    fireEvent.click(screen.getByText('Annuler'));
    expect(screen.getByText(/vouloir annuler cette réservation/i)).toBeTruthy();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }),
    );
    fireEvent.click(screen.getByText('Confirmer'));

    await waitFor(() => {
      expect(mockFetchMyReservations).toHaveBeenCalled();
    });
  });

  test('displays a canceled reservation', () => {
    const mockRes = [
      {
        reservationId: 2,
        reservationDate: '2024-04-20',
        recoveryDate: '2024-04-21',
        state: 'CANCELED',
        totalPrice: 20,
        customerEmail: 'jane.doe@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'Jane',
      },
    ];

    renderPage({ reservations: mockRes });

    fireEvent.click(screen.getByRole('tab', { name: /annulées/i }));

    expect(screen.getByText('Annulée')).toBeTruthy();
  });

  test('displays a recovered reservation', () => {
    const mockRes = [
      {
        reservationId: 3,
        reservationDate: '2024-04-20',
        recoveryDate: '2024-04-21',
        state: 'RETRIEVED',
        totalPrice: 25,
        customerEmail: 'jane.doe@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'Jane',
      },
    ];

    renderPage({ reservations: mockRes });

    fireEvent.click(screen.getByRole('tab', { name: /récupérées/i }));

    expect(screen.getByText('Récupérée')).toBeTruthy();
  });

  test('sorts reservations by descending reservation date', () => {
    const mockRes = [
      {
        reservationId: 1,
        reservationDate: '2024-01-01',
        recoveryDate: '2024-01-02',
        state: 'CANCELED',
        totalPrice: 10,
        customerEmail: 'jane.doe@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'Jane',
      },
      {
        reservationId: 2,
        reservationDate: '2024-04-20',
        recoveryDate: '2024-04-21',
        state: 'CANCELED',
        totalPrice: 20,
        customerEmail: 'jane.doe@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'Jane',
      },
    ];

    renderPage({ reservations: mockRes });

    fireEvent.click(screen.getByRole('tab', { name: /annulées/i }));

    const reservations = screen.getAllByText(/Réservation n°/);
    expect(reservations[0]).toHaveTextContent('Réservation n°2');
    expect(reservations[1]).toHaveTextContent('Réservation n°1');
  });

  test('displays an error if cancellation fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockRes = [
      {
        reservationId: 1,
        reservationDate: '2099-04-20',
        recoveryDate: '2099-04-22',
        state: 'RESERVED',
        totalPrice: 15,
        customerEmail: 'jane.doe@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'Jane',
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    renderPage({ reservations: mockRes });
    fireEvent.click(screen.getByText('Annuler'));
    fireEvent.click(screen.getByText('Confirmer'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  test('handles reservation without recoveryDate', () => {
    const mockRes = [
      {
        reservationId: 4,
        reservationDate: '2024-05-01',
        recoveryDate: ' ',
        state: 'CANCELED',
        totalPrice: 12,
        customerEmail: 'jane.doe@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'Jane',
      },
    ];

    renderPage({ reservations: mockRes });
    fireEvent.click(screen.getByRole('tab', { name: /annulées/i }));

    expect(screen.getByText('Réservation n°4')).toBeInTheDocument();
  });

  test('does not display subtitle when no reservation matches current tab', () => {
    const mockRes = [
      {
        reservationId: 5,
        reservationDate: '2024-01-01',
        recoveryDate: '2024-01-02',
        state: 'RETRIEVED',
        totalPrice: 50,
        customerEmail: 'jane.doe@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'Jane',
      },
    ];

    renderPage({ reservations: mockRes });
    fireEvent.click(screen.getByRole('tab', { name: /annulées/i }));

    expect(screen.queryByText('Réservation n°5')).not.toBeInTheDocument();
  });

  test('fetches reservations even if token is undefined', async () => {
    renderPage({ reservations: [], token: undefined });
    await waitFor(() => {
      expect(mockFetchMyReservations).toHaveBeenCalled();
    });
  });

  test('returns null when no reservation is displayed in selected tab', () => {
    const mockRes = [
      {
        reservationId: 10,
        reservationDate: '2024-01-01',
        recoveryDate: '2024-01-02',
        state: 'RETRIEVED',
        totalPrice: 50,
        customerEmail: 'jane.doe@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'Jane',
      },
    ];

    renderPage({ reservations: mockRes });

    fireEvent.click(screen.getByRole('tab', { name: /annulées/i }));

    expect(screen.queryByText(/Réservation/)).not.toBeInTheDocument();
  });

  test('cancelReservation uses empty string if token is undefined', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }),
    );

    const mockUserContextValue = {
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

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <MyReservationsContext.Provider
            value={{
              reservations: [
                {
                  reservationId: 1,
                  reservationDate: '2099-04-20',
                  recoveryDate: '2099-04-22',
                  state: 'RESERVED',
                  totalPrice: 15,
                  customerEmail: 'jane.doe@example.com',
                  customerLastname: 'Doe',
                  customerFirstname: 'Jane',
                },
              ],
              fetchMyReservations: mockFetchMyReservations,
            }}
          >
            <ReservationHistoryPage />
          </MyReservationsContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Annuler'));
    fireEvent.click(screen.getByText('Confirmer'));

    await waitFor(() => {
      expect(mockFetchMyReservations).toHaveBeenCalled();
    });
  });

  test('displays nothing for unknown reservation state', () => {
    const mockRes = [
      {
        reservationId: 999,
        reservationDate: '2024-01-01',
        recoveryDate: '2024-01-02',
        state: 'PENDING',
        totalPrice: 42,
        customerEmail: 'jane.doe@example.com',
        customerLastname: 'Doe',
        customerFirstname: 'Jane',
      },
    ];

    renderPage({ reservations: mockRes });

    expect(screen.queryByText('Réservation n°999')).not.toBeTruthy();
    expect(screen.queryByText('Récupérée')).not.toBeTruthy();
    expect(screen.queryByText('Annulée')).not.toBeTruthy();
    expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeTruthy();
  });
});
