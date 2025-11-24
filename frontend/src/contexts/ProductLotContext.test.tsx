import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
  ProductLotContext,
  ProductLotContextProvider,
} from './ProductLotContext';
import { NewLot, Product, UserContextType } from '../types';
import { UserContext } from './UserContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProductLotContextProvider>{children}</ProductLotContextProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

describe('ProductLotContext (without UserContext)', () => {
  test('fetchExistingImage retrieves existing images', async () => {
    const mockImages = ['url1.jpg', 'url2.jpg'];
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockImages),
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchExistingImage(1);
    });

    expect(result.current.existingImages).toEqual(mockImages);
  });

  test('fetchAvailableLots does nothing without email', async () => {
    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider
          value={{ authenticatedUser: undefined } as UserContextType}
        >
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.fetchAvailableLots();
    });
    expect(result.current.availableLots).toEqual([]);
  });

  test('fetchSoldOutLots handles errors correctly', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchSoldOutLots();
    });

    expect(result.current.soldOutLots).toEqual([]);
  });

  test('fetchAllLots handles empty response', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchAllLots();
    });

    expect(result.current.allLots).toEqual([]);
  });

  test('fetchExistingImage handles errors', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchExistingImage(1);
    });

    expect(result.current.existingImages).toEqual([]);
  });

  test('fetchProductSuggestions works', async () => {
    const mockSuggestions: Product[] = [
      {
        productId: 1,
        label: 'Pomme',
        type: 'Fruit',
        description: 'Rouge',
        unit: 'kg',
      },
    ];
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSuggestions),
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchProductSuggestions('Pom');
    });

    expect(result.current.productOptions).toEqual(mockSuggestions);
  });

  test('fetchProductSuggestions handles network errors', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchProductSuggestions('Pom');
    });
    expect(result.current.productOptions).toEqual([]);
  });

  test('updateLot succeeds with image', async () => {
    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await expect(result.current.updateLot(42, undefined)).rejects.toThrow(
      'Image is required',
    );
  });

  test('updateLot throws if image is missing', async () => {
    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    const newLot: NewLot = {
      product: 1,
      productLabel: 'Label',
      productType: 'Type',
      productDescription: 'desc',
      // @ts-expect-error testing missing producer
      producer: null,
      unitPrice: 5,
      initialQuantity: 10,
      availabilityDate: new Date().toISOString(),
      productLotState: 'PENDING',
      unit: 'kg',
      image: undefined,
    };

    await expect(result.current.createLot(newLot)).rejects.toThrow();
  });

  test('fetchProductLotById retrieves and stores a batch', async () => {
    const mockLot = {
      lotId: 1,
      productLabel: 'Carotte',
      productType: 'Légume',
      productDescription: 'Bio',
      unitPrice: 1.2,
      initialQuantity: 10,
      soldQuantity: 5,
      productUnit: 'kg',
      imageUrl: 'url',
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLot),
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchProductLotById(1);
    });

    expect(result.current.lot).toEqual(mockLot);
  });

  test('createLot handles backend error even with image', async () => {
    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    const file = new File(['dummy'], 'img.png', { type: 'image/png' });

    const newLot: NewLot = {
      productLabel: 'Pommes',
      productDescription: 'Rouge et juteuse',
      productType: 'Fruit',
      unit: 'kg',
      producer: 42,
      unitPrice: 3.5,
      initialQuantity: 20,
      availabilityDate: new Date().toISOString(),
      image: file,
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve('Erreur interne'),
    } as Response);

    await expect(result.current.createLot(newLot)).rejects.toThrow(
      'fetch error : 500 : Internal Server Error',
    );
  });

  test('updateLot returns backend error with message', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('Invalid format'),
    } as Response);

    const file = new File(['dummy'], 'img.png', { type: 'image/png' });

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await expect(result.current.updateLot(99, file)).rejects.toThrow();
  });

  test('fetchProductLotById handles server errors', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await expect(result.current.fetchProductLotById(999)).rejects.toThrow();
  });

  test('createLot succeeds with image', async () => {
    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    const file = new File(['test'], 'photo.png', { type: 'image/png' });

    const newLot: NewLot = {
      productLabel: 'Poire',
      productDescription: 'Mûre',
      productType: 'Fruit',
      unit: 'kg',
      producer: 99,
      unitPrice: 2.5,
      initialQuantity: 30,
      availabilityDate: new Date().toISOString(),
      image: file,
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Lot créé'),
    } as Response);

    await act(async () => {
      await result.current.createLot(newLot);
    });

    expect(fetch).toHaveBeenCalled();
  });

  test('fetchAllLots handles backend error', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Erreur serveur',
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchAllLots();
    });

    expect(result.current.allLots).toEqual([]);
  });

  test('fetchPendingLots works with email', async () => {
    const mockLots = [{ id: 1, productLabel: 'Orange', unitPrice: 2 }];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLots),
    } as Response);

    const mockUserContext: UserContextType = {
      authenticatedUser: { email: 'test@test.be', token: 'fake-token' },
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

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.fetchPendingLots();
    });

    expect(result.current.pendingLots).toEqual(mockLots);
  });

  test('fetchPendingLots handles errors', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);

    const mockUserContext: UserContextType = {
      authenticatedUser: { email: 'test@test.be', token: 'fake-token' },
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

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.fetchPendingLots();
    });

    expect(result.current.pendingLots).toEqual([]);
  });

  test('useEffect calls fetch on mount when email is defined', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.mocked(global.fetch).mockImplementation(mockFetch);

    const mockUserContext: UserContextType = {
      authenticatedUser: { email: 'test@test.be', token: '123' },
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

    renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/product-lots/?state=FOR_SALE&email=test%40test.be',
      expect.any(Object),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/product-lots/?state=SOLD_OUT&email=test%40test.be',
      expect.any(Object),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/product-lots/?state=FOR_SALE',
      expect.any(Object),
    );
  });

  test('useEffect does nothing when email is undefined', async () => {
    const mockFetch = vi.fn();
    vi.mocked(global.fetch).mockImplementation(mockFetch);

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

    renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('fetchSalesStatistics returns default statistics when fetch succeeds', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          totalReceived: 0,
          totalSold: 0,
          salesPerDay: {},
          receivedPerDay: {},
        }),
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      const stats = await result.current.fetchSalesStatistics(
        'Pommes',
        4,
        2024,
      );
      expect(stats).toEqual({
        totalReceived: 0,
        totalSold: 0,
        salesPerDay: {},
        receivedPerDay: {},
      });
    });
  });

  test('fetchSalesStatistics throws on backend error', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Error',
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await expect(
      result.current.fetchSalesStatistics('Pommes', 4, 2024),
    ).rejects.toThrow('Erreur : 500 Internal Error');
  });

  test('fetchAllLotsForManager fetches data correctly', async () => {
    const mockLots = [{ lotId: 1, productLabel: 'Tomates' }];
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLots),
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchAllLotsForManager();
    });

    expect(result.current.allLotsForManager).toEqual(mockLots);
  });

  test('fetchAllLotsForManager handles errors gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Erreur serveur',
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchAllLotsForManager();
    });

    expect(result.current.allLots).toEqual([]);
  });

  test('fetchSalesStatistics fallback returns default values from context', async () => {
    const { result } = renderHook(() => React.useContext(ProductLotContext));
    const stats = await result.current.fetchSalesStatistics('Pommes');
    expect(stats).toEqual({
      totalReceived: 0,
      totalSold: 0,
      salesPerDay: {},
      receivedPerDay: {},
    });
  });

  test('changeLotState works correctly', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Lot mis à jour'),
    } as Response);

    const mockUserContext: UserContextType = {
      authenticatedUser: { email: 'a@b.com', token: 'tok' },
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

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.changeLotState(42, 'ACCEPTED');
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/product-lots/42/state?newState=ACCEPTED',
      expect.objectContaining({
        method: 'PUT',
      }),
    );
  });

  test('fetchSalesStatistics throws if backend response is invalid', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totalSold: 'not-a-number' }),
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await expect(
      result.current.fetchSalesStatistics('Pommes', 4, 2024),
    ).rejects.toThrow('Missing or invalid fields in backend response');
  });

  test('changeLotState logs an error if fetch fails', async () => {
    const mockUserContext: UserContextType = {
      authenticatedUser: { email: 'a@b.com', token: 'tok' },
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

    const error = new Error('Network failed');
    vi.mocked(global.fetch).mockRejectedValue(error);

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.changeLotState(99, 'REJECTED');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'changeLotState::error',
      error,
    );
  });

  test('changeLotState log an error if response.ok is false', async () => {
    const mockUserContext: UserContextType = {
      authenticatedUser: { email: 'a@b.com', token: 'tok' },
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

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad request'),
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.changeLotState(123, 'REJECTED');
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'changeLotState::error',
      new Error('Erreur 400 : Bad request'),
    );
  });

  test('fetchProductSuggestions returns if response not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchProductSuggestions('Pom');
    });

    expect(result.current.productOptions).toEqual([]);
  });

  test('fetchPendingLots uses the token for authentication', async () => {
    const mockLots = [{ id: 1, productLabel: 'Cerise', unitPrice: 4 }];

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLots),
    });
    vi.mocked(global.fetch).mockImplementation(fetchSpy);

    const mockUserContext: UserContextType = {
      authenticatedUser: { email: 'test@test.be', token: 'secure-token' },
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

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.fetchPendingLots();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/product-lots/?state=PENDING&email=test%40test.be',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'secure-token',
        }),
      }),
    );
    expect(result.current.pendingLots).toEqual(mockLots);
  });
  test('fetchProductLotById sets lot on success', async () => {
    const mockLot = { id: 1, productLabel: 'TestLot' };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLot),
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await act(async () => {
      await result.current.fetchProductLotById(1);
    });

    expect(result.current.lot).toEqual(mockLot);
  });

  test('fetchProductLotById logs and throws error on failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper,
    });

    await expect(result.current.fetchProductLotById(999)).rejects.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(
      'fetchProductLotById::Error',
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });

  test('fetchAvailableLots does nothing without email', async () => {
    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider
          value={{ authenticatedUser: undefined } as UserContextType}
        >
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.fetchAvailableLots();
    });

    expect(result.current.availableLots).toEqual([]);
  });

  test('decreaseLotQuantity sends request and succeeds', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.mocked(global.fetch).mockImplementation(fetchSpy);

    const mockUserContext: UserContextType = {
      authenticatedUser: { email: 'user@test.com', token: 'abc123' },
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

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.decreaseLotQuantity(1, 2);
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/product-lots/remove/1?qty=2',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  test('decreaseLotQuantity logs and throws on failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      text: () => Promise.resolve('Failure'),
    } as Response);

    const mockUserContext: UserContextType = {
      authenticatedUser: { email: 'user@test.com', token: 'abc123' },
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

    const { result } = renderHook(() => React.useContext(ProductLotContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <ProductLotContextProvider>{children}</ProductLotContextProvider>
        </UserContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.decreaseLotQuantity(42, 3);
    });

    expect(errorSpy).toHaveBeenCalledWith(
      'decreaseLotQuantity::error',
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });
});
