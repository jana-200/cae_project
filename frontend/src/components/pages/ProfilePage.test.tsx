import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ProfilePage from './ProfilePage';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType, UserDetails } from '../../types';
import '@testing-library/jest-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockUserDetails: UserDetails = {
  id: 1,
  firstname: 'Jean',
  lastname: 'Dupont',
  email: 'jean@test.com',
  phoneNumber: '0488123456',
  title: 'Mr',
  role: 'CUSTOMER',
  address: {
    street: 'Rue de la Loi',
    number: '16',
    poBox: '',
    postalCode: '1000',
    city: 'Bruxelles',
    country: 'Belgique',
  },
  deactivated: false,
};

describe('ProfilePage', () => {
  const fetchUserDetailsMock = vi.fn();
  const changePasswordMock = vi.fn();

  const mockContext: UserContextType = {
    authenticatedUser: { email: 'jean@test.com', token: '123' },
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    checkUserAuthentication: vi.fn(),
    isTokenExpired: false,
    changePassword: changePasswordMock,
    fetchUserDetails: fetchUserDetailsMock,
    isVolunteer: false,
    fetchIsDeactivated: vi.fn(),
  };

  beforeEach(() => {
    fetchUserDetailsMock.mockResolvedValue(mockUserDetails);
  });

  test('displays the loader if user data is not loaded', async () => {
    const contextWithDelay = {
      ...mockContext,
      fetchUserDetails: vi.fn().mockImplementation(() => new Promise(() => {})),
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={contextWithDelay}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays profile information after loading', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContext}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(fetchUserDetailsMock).toHaveBeenCalled();
      expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument();
      expect(screen.getByDisplayValue('jean@test.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0488123456')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Rue de la Loi')).toBeInTheDocument();
    });
  });

  test('opens and closes the password change modal', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContext}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Modifier mon mot de passe/i }),
    );
    expect(
      screen.getByText(/Modifier votre mot de passe/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    await waitFor(() => {
      expect(
        screen.queryByText(/Modifier le mot de passe/i),
      ).not.toBeInTheDocument();
    });
  });

  test('displays errors if fields are invalid', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContext}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Modifier mon mot de passe/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    expect(
      await screen.findByText(/Veuillez entrer votre mot de passe actuel/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Veuillez entrer un nouveau mot de passe/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Veuillez confirmer votre nouveau mot de passe/i),
    ).toBeInTheDocument();
  });

  test('displays an error if the passwords do not match', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContext}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Modifier mon mot de passe/i }),
    );

    fireEvent.change(screen.getByLabelText(/Mot de passe actuel/i), {
      target: { value: 'oldPass123!' },
    });
    fireEvent.change(screen.getAllByLabelText(/Nouveau mot de passe/i)[0], {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(
      screen.getByLabelText(/Confirmer le nouveau mot de passe/i),
      {
        target: { value: 'DifferentPass!' },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    expect(
      await screen.findByText(/Les mots de passe ne correspondent pas/i),
    ).toBeInTheDocument();
  });

  test('successfully completes the password change', async () => {
    changePasswordMock.mockResolvedValueOnce(undefined);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContext}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Modifier mon mot de passe/i }),
    );

    fireEvent.change(screen.getByLabelText(/Mot de passe actuel/i), {
      target: { value: 'oldPass123!' },
    });
    fireEvent.change(screen.getAllByLabelText(/Nouveau mot de passe/i)[0], {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(
      screen.getByLabelText(/Confirmer le nouveau mot de passe/i),
      {
        target: { value: 'NewPass123!' },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledWith(
        'oldPass123!',
        'NewPass123!',
      );
      expect(window.alert).toHaveBeenCalledWith(
        'Mot de passe modifié avec succès.',
      );
    });
  });

  test('displays an error if the current password is incorrect', async () => {
    changePasswordMock.mockRejectedValueOnce(
      new Error('Mot de passe invalide'),
    );

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContext}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Modifier mon mot de passe/i }),
    );

    fireEvent.change(screen.getByLabelText(/Mot de passe actuel/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.change(screen.getAllByLabelText(/Nouveau mot de passe/i)[0], {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(
      screen.getByLabelText(/Confirmer le nouveau mot de passe/i),
      {
        target: { value: 'NewPass123!' },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalled();
      expect(
        screen.getByText(/mot de passe actuel est incorrect/i),
      ).toBeInTheDocument();
    });
  });

  test('logs an error if fetchUserDetails throws', async () => {
    const error = new Error('fetch failed');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const contextWithError = {
      ...mockContext,
      fetchUserDetails: vi.fn().mockRejectedValue(error),
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={contextWithError}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith('Erreur:', error);
    });
  });

  test('shows error if new password is too weak', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContext}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Modifier mon mot de passe/i }),
    );

    fireEvent.change(screen.getByLabelText(/Mot de passe actuel/i), {
      target: { value: 'oldPass123!' },
    });
    fireEvent.change(screen.getAllByLabelText(/Nouveau mot de passe/i)[0], {
      target: { value: 'abc' },
    });
    fireEvent.change(
      screen.getByLabelText(/Confirmer le nouveau mot de passe/i),
      {
        target: { value: 'abc' },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    expect(
      await screen.findByText(
        /Le mot de passe doit contenir au minimum 6 caractères/i,
      ),
    ).toBeInTheDocument();
  });

  test('submits the form using form submit event', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContext}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jean')).toBeTruthy();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Modifier mon mot de passe/i }),
    );

    fireEvent.change(screen.getByLabelText(/Mot de passe actuel/i), {
      target: { value: 'oldPass123!' },
    });
    fireEvent.change(screen.getAllByLabelText(/Nouveau mot de passe/i)[0], {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(
      screen.getByLabelText(/Confirmer le nouveau mot de passe/i),
      {
        target: { value: 'NewPass123!' },
      },
    );

    fireEvent.submit(screen.getByTestId('change-password-form'));
  });
});
