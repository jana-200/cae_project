import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode, useContext } from 'react';
import { UserContextProvider, UserContext } from './UserContext';
import { ReservationContext } from './ReservationContext';

vi.mock('../utils/session', () => ({
  storeAuthenticatedUser: vi.fn(),
  clearAuthenticatedUser: vi.fn(),
  getAuthenticatedUser: vi.fn(() => undefined),
}));

describe('UserContext (hook-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  test('registerUser sends data to the backend', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', email: 'alice@example.com' }),
    });

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await act(async () => {
      await result.current.registerUser({
        firstname: 'Alice',
        lastname: 'Smith',
        title: 'Mme',
        phoneNumber: '+32470123456',
        email: 'alice@example.com',
        password: 'Password@123',
        role: 'CUSTOMER',
        address: {
          street: 'Rue Test',
          number: '10',
          poBox: '',
          postalCode: '1000',
          city: 'Bruxelles',
          country: 'Belgique',
        },
      });
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/auths/register',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  test('registerUser displays an error if the backend responds with an error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await act(async () => {
      await result.current
        .registerUser({
          firstname: 'Alice',
          lastname: 'Smith',
          title: 'Mme',
          phoneNumber: '+32470123456',
          email: 'alice@example.com',
          password: 'Password@123',
          role: 'CUSTOMER',
          address: {
            street: 'Rue Test',
            number: '10',
            poBox: '',
            postalCode: '1000',
            city: 'Bruxelles',
            country: 'Belgique',
          },
        })
        .catch(() => {});
    });

    expect(fetch).toHaveBeenCalled();
  });

  test('loginUser updates the user', async () => {
    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      token: 'abc123',
      role: 'user',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await act(async () => {
      await result.current.loginUser(
        {
          email: 'alice@example.com',
          password: 'Password@123',
        },
        true,
      );
    });

    expect(result.current.authenticatedUser?.email).toBe('alice@example.com');
  });

  test('loginUser displays an error if invalid credentials', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await act(async () => {
      await result.current
        .loginUser(
          {
            email: 'alice@example.com',
            password: 'wrong',
          },
          true,
        )
        .catch(() => {});
    });

    expect(fetch).toHaveBeenCalled();
  });

  test('clearUser clears the user', async () => {
    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      token: 'abc123',
      role: 'user',
    };

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUser) });

    await act(async () => {
      await result.current.loginUser(
        { email: 'alice@example.com', password: 'Password@123' },
        true,
      );
    });

    act(() => {
      result.current.clearUser();
    });

    expect(result.current.authenticatedUser).toBeFalsy();
  });

  test('useEffect retrieves a valid user and stores it', async () => {
    const { getAuthenticatedUser, storeAuthenticatedUser } = await import(
      '../utils/session'
    );

    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      token: 'abc123',
      role: 'user',
    };

    vi.mocked(getAuthenticatedUser).mockReturnValue(mockUser);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await waitFor(() => {
      expect(storeAuthenticatedUser).toHaveBeenCalledWith(mockUser, false);
    });
  });

  test('useEffect deletes the user if token is invalid', async () => {
    const { getAuthenticatedUser, clearAuthenticatedUser } = await import(
      '../utils/session'
    );

    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      token: 'invalid',
      role: 'user',
    };

    vi.mocked(getAuthenticatedUser).mockReturnValue(mockUser);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await waitFor(() => {
      expect(clearAuthenticatedUser).toHaveBeenCalled();
    });
  });

  test('registerUser handles network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await act(async () => {
      await result.current
        .registerUser({
          firstname: 'Alice',
          lastname: 'Smith',
          title: 'Mme',
          phoneNumber: '+32470123456',
          email: 'alice@example.com',
          password: 'Password@123',
          role: 'CUSTOMER',
          address: {
            street: 'Rue Test',
            number: '10',
            poBox: '',
            postalCode: '1000',
            city: 'Bruxelles',
            country: 'Belgique',
          },
        })
        .catch(() => {});
    });

    expect(fetch).toHaveBeenCalled();
  });

  test('loginUser handles network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await act(async () => {
      await result.current
        .loginUser(
          { email: 'alice@example.com', password: 'Password@123' },
          false,
        )
        .catch(() => {});
    });

    expect(fetch).toHaveBeenCalled();
  });

  test('All functions are covered', () => {
    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    expect(typeof result.current.registerUser).toBe('function');
    expect(typeof result.current.loginUser).toBe('function');
    expect(typeof result.current.clearUser).toBe('function');
    expect(typeof result.current.fetchUserDetails).toBe('function');
    expect(typeof result.current.changePassword).toBe('function');
    expect(typeof result.current.checkUserAuthentication).toBe('function');
  });

  test('fetchUserDetails retrieves user information', async () => {
    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      token: 'abc123',
      role: 'user',
    };

    const details = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      address: { city: 'Bruxelles' },
    };

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUser) });

    await act(async () => {
      await result.current.loginUser(
        { email: 'alice@example.com', password: 'Password@123' },
        true,
      );
    });

    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(details) });

    const res = await result.current.fetchUserDetails();
    expect(res).toEqual(details);
  });

  test('fetchUserDetails throw if not connected', async () => {
    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await expect(result.current.fetchUserDetails()).rejects.toThrow(
      'User not authenticated.',
    );
  });

  test('changePassword successful with logged in user', async () => {
    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      token: 'abc123',
      role: 'user',
    };

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUser) });

    await act(async () => {
      await result.current.loginUser(
        { email: 'alice@example.com', password: 'Password@123' },
        true,
      );
    });

    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    await act(async () => {
      await result.current.changePassword('oldPass', 'newPass');
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/auths/change-password',
      expect.anything(),
    );
  });

  test('changePassword throw if not connected', async () => {
    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await expect(result.current.changePassword('a', 'b')).rejects.toThrow(
      'User not authenticated.',
    );
  });

  test('changePassword throw if backend returns error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      token: 'abc123',
      role: 'user',
    };

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUser) });

    await act(async () => {
      await result.current.loginUser(
        { email: 'alice@example.com', password: 'Password@123' },
        true,
      );
    });

    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    await expect(result.current.changePassword('a', 'b')).rejects.toThrow(
      'Error while changing the password.',
    );

    consoleSpy.mockRestore();
  });

  test('checkUserAuthentication sets isVolunteer if mail matches', async () => {
    const { getAuthenticatedUser, storeAuthenticatedUser } = await import(
      '../utils/session'
    );

    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'volunteer@terroircie.be',
      token: 'abc123',
      role: 'user',
    };

    vi.mocked(getAuthenticatedUser).mockReturnValue(mockUser);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await waitFor(() => {
      expect(storeAuthenticatedUser).toHaveBeenCalledWith(mockUser, false);
      expect(result.current.isVolunteer).toBe(true);
    });
  });

  test('checkUserAuthentication returns undefined if no user in session', async () => {
    const { getAuthenticatedUser } = await import('../utils/session');
    vi.mocked(getAuthenticatedUser).mockReturnValue(undefined);

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await act(async () => {
      await result.current.checkUserAuthentication();
    });

    expect(result.current.authenticatedUser).toBeUndefined();
  });

  test('clearUser also calls clearReservation', async () => {
    const clearReservation = vi.fn();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ReservationContext.Provider
        value={{
          clearReservation,
          items: [],
          addToReservation: vi.fn(),
          removeFromReservation: vi.fn(),
          updateQuantity: vi.fn(),
          submitReservation: vi.fn(),
          fetchAllReservations: vi.fn(),
          updateReservationState: vi.fn(),
        }}
      >
        <UserContextProvider>{children}</UserContextProvider>
      </ReservationContext.Provider>
    );

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper,
    });

    act(() => {
      result.current.clearUser();
    });

    expect(clearReservation).toHaveBeenCalled();
  });

  test('loginUser stores user with rememberMe false', async () => {
    const mockUser = {
      email: 'alice@example.com',
      token: 'abc123',
    };

    const { storeAuthenticatedUser } = await import('../utils/session');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await act(async () => {
      await result.current.loginUser(
        { email: 'alice@example.com', password: 'Password@123' },
        false,
      );
    });

    expect(storeAuthenticatedUser).toHaveBeenCalledWith(mockUser, false);
  });

  test('checkUserAuthentication sets isTokenExpired true on error', async () => {
    const { getAuthenticatedUser } = await import('../utils/session');

    const mockUser = {
      email: 'alice@example.com',
      token: 'invalid',
    };

    vi.mocked(getAuthenticatedUser).mockReturnValue(mockUser);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await waitFor(() => {
      expect(result.current.isTokenExpired).toBe(true);
    });
  });

  test('checkUserAuthentication sets isVolunteer to false if mail is not Volunteer', async () => {
    const { getAuthenticatedUser } = await import('../utils/session');

    const mockUser = {
      email: 'alice@example.com',
      token: 'abc123',
    };

    vi.mocked(getAuthenticatedUser).mockReturnValue(mockUser);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await waitFor(() => {
      expect(result.current.isVolunteer).toBe(false);
    });
  });

  test('fetchUserDetails throws on non-OK response', async () => {
    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      token: 'abc123',
      role: 'user',
    };

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    await act(async () => {
      await result.current.loginUser(
        { email: 'alice@example.com', password: 'Password@123' },
        true,
      );
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(result.current.fetchUserDetails()).rejects.toThrow(
      'fetch error : 500 : Internal Server Error',
    );
  });

  test('fetchUserDetails logs and throws on fetch error', async () => {
    const mockUser = {
      id: '1',
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      token: 'abc123',
      role: 'user',
    };

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    await act(async () => {
      await result.current.loginUser(
        { email: 'alice@example.com', password: 'Password@123' },
        true,
      );
    });

    global.fetch = vi.fn().mockRejectedValue(new Error('network failed'));

    await expect(result.current.fetchUserDetails()).rejects.toThrow(
      'network failed',
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'fetchUserDetails::error:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  test('changePassword handles network error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockUser = {
      email: 'alice@example.com',
      token: 'abc123',
    };

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    await act(async () => {
      await result.current.loginUser(
        { email: 'alice@example.com', password: 'Password@123' },
        true,
      );
    });

    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

    await expect(
      result.current.changePassword('oldPass', 'newPass'),
    ).rejects.toThrow('Network failure');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('checkUserAuthentication sets token expiration flag on network failure', async () => {
    const { getAuthenticatedUser } = await import('../utils/session');

    const mockUser = {
      email: 'alice@example.com',
      token: 'abc123',
    };

    vi.mocked(getAuthenticatedUser).mockReturnValue(mockUser);

    global.fetch = vi.fn().mockRejectedValue(new Error('timeout'));

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await waitFor(() => {
      expect(result.current.isTokenExpired).toBe(true);
    });
  });

  test('loginUser throws error if fetch response lacks json method', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserContextProvider,
    });

    await expect(
      result.current.loginUser(
        { email: 'alice@example.com', password: 'Password@123' },
        true,
      ),
    ).rejects.toThrow();
  });
});
