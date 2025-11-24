import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import AccountCreationPage from '../../components/pages/AccountCreationPage';
import { UserContext } from '../../contexts/UserContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('AccountCreationPage', () => {
  const registerUserMock = vi.fn();
  const navigateMock = vi.fn();

  const mockContextValue = {
    authenticatedUser: undefined,
    userDetails: null,
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders main fields and civilité section', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <AccountCreationPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Inscription/i)).toBeTruthy();
    expect(screen.getByText(/Civilité/i)).toBeTruthy();
    expect(screen.getAllByLabelText(/Nom/i)[0]).toBeTruthy();
    expect(screen.getByLabelText(/Prénom/i)).toBeTruthy();
    expect(screen.getByLabelText(/Rue/i)).toBeTruthy();
    expect(screen.getAllByLabelText(/Numéro/i)[0]).toBeTruthy();
    expect(screen.getByLabelText(/Code Postal/i)).toBeTruthy();
    expect(screen.getByLabelText(/Ville/i)).toBeTruthy();
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/Numéro de téléphone/i)).toBeTruthy();
  });

  test('displays companyName only when role is PRODUCER', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <AccountCreationPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText(/Nom de l’entreprise/i)).toBeNull();
    fireEvent.change(screen.getByLabelText(/Rôle/i), {
      target: { value: 'PRODUCER' },
    });
    expect(screen.getByLabelText(/Nom de l’entreprise/i)).toBeTruthy();
  });

  test('shows validation errors for invalid inputs', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <AccountCreationPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getAllByLabelText(/Nom/i)[0], {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText(/Prénom/i), {
      target: { value: '456' },
    });
    fireEvent.change(screen.getByLabelText(/Rue/i), {
      target: { value: '789' },
    });
    fireEvent.change(screen.getAllByLabelText(/Numéro/i)[0], {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Code Postal/i), {
      target: { value: 'abcd' },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), {
      target: { value: '1234' },
    });
    fireEvent.change(screen.getByLabelText(/Numéro de téléphone/i), {
      target: { value: 'abc' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'not-email' },
    });

    fireEvent.click(screen.getByText(/Soumettre/i));

    await waitFor(() => {
      expect(screen.getByText(/La civilité est requise/)).toBeTruthy();
      expect(
        screen.getByText(/Le nom ne doit pas contenir de chiffres/),
      ).toBeTruthy();
      expect(
        screen.getByText(/Le prénom ne doit pas contenir de chiffres/),
      ).toBeTruthy();
      expect(
        screen.getByText(/La rue ne doit pas contenir de chiffres/),
      ).toBeTruthy();
      expect(
        screen.getByText(
          /Le code postal doit être composé uniquement de chiffres/,
        ),
      ).toBeTruthy();
      expect(
        screen.getByText(/La ville doit être composée uniquement de lettres/),
      ).toBeTruthy();
      expect(screen.getByText(/doit commencer par 0/)).toBeTruthy();
      expect(screen.getByText(/adresse email n'est pas valide/)).toBeTruthy();
    });
  });

  test('sends companyName when PRODUCER', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <AccountCreationPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Rôle/i), {
      target: { value: 'PRODUCER' },
    });
    fireEvent.change(screen.getByLabelText(/Nom de l’entreprise/i), {
      target: { value: 'Ma Ferme' },
    });

    fireEvent.change(screen.getAllByLabelText(/Nom/i)[0], {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText(/Prénom/i), {
      target: { value: 'Jean' },
    });
    fireEvent.click(screen.getByLabelText(/Mr/i));
    fireEvent.change(screen.getByLabelText(/Rue/i), {
      target: { value: 'Rue des Champs' },
    });
    fireEvent.change(screen.getAllByLabelText(/Numéro/i)[0], {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Code Postal/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), {
      target: { value: 'Namur' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'fermier@bio.be' },
    });
    fireEvent.change(screen.getByLabelText(/Numéro de téléphone/i), {
      target: { value: '0476123456' },
    });

    fireEvent.click(screen.getByText(/Soumettre/i));
    fireEvent.submit(screen.getByTestId('account-form'));

    await waitFor(() => {
      expect(registerUserMock).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'PRODUCER',
          companyName: 'Ma Ferme',
        }),
      );
    });
  });
});
