import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationManagementPage from './ReservationManagementPage';
import { ReservationContext } from '../../contexts/ReservationContext';
import { UserContext } from '../../contexts/UserContext';
import { describe, expect, test, vi } from 'vitest';
import {
  ReservationContextType,
  UserContextType,
  ReservationInfo,
} from '../../types';
import { MemoryRouter } from 'react-router-dom';

const mockUser: UserContextType = {
  authenticatedUser: { email: 'admin@example.com', token: 'fake-token' },
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

const mockReservations: ReservationInfo[] = [
  {
    reservationId: 1,
    reservationDate: new Date().toISOString(),
    recoveryDate: new Date().toISOString(),
    state: 'RESERVED',
    totalPrice: 25.5,
    customerEmail: 'a@example.com',
    customerFirstname: 'Alice',
    customerLastname: 'Smith',
  },
];

const mockReservationContext: Partial<ReservationContextType> = {
  fetchAllReservations: vi.fn().mockResolvedValue(mockReservations),
};

describe('ReservationManagementPage', () => {
  test('shows loading', async () => {
    const slowFetch = vi.fn(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUser}>
          <ReservationContext.Provider
            value={
              {
                ...mockReservationContext,
                fetchAllReservations: slowFetch,
              } as ReservationContextType
            }
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/chargement des réservations/i),
    ).toBeInTheDocument();
  });

  test('displays reservations correctly', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUser}>
          <ReservationContext.Provider
            value={mockReservationContext as ReservationContextType}
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
        ,
      </MemoryRouter>,
    );

    expect(await screen.findByText(/réservation n°1/i)).toBeInTheDocument();

    const matchingNodes = screen.getAllByText(
      (_, node) =>
        !!node?.textContent?.replace(/\s+/g, ' ').includes('Smith Alice'),
    );
    expect(matchingNodes.length).toBeGreaterThan(0);

    expect(screen.getByText(/25\.50\s?€/)).toBeInTheDocument();
  });

  test('updates the reservation to retrieved', async () => {
    const updateMock = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUser}>
          <ReservationContext.Provider
            value={
              {
                ...mockReservationContext,
                updateReservationState: updateMock,
              } as ReservationContextType
            }
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const button = await screen.findByRole('button', { name: /récupérée/i });
    await userEvent.click(button);
    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(1, 'RETRIEVED');
    });
  });

  test('displays an error if the recovery fails', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUser}>
          <ReservationContext.Provider
            value={
              {
                ...mockReservationContext,
                fetchAllReservations: vi
                  .fn()
                  .mockRejectedValue(new Error('fail')),
              } as ReservationContextType
            }
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/erreur lors de la récupération/i),
    ).toBeInTheDocument();
  });

  test('displays a message if no reservation found', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUser}>
          <ReservationContext.Provider
            value={
              {
                ...mockReservationContext,
                fetchAllReservations: vi.fn().mockResolvedValue([]),
              } as ReservationContextType
            }
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/aucune réservation trouvée/i),
    ).toBeInTheDocument();
  });

  test('updates the reservation to abandoned', async () => {
    const updateMock = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUser}>
          <ReservationContext.Provider
            value={
              {
                ...mockReservationContext,
                updateReservationState: updateMock,
              } as ReservationContextType
            }
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const button = await screen.findByRole('button', { name: /abandonnée/i });
    await userEvent.click(button);
    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(1, 'ABANDONED');
    });
  });

  test('do not launch fetch if not authenticated', () => {
    const fetchSpy = vi.fn();

    render(
      <MemoryRouter>
        <UserContext.Provider
          value={{ ...mockUser, authenticatedUser: undefined }}
        >
          <ReservationContext.Provider
            value={
              {
                fetchAllReservations: fetchSpy,
                updateReservationState: vi.fn(),
              } as unknown as ReservationContextType
            }
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('displays Abandoned and Recovered buttons for a pending reservation', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUser}>
          <ReservationContext.Provider
            value={
              {
                fetchAllReservations: vi
                  .fn()
                  .mockResolvedValue(mockReservations),
                updateReservationState: vi.fn(),
              } as unknown as ReservationContextType
            }
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('button', { name: /récupérée/i }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /abandonnée/i })).toBeTruthy();
  });

  test('sends a notification request with the correct content in case of recovery', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });
    const updateMock = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUser}>
          <ReservationContext.Provider
            value={
              {
                fetchAllReservations: vi
                  .fn()
                  .mockResolvedValue(mockReservations),
                updateReservationState: updateMock,
              } as unknown as ReservationContextType
            }
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const btn = await screen.findByRole('button', { name: /récupérée/i });
    await userEvent.click(btn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('réservation n°1'),
        }),
      );
    });
  });

  test('do not send notification if email is missing', async () => {
    const mockWithoutEmail = [{ ...mockReservations[0], customerEmail: '' }];
    const updateMock = vi.fn().mockResolvedValue(undefined);
    const notificationSpy = vi.spyOn(global, 'fetch');

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUser}>
          <ReservationContext.Provider
            value={
              {
                fetchAllReservations: vi
                  .fn()
                  .mockResolvedValue(mockWithoutEmail),
                updateReservationState: updateMock,
              } as unknown as ReservationContextType
            }
          >
            <ReservationManagementPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const btn = await screen.findByRole('button', { name: /récupérée/i });
    await userEvent.click(btn);
    await waitFor(() => {
      expect(notificationSpy).not.toHaveBeenCalledWith(
        '/api/notifications',
        expect.anything(),
      );
    });
  });
});
