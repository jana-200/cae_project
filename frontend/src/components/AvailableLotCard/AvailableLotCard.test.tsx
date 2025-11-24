import { describe, expect, vi, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AvailableLotCard from './';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ProductLot } from '../../types';

vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();
(useNavigate as unknown as () => typeof mockNavigate) = () => mockNavigate;

const renderWithProviders = (ui: React.ReactNode) => {
  const theme = createTheme();
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>,
  );
};

const lot: ProductLot = {
  lotId: 1,
  productLabel: 'Pommes bio',
  productType: 'Fruit',
  imageUrl: '',
  producerEmail: 'alice@example.com',
  unitPrice: 2.5,
  remainingQuantity: 70,
  availabilityDate: '2025-04-10',
  productUnit: 'kg',
  productDescription: 'Des pommes fraîches et locales.',
  initialQuantity: 100,
  soldQuantity: 20,
  reservedQuantity: 10,
  productLotState: 'ACTIVE',
  producerName: 'Alice',
};

describe('AvailableLotCard', () => {
  test('renders product label and type chip', () => {
    renderWithProviders(<AvailableLotCard lot={lot} />);
    expect(screen.getByText(/Pommes bio/i)).toBeTruthy();
    expect(screen.getByText(/Fruit/i)).toBeTruthy();
  });

  test('displays unit price with unit', () => {
    renderWithProviders(<AvailableLotCard lot={lot} />);
    expect(screen.getByText('2.50 € / kg')).toBeTruthy();
  });

  test('renders product description', () => {
    renderWithProviders(<AvailableLotCard lot={lot} />);
    expect(screen.getByText(/Des pommes fraîches et locales/i)).toBeTruthy();
  });

  test('displays quantity info correctly', () => {
    renderWithProviders(<AvailableLotCard lot={lot} />);
    expect(screen.getByText(/unités fournies/i)).toBeTruthy();
    expect(screen.getByText(/100 kg/i)).toBeTruthy();
    expect(screen.getByText(/unités vendues/i)).toBeTruthy();
    expect(screen.getByText(/20 kg/i)).toBeTruthy();
    expect(screen.getByText(/unités réservées/i)).toBeTruthy();
    expect(screen.getByText(/10 kg/i)).toBeTruthy();
    expect(screen.getByText(/unités disponibles/i)).toBeTruthy();
    expect(screen.getByText(/70 kg/i)).toBeTruthy();
  });

  test('uses fallback image if imageUrl is empty', () => {
    renderWithProviders(<AvailableLotCard lot={lot} />);
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain('/placeholder.jpg');
  });

  test('triggers navigation to edit page when clicking "modifier la photo"', () => {
    renderWithProviders(<AvailableLotCard lot={lot} />);
    const button = screen.getByRole('button', { name: /modifier la photo/i });
    expect(button).toBeTruthy();
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/edit-lot-image/1');
  });
});
