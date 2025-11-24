import { render, screen, waitFor, act } from '@testing-library/react';
import ProducerLotsPage from './ProducerLotsPage';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { UserContext } from '../../contexts/UserContext';
import { BrowserRouter } from 'react-router-dom';
import type { ProductLot, UserContextType } from '../../types';

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLocation: () => ({ search: '?email=test@test.com' }),
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

const setup = async () => {
  await act(async () => {
    render(
      <UserContext.Provider value={mockUserContext}>
        <BrowserRouter>
          <ProducerLotsPage />
        </BrowserRouter>
      </UserContext.Provider>,
    );
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('ProducerLotsPage', () => {
  test('displays a loader at the beginning', async () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}));
    await setup();
    expect(screen.getByTestId('loader')).toBeTruthy();
  });

  test('displays an error if the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Erreur test')));
    await setup();
    await waitFor(() => {
      expect(screen.getByTestId('error-alert').textContent).toBe('Erreur test');
    });
  });

  test('displays a message if no batch is returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }),
    );
    await setup();
    await waitFor(() => {
      expect(screen.getByTestId('no-lots-alert')).toBeTruthy();
    });
  });

  test('displays returned lots', async () => {
    const mockLots: ProductLot[] = [
      {
        lotId: 1,
        productLabel: 'Pommes',
        productType: 'Rouge et juteuses',
        unitPrice: 3,
        productUnit: 'kg',
        productDescription: 'Rouges et juteuses',
        initialQuantity: 30,
        availabilityDate: new Date().toISOString(),
        productLotState: 'FOR_SALE',
        imageUrl: '',
        producerName: 'Fermier',
        producerEmail: 'prod@test.com',
        remainingQuantity: 10,
        soldQuantity: 10,
        reservedQuantity: 10,
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockLots) }),
    );
    await setup();

    await waitFor(() => {
      expect(screen.getByTestId('lot-title-1').textContent).toBe('Pommes');
      expect(screen.getByTestId('lot-description-1').textContent).toBe(
        'Rouges et juteuses',
      );
      expect(screen.getByTestId('lot-price-1').textContent).toBe(
        'Prix : 3 € / kg',
      );
      expect(screen.getByTestId('lot-quantity-1').textContent).toBe(
        'Quantité : 10',
      );
      expect(screen.getByTestId('lot-state-1').textContent).toBe(
        'État : En vente',
      );
    });
  });

  test('displays the title if mail is defined and batches are present', async () => {
    const mockLots: ProductLot[] = [
      {
        lotId: 1,
        productLabel: 'Pommes',
        productType: 'Rouge',
        unitPrice: 3,
        productUnit: 'kg',
        productDescription: 'Rouges et juteuses',
        initialQuantity: 30,
        availabilityDate: new Date().toISOString(),
        productLotState: 'FOR_SALE',
        imageUrl: '',
        producerName: 'Fermier',
        producerEmail: 'test@test.com',
        remainingQuantity: 10,
        soldQuantity: 0,
        reservedQuantity: 0,
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLots),
      }),
    );

    await setup();

    await waitFor(() => {
      expect(screen.getByText('Lots proposés par ce producteur')).toBeTruthy();
    });
  });

  test('displays a custom error if response.ok is false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn(),
      }),
    );

    await setup();

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toBeTruthy();
      expect(alert.textContent).toBe('Erreur de récupération des lots');
    });
  });

  test('displays a generic message if a non-Error is thrown', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('string-error'));

    await setup();

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain(
        'Erreur lors de la récupération des lots.',
      );
    });
  });

  test('displays "Pas de description " if no description is provided', async () => {
    const mockLots = [
      {
        lotId: 2,
        productLabel: 'Carottes',
        productType: 'Légume',
        unitPrice: 1.8,
        productUnit: 'kg',
        productDescription: '',
        initialQuantity: 15,
        availabilityDate: '2025-05-01',
        productLotState: 'FOR_SALE',
        imageUrl: '',
        producerName: 'Maraîcher',
        producerEmail: 'carrot@test.com',
        remainingQuantity: 5,
        soldQuantity: 10,
        reservedQuantity: 0,
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLots),
      }),
    );

    await setup();

    await waitFor(() => {
      expect(screen.getByTestId('lot-description-2').textContent).toBe(
        'Pas de description.',
      );
    });
  });

  test('displays the raw name of the state if not present in stateLabels', async () => {
    const mockLots = [
      {
        lotId: 2,
        productLabel: 'Bananes',
        productType: 'Fruit',
        unitPrice: 2,
        productUnit: 'kg',
        productDescription: 'Jaunes et mûres',
        initialQuantity: 50,
        availabilityDate: '2025-05-02',
        productLotState: 'UNKNOWN_STATE',
        imageUrl: '',
        producerName: 'Tropic Fruits',
        producerEmail: 'tropic@test.com',
        remainingQuantity: 20,
        soldQuantity: 20,
        reservedQuantity: 10,
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLots),
      }),
    );

    await setup();

    await waitFor(() => {
      expect(screen.getByTestId('lot-state-2').textContent).toBe(
        'État : UNKNOWN_STATE',
      );
    });
  });

  test('performs a fetch with the correct email and token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    vi.stubGlobal('fetch', mockFetch);

    await setup();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/producers/lots?email=test%40test.com',
        {
          headers: {
            Authorization: 'secure-token',
          },
        },
      );
    });
  });

  test('displays a custom error if response.ok is false', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn(),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(
      <UserContext.Provider value={mockUserContext}>
        <BrowserRouter>
          <ProducerLotsPage />
        </BrowserRouter>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toBeTruthy();
      expect(alert.textContent).toBe('Erreur de récupération des lots');
    });
  });

  test('displays a custom error if response.ok is false', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn(),
    });
    vi.stubGlobal('fetch', mockFetch);

    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useLocation: () => ({ search: '?email=test@test.com' }),
      };
    });

    render(
      <UserContext.Provider value={mockUserContext}>
        <BrowserRouter>
          <ProducerLotsPage />
        </BrowserRouter>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toBeTruthy();
      expect(alert.textContent).toBe('Erreur de récupération des lots');
    });
  });
});
