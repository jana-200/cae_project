import { renderHook, act } from '@testing-library/react';
import { describe, test, beforeEach, expect, vi } from 'vitest';
import {
  MyReservationsProvider,
  MyReservationsContext,
} from './MyReservationsContext';
import { UserContext } from './UserContext';
import { MemoryRouter } from 'react-router-dom';
import { UserContextType } from '../types';
import React from 'react';

const mockReservations = [
  {
    reservationId: 1,
    reservationDate: '2025-04-20',
    recoveryDate: '2025-04-23',
    state: 'PENDING',
    totalPrice: 25.5,
  },
  {
    reservationId: 2,
    reservationDate: '2025-04-21',
    recoveryDate: '2025-04-25',
    state: 'ACCEPTED',
    totalPrice: 30.0,
  },
];

const mockUserContext: UserContextType = {
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

const renderWithContext = (overrides: Partial<UserContextType>) => {
  return renderHook(() => React.useContext(MyReservationsContext), {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <UserContext.Provider value={{ ...mockUserContext, ...overrides }}>
          <MyReservationsProvider>{children}</MyReservationsProvider>
        </UserContext.Provider>
      </MemoryRouter>
    ),
  });
};

describe('MyReservationsContext', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = fetchMock;
  });

  test('fetches and stores reservations when user is authenticated', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservations,
    });

    const { result } = renderWithContext({
      authenticatedUser: { email: 'user@test.com', token: 'abc' },
    });

    await act(async () => {
      await result.current.fetchMyReservations();
    });

    expect(result.current.reservations).toEqual(mockReservations);
  });

  test('logs error when user is not authenticated', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderWithContext({ authenticatedUser: undefined });

    await act(async () => {
      await result.current.fetchMyReservations();
    });

    expect(errorSpy).toHaveBeenCalledWith(
      'MyReservationsContext::fetchMyReservations::error',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });

  test('logs error when user has no token', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderWithContext({
      authenticatedUser: { email: 'user@test.com', token: '' },
    });

    await act(async () => {
      await result.current.fetchMyReservations();
    });

    expect(errorSpy).toHaveBeenCalledWith(
      'MyReservationsContext::fetchMyReservations::error',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });

  test('logs error when fetch fails with non-ok response', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderWithContext({
      authenticatedUser: { email: 'user@test.com', token: 'abc' },
    });

    await act(async () => {
      await result.current.fetchMyReservations();
    });

    expect(errorSpy).toHaveBeenCalledWith(
      'MyReservationsContext::fetchMyReservations::error',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });

  test('logs error when fetch throws (network error)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network failed'));

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderWithContext({
      authenticatedUser: { email: 'user@test.com', token: 'abc' },
    });

    await act(async () => {
      await result.current.fetchMyReservations();
    });

    expect(errorSpy).toHaveBeenCalledWith(
      'MyReservationsContext::fetchMyReservations::error',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});
