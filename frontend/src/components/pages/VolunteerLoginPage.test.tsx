import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import VolunteerLoginPage from '../../components/pages/VolunteerLoginPage';
import { UserContext } from '../../contexts/UserContext';

describe('VolunteerLoginPage', () => {
  const loginUserMock = vi.fn();

  const mockContextValue = {
    authenticatedUser: undefined,
    userDetails: null,
    registerUser: vi.fn(),
    loginUser: loginUserMock,
    clearUser: vi.fn(),
    checkUserAuthentication: vi.fn(),
    isTokenExpired: false,
    isRegistered: false,
    setIsRegistered: vi.fn(),
    changePassword: vi.fn(),
    fetchUserDetails: vi.fn(),
    isVolunteer: true,
    fetchIsDeactivated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders login form with disabled email field', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <VolunteerLoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    expect(emailInput.value).toBe('volunteer@terroircie.be');
  });

  test('shows error when password is invalid', async () => {
    loginUserMock.mockRejectedValueOnce(new Error('401'));

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <VolunteerLoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(loginUserMock).toHaveBeenCalledWith(
        {
          email: 'volunteer@terroircie.be',
          password: 'wrongpass',
        },
        true,
      );
    });
  });

  test('logs in successfully and shows success message', async () => {
    loginUserMock.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <VolunteerLoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    fireEvent.change(passwordInput, { target: { value: 'GoodPass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
    await waitFor(() => {
      expect(screen.getByText(/Connexion réussie/i)).toBeTruthy();
    });
  });
});
