import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ReservationDetailPage from './ReservationDetailsPage';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

describe('ReservationDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (id = '123') => {
    render(
      <MemoryRouter initialEntries={[`/reservations/${id}`]}>
        <Routes>
          <Route path="/reservations/:id" element={<ReservationDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  test('displays loading spinner initially', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  test('displays error message if fetch fails', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    renderPage();

    const error = await screen.findByText(/Réservation introuvable/i);
    expect(error).toBeTruthy();
  });

  test('displays error if fetch throws exception', async () => {
    mockFetch.mockRejectedValue(new Error('Boom'));

    renderPage();

    const error = await screen.findByText(/Réservation introuvable/i);
    expect(error).toBeTruthy();
  });

  test('renders reserved items and total correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          productLotId: 1,
          productLabel: 'Pommes',
          productDescription: 'Rouges et sucrées',
          productUnit: 'kg',
          unitPrice: 3,
          quantity: 2,
        },
        {
          productLotId: 2,
          productLabel: 'Carottes',
          productDescription: 'Bien croquantes',
          productUnit: 'kg',
          unitPrice: 2,
          quantity: 1,
        },
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Pommes')).toBeTruthy();
      expect(screen.getByText('Carottes')).toBeTruthy();
    });

    expect(screen.getByText(/Rouges et sucrées/i)).toBeTruthy();
    expect(screen.getByText(/Bien croquantes/i)).toBeTruthy();
    expect(screen.getByText(/6.00 €/)).toBeTruthy();
    expect(screen.getAllByText(/2.00 €/)).toHaveLength(2);
    expect(screen.getByText(/Total : 8.00 €/)).toBeTruthy();
  });
});
