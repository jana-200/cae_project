import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import LoginPage from '../../components/pages/LoginPage';
import { UserContext } from '../../contexts/UserContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({
      pathname: '/login',
      state: {},
      key: 'default',
      search: '',
      hash: '',
    })),
  };
});

describe('LoginPage', () => {
  const loginUserMock = vi.fn();
  const navigateMock = vi.fn();
  const mockContextValue = {
    authenticatedUser: undefined,
    userDetails: null,
    registerUser: vi.fn(),
    loginUser: loginUserMock,
    clearUser: vi.fn(),
    checkUserAuthentication: vi.fn(),
    isTokenExpired: false,
    changePassword: vi.fn(),
    fetchUserDetails: vi.fn(),
    isVolunteer: false,
    fetchIsDeactivated: vi.fn(),
  };

  vi.mocked(useNavigate).mockReturnValue(navigateMock);

  test('renders all form fields', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeTruthy();
    expect(screen.getByLabelText(/Se souvenir de moi/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeTruthy();
  });

  test('prevents form submission if fields are empty', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  test('calls loginUser and redirects on success', async () => {
    const fetchUserDetailsMock = vi.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      firstname: 'Test',
      lastname: 'User',
      title: 'M.',
      phoneNumber: '123456789',
      address: {
        street: 'Rue test',
        postalCode: '1000',
        city: 'Bruxelles',
      },
      role: 'CUSTOMER',
    });

    const contextWithAuth = {
      ...mockContextValue,
      authenticatedUser: {
        token: 'fake-token',
        email: 'test@example.com',
      },
      fetchUserDetails: fetchUserDetailsMock,
    };
    render(
      <MemoryRouter>
        <UserContext.Provider value={contextWithAuth}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(loginUserMock).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        false,
      );
    });

    await waitFor(() => {
      expect(fetchUserDetailsMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  test('calls loginUser with "Remember me" checked', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByLabelText(/Se souvenir de moi/i));
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(loginUserMock).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        true,
      );
    });
  });

  test('displays an error if loginUser fails', async () => {
    loginUserMock.mockRejectedValueOnce(new Error('Échec de connexion'));

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeTruthy();
    });
  });

  test('retains "Remember me" value after toggling', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const checkbox = screen.getByLabelText(/Se souvenir de moi/i);

    expect((checkbox as HTMLInputElement).checked).toBe(false);
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  test('displays error message for incorrect credentials', async () => {
    loginUserMock.mockRejectedValueOnce(new Error('Identifiants incorrects'));

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeTruthy();
    });
  });

  test('displays an error message if email or password is empty', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
  });

  test('shows success message when justRegistered is true in location.state', async () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/login',
      state: { justRegistered: true },
      key: 'test',
      search: '',
      hash: '',
    });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Inscription réussie !/i)).toBeTruthy();

      expect(
        screen.getByText(/vous pouvez maintenant vous connecter/i),
      ).toBeTruthy();

      expect(navigateMock).toHaveBeenCalledWith('/login', {
        replace: true,
        state: {},
      });
    });
  });

  test('displays error if account is deactivated', async () => {
    const fetchIsDeactivatedMock = vi.fn().mockResolvedValueOnce(true);

    render(
      <MemoryRouter>
        <UserContext.Provider
          value={{
            ...mockContextValue,
            fetchIsDeactivated: fetchIsDeactivatedMock,
          }}
        >
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'disabled@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Votre compte a été désactivé. Veuillez contacter l'administrateur./i,
        ),
      ).toBeTruthy();
    });
  });

  test('redirects to /my-lots if role is PRODUCER', async () => {
    const contextWithAuth = {
      ...mockContextValue,
      authenticatedUser: {
        token: 'fake-token',
        email: 'producer@example.com',
      },
      fetchUserDetails: vi.fn().mockResolvedValue({ role: 'PRODUCER' }),
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={contextWithAuth}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/my-lots');
    });
  });

  test('redirects to /proposed-lots if role is MANAGER', async () => {
    const contextWithAuth = {
      ...mockContextValue,
      authenticatedUser: {
        token: 'fake-token',
        email: 'manager@example.com',
      },
      fetchUserDetails: vi.fn().mockResolvedValue({ role: 'MANAGER' }),
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={contextWithAuth}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/proposed-lots');
    });
  });
});
