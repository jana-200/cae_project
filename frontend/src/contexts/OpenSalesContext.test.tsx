import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { OpenSalesContext, OpenSalesProvider } from './OpenSalesContext';
import { UserContext } from './UserContext';
import type { UserContextType } from '../types';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

const mockUser = {
  email: 'test@user.com',
  token: 'fake-token',
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

const mockSale = {
  productLotId: 1,
  quantity: 5,
};

const renderWithProviders = (userContext: Partial<UserContextType> = {}) =>
  renderHook(() => React.useContext(OpenSalesContext), {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <UserContext.Provider value={{ ...mockUserContext, ...userContext }}>
          <OpenSalesProvider>{children}</OpenSalesProvider>
        </UserContext.Provider>
      </MemoryRouter>
    ),
  });

describe('OpenSalesContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test('createOpenSale calls API correctly when authenticated', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderWithProviders();

    act(() => {
      result.current.addToOpenSale(
        {
          lotId: mockSale.productLotId,
          productLabel: 'Produit test',
          productDescription: '',
          productUnit: 'kg',
          unitPrice: 10,
          remainingQuantity: 50,
          productType: '',
          imageUrl: '',
          producerEmail: '',
          availabilityDate: '',
          initialQuantity: 0,
          soldQuantity: 0,
          reservedQuantity: 0,
          productLotState: '',
          producerName: '',
        },
        mockSale.quantity,
      );
    });

    await act(async () => {
      await result.current.createOpenSale();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/open_sales/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: mockUser.token,
        }),
        body: expect.any(String),
      }),
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(body).toHaveProperty('reservedProducts');
    expect(Array.isArray(body.reservedProducts)).toBe(true);
    expect(body.reservedProducts[0]).toMatchObject({
      productLotId: mockSale.productLotId,
      quantity: mockSale.quantity,
    });
  });

  test('createOpenSale does nothing if user is not authenticated', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderWithProviders({ authenticatedUser: undefined });

    await act(async () => {
      await result.current.createOpenSale();
    });

    expect(fetchMock).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  test('createOpenSale logs error if response not ok', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    const { result } = renderWithProviders();

    act(() => {
      result.current.addToOpenSale(
        {
          lotId: mockSale.productLotId,
          productLabel: 'Produit test',
          productDescription: '',
          productUnit: 'kg',
          unitPrice: 10,
          remainingQuantity: 50,
          productType: '',
          imageUrl: '',
          producerEmail: '',
          availabilityDate: '',
          initialQuantity: 0,
          soldQuantity: 0,
          reservedQuantity: 0,
          productLotState: '',
          producerName: '',
        },
        mockSale.quantity,
      );
    });

    await act(async () => {
      await result.current.createOpenSale();
    });

    expect(errorSpy).toHaveBeenCalledWith(
      'OpenSalesCreation Error',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });

  test('OpenSalesProvider renders children', () => {
    const text = 'visible';
    renderHook(() => React.useContext(OpenSalesContext), {
      wrapper: ({ children }) => (
        <UserContext.Provider value={mockUserContext}>
          <OpenSalesProvider>
            <>
              {children}
              <p data-testid="child">{text}</p>
            </>
          </OpenSalesProvider>
        </UserContext.Provider>
      ),
    });

    expect(document.querySelector('[data-testid="child"]')?.textContent).toBe(
      text,
    );
  });
});
