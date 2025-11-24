import { render, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, vi, beforeEach, expect } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { UserContext } from '../contexts/UserContext';
import { UserContextType } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUser = {
  email: 'test@test.com',
  token: 'abc',
};

const renderWithContext = (
  context: Partial<UserContextType>,
  children: React.ReactNode,
  routeProps: React.ComponentProps<typeof ProtectedRoute> = {},
) => {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={context as UserContextType}>
        <ProtectedRoute {...routeProps}>{children}</ProtectedRoute>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('display children without auth required', () => {
    renderWithContext(
      { authenticatedUser: undefined, fetchUserDetails: vi.fn() },
      <div>Public</div>,
    );
    expect(screen.getByText('Public')).toBeTruthy();
  });

  test('redirect to /login if auth requireed without user', () => {
    renderWithContext(
      { authenticatedUser: undefined, fetchUserDetails: vi.fn() },
      <div>Privé</div>,
      {
        requiresAuth: true,
      },
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  test('calls fetchUserDetails if user logged in ', async () => {
    const fetchUserDetails = vi
      .fn()
      .mockResolvedValue({ role: 'CUSTOMER', email: 'test@test.com' });

    renderWithContext(
      { authenticatedUser: mockUser, fetchUserDetails },
      <div>Privé</div>,
    );
    await waitFor(() => expect(fetchUserDetails).toHaveBeenCalled());
  });

  test('redirect to /if redirectIfAuthenticated is true', async () => {
    const fetchUserDetails = vi
      .fn()
      .mockResolvedValue({ role: 'CUSTOMER', email: 'test@test.com' });

    renderWithContext(
      { authenticatedUser: mockUser, fetchUserDetails },
      <div>Privé</div>,
      { redirectIfAuthenticated: true },
    );

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }),
    );
  });

  test('redirect if role is forbidden', async () => {
    const fetchUserDetails = vi
      .fn()
      .mockResolvedValue({ role: 'MANAGER', email: 'test@test.com' });

    renderWithContext(
      { authenticatedUser: mockUser, fetchUserDetails },
      <div>Accès refusé</div>,
      { allowedRoles: ['CUSTOMER'] },
    );

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }),
    );
  });

  test('redirect if volunteer is forbidden', async () => {
    const fetchUserDetails = vi.fn().mockResolvedValue({
      role: 'CUSTOMER',
      email: 'volunteer@terroircie.be',
    });

    renderWithContext(
      { authenticatedUser: mockUser, fetchUserDetails },
      <div>Benevole</div>,
      { disallowVolunteer: true },
    );

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }),
    );
  });

  test('show children if everything is OK ', async () => {
    const fetchUserDetails = vi
      .fn()
      .mockResolvedValue({ role: 'CUSTOMER', email: 'client@test.com' });

    renderWithContext(
      { authenticatedUser: mockUser, fetchUserDetails },
      <div>Accès autorisé</div>,
      { allowedRoles: ['CUSTOMER'] },
    );

    await waitFor(() =>
      expect(screen.getByText('Accès autorisé')).toBeTruthy(),
    );
  });

  test('do not redirect if no redirect criteria', async () => {
    const fetchUserDetails = vi
      .fn()
      .mockResolvedValue({ role: 'CUSTOMER', email: 'client@test.com' });

    renderWithContext(
      { authenticatedUser: mockUser, fetchUserDetails },
      <div>Page</div>,
    );

    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
    expect(screen.getByText('Page')).toBeTruthy();
  });

  test('log the error if fetchUserDetails ', async () => {
    const error = new Error('fail');
    const fetchUserDetails = vi.fn().mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithContext(
      { authenticatedUser: mockUser, fetchUserDetails },
      <div>Erreur</div>,
    );

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        'Error fetching user details:',
        error,
      ),
    );

    errorSpy.mockRestore();
  });
});
