import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  ReservationContextProvider,
  ReservationContext,
} from './ReservationContext';
import { UserContext } from './UserContext';
import type { UserContextType, AuthenticatedUser, ProductLot } from '../types';
import React from 'react';

vi.mock('../utils/storage', () => ({
  getReservationItems: () => [],
  storeReservationItems: vi.fn(),
  clearReservationItems: vi.fn(),
}));

const mockUser: AuthenticatedUser = {
  email: 'user@test.com',
  token: 'abc123',
};

const mockUserContext: UserContextType = {
  authenticatedUser: mockUser,
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

const fakeLot: ProductLot = {
  lotId: 1,
  productLabel: 'Pomme',
  productType: 'Fruit',
  imageUrl: '',
  producerEmail: 'prod@ex.com',
  unitPrice: 1,
  remainingQuantity: 10,
  availabilityDate: '2025-06-01',
  productUnit: 'kg',
  productDescription: 'Bonnes pommes',
  initialQuantity: 10,
  soldQuantity: 0,
  reservedQuantity: 0,
  productLotState: 'FOR_SALE',
  producerName: 'Jean',
};

const renderWithContext = () =>
  renderHook(() => React.useContext(ReservationContext), {
    wrapper: ({ children }) => (
      <UserContext.Provider value={mockUserContext}>
        <ReservationContextProvider>{children}</ReservationContextProvider>
      </UserContext.Provider>
    ),
  });

describe('ReservationContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test('addToReservation adds a product', () => {
    const { result } = renderWithContext();

    act(() => {
      result.current.addToReservation(fakeLot, 2);
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  test('clearReservation empties the cart', () => {
    const { result } = renderWithContext();

    act(() => {
      result.current.addToReservation(fakeLot, 2);
      result.current.clearReservation();
    });

    expect(result.current.items.length).toBe(0);
  });

  test('submitReservation makes an API  call', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchSpy);

    const { result } = renderWithContext();

    act(() => {
      result.current.addToReservation(fakeLot, 2);
    });

    await act(async () => {
      const success = await result.current.submitReservation(
        '2025-06-15',
        mockUser,
      );
      expect(success).toBe(true);
    });

    expect(fetchSpy).toHaveBeenCalled();
  });

  test('submitReservation returns false if not authenticated', async () => {
    const { result } = renderHook(() => React.useContext(ReservationContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider
          value={{ ...mockUserContext, authenticatedUser: undefined }}
        >
          <ReservationContextProvider>{children}</ReservationContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      const success = await result.current.submitReservation('2025-06-15', {
        email: '',
        token: '',
      });
      expect(success).toBe(false);
    });
  });

  test('submitReservation returns false is fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Erreur de réservation'),
      }),
    );

    const { result } = renderWithContext();

    act(() => {
      result.current.addToReservation(fakeLot, 1);
    });

    await act(async () => {
      const res = await result.current.submitReservation(
        '2025-06-15',
        mockUser,
      );
      expect(res).toBe(false);
    });
  });

  test('updateQuantity updates the quantity with a minimum of 1', () => {
    const { result } = renderWithContext();

    act(() => {
      result.current.addToReservation(fakeLot, 5);
      result.current.updateQuantity(fakeLot.lotId, 0);
    });

    expect(result.current.items[0].quantity).toBe(1);
  });

  test('removeFromReservation removes the product', () => {
    const { result } = renderWithContext();

    act(() => {
      result.current.addToReservation(fakeLot, 3);
      result.current.removeFromReservation(fakeLot.lotId);
    });

    expect(result.current.items).toHaveLength(0);
  });

  test('fetchAllReservations returns reservations', async () => {
    const mockReservations = [
      {
        reservationId: 1,
        userEmail: 'user@test.com',
        recoveryDate: '2025-06-15',
        reservedProducts: [],
        state: 'PENDING',
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockReservations),
      }),
    );

    const { result } = renderWithContext();

    const res = await result.current.fetchAllReservations();
    expect(res).toEqual(mockReservations);
  });

  test('fetchAllReservations returns an error if not authenticated', async () => {
    const { result } = renderHook(() => React.useContext(ReservationContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider
          value={{ ...mockUserContext, authenticatedUser: undefined }}
        >
          <ReservationContextProvider>{children}</ReservationContextProvider>
        </UserContext.Provider>
      ),
    });

    await expect(result.current.fetchAllReservations()).rejects.toThrow(
      'Utilisateur non authentifié',
    );
  });

  test('updateReservationState is working correctly', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchSpy);

    const { result } = renderWithContext();

    await act(async () => {
      await result.current.updateReservationState(1, 'ACCEPTED');
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/reservations/1/state?newState=ACCEPTED',
      expect.objectContaining({
        method: 'PATCH',
      }),
    );
  });

  test('updateReservationState handles backend errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Erreur serveur'),
      }),
    );

    const { result } = renderWithContext();

    await expect(
      result.current.updateReservationState(2, 'REJECTED'),
    ).rejects.toThrow('Erreur serveur');
  });

  test('updateReservationState handles network errors', async () => {
    const error = new Error('Network Error');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderWithContext();

    await expect(
      result.current.updateReservationState(3, 'CANCELLED'),
    ).rejects.toThrow('Network Error');

    expect(errorSpy).toHaveBeenCalledWith(
      'Erreur lors de la mise à jour de la réservation :',
      error,
    );

    errorSpy.mockRestore();
  });

  test('addToReservation increments the quantity if the product already exists', () => {
    const { result } = renderWithContext();

    act(() => {
      result.current.addToReservation(fakeLot, 1);
      result.current.addToReservation(fakeLot, 2);
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].quantity).toBe(3);
  });

  test('updateQuantity returns item if lotId does not match', () => {
    const { result } = renderWithContext();

    act(() => {
      result.current.addToReservation(fakeLot, 2);
      result.current.updateQuantity(999, 5);
    });

    expect(result.current.items[0].quantity).toBe(2);
  });

  test('fetchAllReservations throws an error if token is missing', async () => {
    const { result } = renderHook(() => React.useContext(ReservationContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider
          value={{ authenticatedUser: undefined } as UserContextType}
        >
          <ReservationContextProvider>{children}</ReservationContextProvider>
        </UserContext.Provider>
      ),
    });

    await expect(result.current.fetchAllReservations()).rejects.toThrow(
      'Utilisateur non authentifié',
    );
  });

  test('fetchAllReservations handles backend errors correctly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Erreur serveur'),
      }),
    );

    const { result } = renderWithContext();

    await expect(result.current.fetchAllReservations()).rejects.toThrow(
      'Erreur serveur',
    );
  });

  test('updateReservationState throw if not authenticated', async () => {
    const { result } = renderHook(() => React.useContext(ReservationContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider
          value={{ authenticatedUser: undefined } as UserContextType}
        >
          <ReservationContextProvider>{children}</ReservationContextProvider>
        </UserContext.Provider>
      ),
    });

    await expect(
      result.current.updateReservationState(1, 'ACCEPTED'),
    ).rejects.toThrow('Utilisateur non authentifié');
  });
});
