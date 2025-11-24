import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import RegisterPage from '../../components/pages/RegisterPage';
import { UserContext } from '../../contexts/UserContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('RegisterPage', () => {
  const registerUserMock = vi.fn();
  const navigateMock = vi.fn();

  const mockContextValue = {
    authenticatedUser: undefined,
    registerUser: registerUserMock,
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    checkUserAuthentication: vi.fn(),
    isTokenExpired: false,
    isRegistered: false,
    setIsRegistered: vi.fn(),
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
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Civilité/i)).toBeTruthy();
    expect(screen.getAllByLabelText(/Nom/i)[0]).toBeTruthy();
    expect(screen.getByLabelText(/Prénom/i)).toBeTruthy();
    expect(screen.getByLabelText(/Rue/i)).toBeTruthy();
    expect(screen.getAllByLabelText(/Numéro/i)[0]).toBeTruthy();
    expect(screen.getByLabelText(/Boîte/i)).toBeTruthy();
    expect(screen.getByLabelText(/Code Postal/i)).toBeTruthy();
    expect(screen.getByLabelText(/Ville/i)).toBeTruthy();
    expect(screen.getByLabelText(/Pays/i)).toBeTruthy();
    expect(screen.getByLabelText(/Numéro de téléphone/i)).toBeTruthy();
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getAllByLabelText(/Mot de passe/i)[0]).toBeTruthy();
    expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeTruthy();
  });

  test('does not submit the form if required fields are empty', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    await waitFor(() => {
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('calls registerUser and navigates to /login after successful registration', async () => {
    registerUserMock.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Mr/i }));

    fireEvent.change(screen.getAllByLabelText(/Nom/i)[0], {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Prénom/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Rue/i), {
      target: { value: 'Main Street' },
    });
    fireEvent.change(screen.getAllByLabelText(/Numéro/i)[0], {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Boîte/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/Code Postal/i), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), {
      target: { value: 'Bruxelles' },
    });
    fireEvent.change(screen.getByLabelText(/Pays/i), {
      target: { value: 'Belgique' },
    });
    fireEvent.change(screen.getByLabelText(/Numéro de téléphone/i), {
      target: { value: '+32476123456' },
    });
    fireEvent.change(screen.getAllByLabelText(/Mot de passe/i)[0], {
      target: { value: 'Password@123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'Password@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    await waitFor(() => {
      expect(registerUserMock).toHaveBeenCalled();
      expect(registerUserMock.mock.calls[0][0]).toMatchObject({
        firstname: 'John',
        lastname: 'Doe',
        title: 'Mr',
        phoneNumber: '+32476123456',
        email: 'test@example.com',
        password: 'Password@123',
        address: {
          street: 'Main Street',
          number: '10',
          poBox: '',
          postalCode: '1000',
          city: 'Bruxelles',
          country: 'Belgique',
        },
        role: 'CUSTOMER',
      });

      expect(navigateMock).toHaveBeenCalledWith('/login', {
        state: { justRegistered: true },
      });
    });
  }, 10000);

  test('logs an error if registerUser fails', async () => {
    registerUserMock.mockRejectedValueOnce(new Error('Registration failed'));

    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Mr/i }));

    fireEvent.change(screen.getAllByLabelText(/Nom/i)[0], {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Prénom/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Rue/i), {
      target: { value: 'Main Street' },
    });
    fireEvent.change(screen.getAllByLabelText(/Numéro/i)[0], {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Code Postal/i), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), {
      target: { value: 'Bruxelles' },
    });
    fireEvent.change(screen.getByLabelText(/Pays/i), {
      target: { value: 'Belgique' },
    });
    fireEvent.change(screen.getByLabelText(/Numéro de téléphone/i), {
      target: { value: '+32476123456' },
    });
    fireEvent.change(screen.getAllByLabelText(/Mot de passe/i)[0], {
      target: { value: 'Password@123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'Password@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    await waitFor(() => {
      expect(registerUserMock).toHaveBeenCalled();
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'RegisterPage::error: ',
        expect.any(Error),
      );
    });
    consoleErrorMock.mockRestore();
  }, 10000);

  test('shows error if email is invalid', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getAllByLabelText(/Mot de passe/i)[0], {
      target: { value: 'Password@123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'Password@123' },
    });

    fireEvent.submit(screen.getByText(/S'inscrire/i));

    await waitFor(() => {
      expect(screen.getByText(/adresse email n'est pas valide/i)).toBeTruthy();
    });
  });

  test('shows error if password and confirmation do not match', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'user@mail.com' },
    });
    fireEvent.change(screen.getAllByLabelText(/Mot de passe/i)[0], {
      target: { value: 'Password@123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'DifferentPassword' },
    });

    fireEvent.submit(screen.getByText(/S'inscrire/i));

    await waitFor(() => {
      expect(
        screen.getByText(
          /mot de passe et sa confirmation ne correspondent pas/i,
        ),
      ).toBeTruthy();
    });
  });

  test('shows error if phone number is invalid', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Numéro de téléphone/i), {
      target: { value: 'abc123' },
    });
    fireEvent.submit(screen.getByText(/S'inscrire/i));

    await waitFor(() => {
      expect(
        screen.getByText(
          /doit commencer par 0 \(national\) ou \+ \(international\)/i,
        ),
      ).toBeTruthy();
    });
  });

  test('shows error message if email is already used (409)', async () => {
    registerUserMock.mockRejectedValueOnce(
      new Error('409 - Email déjà utilisé'),
    );

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Mr/i }));
    fireEvent.change(screen.getAllByLabelText(/Nom/i)[0], {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Prénom/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'duplicate@mail.com' },
    });
    fireEvent.change(screen.getByLabelText(/Rue/i), {
      target: { value: 'Main Street' },
    });
    fireEvent.change(screen.getAllByLabelText(/Numéro/i)[0], {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Code Postal/i), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), {
      target: { value: 'Bruxelles' },
    });
    fireEvent.change(screen.getByLabelText(/Pays/i), {
      target: { value: 'Belgique' },
    });
    fireEvent.change(screen.getByLabelText(/Numéro de téléphone/i), {
      target: { value: '+32476123456' },
    });
    fireEvent.change(screen.getAllByLabelText(/Mot de passe/i)[0], {
      target: { value: 'Password@123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'Password@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    await waitFor(() => {
      expect(screen.getByText(/Adresse email déjà utilisée/i)).toBeTruthy();
    });
  }, 10000);
});
