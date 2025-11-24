import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProducerListPage from './ProducersListPage';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { UserContext } from '../../contexts/UserContext';
import { BrowserRouter } from 'react-router-dom';
import type { UserContextType, Producer } from '../../types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUserContext: UserContextType = {
  authenticatedUser: { email: 'admin@test.com', token: 'secure-token' },
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

const renderWithContext = () =>
  render(
    <UserContext.Provider value={mockUserContext}>
      <BrowserRouter>
        <ProducerListPage />
      </BrowserRouter>
    </UserContext.Provider>,
  );

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('ProducerListPage', () => {
  test('displays the loader while loading', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
    renderWithContext();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  test('displays an error if fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    renderWithContext();
    await waitFor(() => {
      expect(screen.getByText(/erreur de récupération/i)).toBeTruthy();
    });
  });

  test('displays the message No producer found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }),
    );
    renderWithContext();
    await waitFor(() => {
      expect(screen.getByText(/aucun producteur trouvé/i)).toBeTruthy();
    });
  });

  test('displays the list of producers', async () => {
    const producers: Producer[] = [
      {
        userId: 1,
        companyName: 'Fermier Bio',
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@ferme.com',
        deactivated: false,
        phoneNumber: '+32471234567',
        address: {
          street: 'Rue du Terroir',
          number: '12',
          poBox: 'B1',
          postalCode: '1000',
          city: 'Bruxelles',
          country: 'Belgique',
        },
      },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(producers),
      }),
    );
    renderWithContext();
    await waitFor(() => {
      expect(screen.getByText('Fermier Bio')).toBeTruthy();
      expect(screen.getByText('Jean Dupont')).toBeTruthy();
    });
  });

  test('clicking the disable button calls the API', async () => {
    const producers: Producer[] = [
      {
        userId: 1,
        companyName: 'Fermier Bio',
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@ferme.com',
        deactivated: false,
        phoneNumber: '+32471234567',
        address: {
          street: 'Rue du Terroir',
          number: '12',
          poBox: 'B1',
          postalCode: '1000',
          city: 'Bruxelles',
          country: 'Belgique',
        },
      },
    ];
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(producers),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    vi.stubGlobal('fetch', fetchSpy);
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Désactiver le compte')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Désactiver le compte'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });
  });

  test('deactivateUser handles a network error', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              userId: 1,
              companyName: 'Prod1',
              firstname: 'A',
              lastname: 'B',
              email: 'p@a.com',
              deactivated: false,
            },
          ]),
      })
      .mockRejectedValueOnce(new Error('Network error'));
    vi.stubGlobal('fetch', fetchSpy);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithContext();
    await waitFor(() => {
      expect(screen.getByText('Désactiver le compte')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Désactiver le compte'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'deactivateUser::error',
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  test('deactivateUser throws an error if status !ok', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              userId: 1,
              companyName: 'Prod1',
              firstname: 'A',
              lastname: 'B',
              email: 'p@a.com',
              deactivated: false,
            },
          ]),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Interdit'),
      });
    vi.stubGlobal('fetch', fetchSpy);

    renderWithContext();
    await waitFor(() => {
      expect(screen.getByText('Désactiver le compte')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Désactiver le compte'));

    await waitFor(() => {
      expect(screen.queryByText('Désactiver le compte')).not.toBeNull();
    });
  });

  test('handleDeactivate calls alert on error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              userId: 1,
              companyName: 'Prod1',
              firstname: 'A',
              lastname: 'B',
              email: 'p@a.com',
              deactivated: false,
            },
          ]),
      })
      .mockRejectedValueOnce(new Error('boom'));
    vi.stubGlobal('fetch', fetchSpy);

    renderWithContext();
    await waitFor(() => {
      expect(screen.getByText('Désactiver le compte')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Désactiver le compte'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erreur lors de la désactivation');
    });
  });

  test('Clicking on the map redirects to the producers lots', async () => {
    const producers: Producer[] = [
      {
        userId: 1,
        companyName: 'Test SARL',
        firstname: 'Alice',
        lastname: 'Durand',
        email: 'alice@test.com',
        deactivated: false,
        phoneNumber: '+32471234567',
        address: {
          street: 'Rue du Terroir',
          number: '12',
          poBox: 'B1',
          postalCode: '1000',
          city: 'Bruxelles',
          country: 'Belgique',
        },
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(producers),
      }),
    );

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Test SARL')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Test SARL'));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/producers/lots?email=alice%40test.com',
    );
  });

  test('"+ Reactivate account" button calls handleDeactivate', async () => {
    const producers: Producer[] = [
      {
        userId: 1,
        companyName: 'Reactiv SARL',
        firstname: 'Bob',
        lastname: 'Martin',
        email: 'bob@test.com',
        deactivated: true,
        phoneNumber: '+32471234567',
        address: {
          street: 'Rue du Terroir',
          number: '12',
          poBox: 'B1',
          postalCode: '1000',
          city: 'Bruxelles',
          country: 'Belgique',
        },
      },
    ];

    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(producers),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    vi.stubGlobal('fetch', fetchSpy);
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Réactiver le compte')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Réactiver le compte'));
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });
  });
});
