import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '../../components/pages/DashboardPage';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { ProductLotContextType } from '../../types';

const fetchSalesStatisticsMock = vi.fn();
const fetchProductSuggestionsMock = vi.fn();

const mockContextValue: ProductLotContextType = {
  allLots: [],
  availableLots: [],
  soldOutLots: [],
  acceptedLots: [],
  refusedLots: [],
  allLotsForManager: [],
  fetchAvailableLots: vi.fn(),
  fetchAcceptedLots: vi.fn(),
  fetchRefusedLots: vi.fn(),
  fetchSoldOutLots: vi.fn(),
  fetchAllLots: vi.fn(),
  fetchAllLotsForManager: vi.fn(),
  createLot: vi.fn(),
  fetchExistingImage: vi.fn(),
  fetchProductSuggestions: fetchProductSuggestionsMock,
  productOptions: [
    {
      productId: 1,
      type: 'Vegetable',
      description: 'Fresh tomatoes',
      unit: 'kg',
      label: 'Tomates',
    },
  ],
  existingImages: [],
  fetchPendingLots: vi.fn(),
  pendingLots: [],
  fetchProductLotById: vi.fn(),
  lot: null,
  updateLot: vi.fn(),
  changeLotState: vi.fn(),
  decreaseLotQuantity: vi.fn(),
  fetchSalesStatistics: fetchSalesStatisticsMock,
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('displays the title and main filters', () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Tableau de bord/i)).toBeTruthy();
    expect(screen.getByLabelText(/Nom du produit/i)).toBeTruthy();
    const input = screen.getByLabelText(/Année/i);
    expect(input).toBeTruthy();
    expect(screen.getByLabelText(/Mois/i)).toBeTruthy();
    expect(screen.getByText(/Rechercher/i)).toBeTruthy();
  });

  test('displays a message if statistics fetch fails', async () => {
    fetchSalesStatisticsMock.mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByRole('combobox', { name: /nom du produit/i });
    fireEvent.change(input, { target: { value: 'Tomates' } });
    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Aucun produit correspondant trouvé. Veuillez vérifier votre saisie./i,
        ),
      ).toBeTruthy();
    });
  });

  test('correctly displays statistics', async () => {
    fetchSalesStatisticsMock.mockResolvedValue({
      totalReceived: 200,
      totalSold: 150,
      salesPerDay: {
        '2024-04-01': 10,
        '2024-04-02': 20,
      },
    });

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/nom du produit/i);
    fireEvent.change(input, { target: { value: 'Tomates' } });
    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => {
      expect(fetchSalesStatisticsMock).toHaveBeenCalledWith(
        'Tomates',
        undefined,
        undefined,
      );
      expect(
        screen.getByRole('heading', { name: /Total reçues/i }),
      ).toBeTruthy();
      expect(screen.getByRole('heading', { name: '200' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: '150' })).toBeTruthy();
      expect(screen.getByText(/Résumé des ventes/i)).toBeTruthy();
      expect(screen.getByText(/Évolution des ventes/i)).toBeTruthy();
    });
  });

  test('shows monthly sales when only a year is selected', async () => {
    fetchSalesStatisticsMock.mockResolvedValue({
      totalReceived: 300,
      totalSold: 250,
      salesPerDay: {
        '2024-01-15': 50,
        '2024-02-20': 100,
        '2024-03-10': 100,
      },
    });

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const productInput = screen.getByLabelText(/nom du produit/i);
    fireEvent.change(productInput, { target: { value: 'Tomates' } });

    const yearSelect = screen.getByLabelText(/année/i);
    fireEvent.mouseDown(yearSelect);

    const yearOption = screen.getByText('2024');
    fireEvent.click(yearOption);

    await waitFor(() => {
      expect(yearSelect.textContent).toBe('2024');
    });

    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => {
      expect(fetchSalesStatisticsMock).toHaveBeenCalledWith(
        'Tomates',
        undefined,
        2024,
      );
      expect(screen.getByText(/Évolution des ventes/i)).toBeTruthy();
      expect(screen.getByText(/Résumé des ventes/i)).toBeTruthy();
    });
  });

  test('disables the Month field if no year is selected', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const monthInput = screen.getByLabelText(/mois/i);
    expect(monthInput.getAttribute('aria-disabled')).toBe('true');

    const yearSelect = screen.getByLabelText(/année/i);
    fireEvent.mouseDown(yearSelect);

    const yearOption = screen.getByText('2024');
    fireEvent.click(yearOption);

    await waitFor(() => {
      expect(yearSelect.textContent).toBe('2024');
    });

    expect(monthInput.getAttribute('aria-disabled')).toBe(null);
  });

  test('shows a message when the returned data is empty', async () => {
    fetchSalesStatisticsMock.mockResolvedValue({
      totalReceived: 0,
      totalSold: 0,
      salesPerDay: {},
    });

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/nom du produit/i);
    fireEvent.change(input, { target: { value: 'Tomates' } });
    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => {
      const totalReceivedLabels = screen.getAllByText(/Total reçues/i)[0];
      const totalSoldLabels = screen.getAllByText(/Total vendues/i)[0];

      expect(totalReceivedLabels).toBeTruthy();
      expect(totalSoldLabels).toBeTruthy();
      expect(screen.getAllByText('0')[0]).toBeTruthy();
    });
  });

  test('does nothing if no product is selected', () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const searchButton = screen.getByText(/Rechercher/i);
    fireEvent.click(searchButton);

    expect(fetchSalesStatisticsMock).not.toHaveBeenCalled();
  });

  test('calls fetchProductSuggestions when typing in the product field', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/nom du produit/i);
    fireEvent.change(input, { target: { value: 'To' } });

    await waitFor(() => {
      expect(fetchProductSuggestionsMock).toHaveBeenCalledWith('To');
    });
  });

  test('displays the sales table with the correct data', async () => {
    fetchSalesStatisticsMock.mockResolvedValue({
      totalReceived: 200,
      totalSold: 150,
      salesPerDay: {
        '2024-04-01': 10,
        '2024-04-02': 20,
      },
    });

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/nom du produit/i);
    fireEvent.change(input, { target: { value: 'Tomates' } });
    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => {
      expect(screen.getByText(/Résumé des ventes/i)).toBeTruthy();
      expect(screen.getAllByText(/Tomates/i)[0]).toBeTruthy();
      expect(screen.getAllByText(/200/i)[0]).toBeTruthy();
      expect(screen.getAllByText(/150/i)[0]).toBeTruthy();
    });
  });

  test('shows daily sales if both month and year are selected', async () => {
    fetchSalesStatisticsMock.mockResolvedValue({
      totalReceived: 100,
      totalSold: 80,
      salesPerDay: {
        '2024-04-01': 10,
        '2024-04-02': 20,
        '2024-04-03': 50,
      },
    });

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/nom du produit/i), {
      target: { value: 'Tomates' },
    });

    fireEvent.mouseDown(screen.getByLabelText(/année/i));
    fireEvent.click(await screen.findByText('2024'));

    fireEvent.mouseDown(screen.getByLabelText(/mois/i));
    fireEvent.click(await screen.findByText('Avril'));

    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => {
      expect(fetchSalesStatisticsMock).toHaveBeenCalledWith('Tomates', 4, 2024);
      expect(screen.getByText('Résumé des ventes')).toBeTruthy();
    });
  });

  test('resets month if year is cleared', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const yearSelect = screen.getByLabelText(/année/i);
    const monthSelect = screen.getByLabelText(/mois/i);

    fireEvent.mouseDown(yearSelect);
    fireEvent.click(await screen.findByText('2024'));

    fireEvent.mouseDown(monthSelect);
    fireEvent.click(await screen.findByText('Mars'));

    fireEvent.mouseDown(yearSelect);
    fireEvent.click(await screen.findByText('Toutes'));

    await waitFor(() => {
      expect(monthSelect.getAttribute('aria-disabled')).toBe('true');
    });
  });

  test('does not render the summary if hasSearched is false', () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.queryByText(/Évolution des ventes/i)).toBeNull();
    expect(screen.queryByText(/Résumé des ventes/i)).toBeNull();
  });

  test('does not show the chart if salesPerDay is undefined', async () => {
    fetchSalesStatisticsMock.mockResolvedValue({
      totalReceived: 0,
      totalSold: 0,
      salesPerDay: undefined,
    });

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/nom du produit/i), {
      target: { value: 'Tomates' },
    });
    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => {
      expect(screen.queryByText(/Évolution des ventes/i)).toBeTruthy();
      expect(screen.queryAllByText('0').length).toBeGreaterThan(0);
    });
  });

  test('does not call fetchProductSuggestions if fewer than 2 characters are typed', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/nom du produit/i);
    fireEvent.change(input, { target: { value: 'T' } });

    await waitFor(() => {
      expect(fetchProductSuggestionsMock).not.toHaveBeenCalled();
    });
  });

  test('does nothing if the product field only contains spaces', () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/nom du produit/i);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText(/Rechercher/i));

    expect(fetchSalesStatisticsMock).not.toHaveBeenCalled();
  });

  test('resets the month when "All" is selected', async () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const yearSelect = screen.getByLabelText(/année/i);
    const monthSelect = screen.getByLabelText(/mois/i);

    fireEvent.mouseDown(yearSelect);
    fireEvent.click(await screen.findByText('2024'));

    fireEvent.mouseDown(monthSelect);
    fireEvent.click(await screen.findByText('Mars'));

    fireEvent.mouseDown(monthSelect);
    fireEvent.click(await screen.findByText('Tous'));

    await waitFor(() => {
      const tousOption = screen.queryByText('Tous');
      expect(tousOption).not.toBeNull();
    });
  });
  test('updates productLabel on input change', () => {
    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/nom du produit/i);
    fireEvent.change(input, { target: { value: 'Pommes' } });

    expect((input as HTMLInputElement).value).to.equal('Pommes');
  });

  test('triggers search on Enter key press', async () => {
    fetchSalesStatisticsMock.mockResolvedValue({
      totalReceived: 50,
      totalSold: 25,
      salesPerDay: { '2024-04-01': 10 },
    });

    render(
      <MemoryRouter>
        <ProductLotContext.Provider value={mockContextValue}>
          <DashboardPage />
        </ProductLotContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/nom du produit/i);
    fireEvent.change(input, { target: { value: 'Pommes' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(fetchSalesStatisticsMock).toHaveBeenCalled();
      expect(screen.getAllByText(/Total reçues/i).length).to.be.greaterThan(0);
    });
  });
});
