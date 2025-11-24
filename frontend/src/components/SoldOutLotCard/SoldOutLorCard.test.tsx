import { describe, expect, vi, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SoldOutLotCard from './';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ProductLot } from '../../types';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
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
  lotId: 2,
  productLabel: 'Carottes',
  productType: 'Légume',
  imageUrl: '',
  producerEmail: 'bob@example.com',
  unitPrice: 1.2,
  remainingQuantity: 0,
  availabilityDate: '2025-04-02',
  productUnit: 'kg',
  productDescription: 'Carottes bien croquantes.',
  initialQuantity: 50,
  soldQuantity: 50,
  reservedQuantity: 0,
  productLotState: 'SOLD_OUT',
  producerName: 'Bob',
};

describe('SoldOutLotCard', () => {
  test('renders the product label and type chip', () => {
    renderWithProviders(<SoldOutLotCard lot={lot} />);
    expect(screen.getAllByText(/Carottes/i)[0]).toBeTruthy();
    expect(screen.getByText(/Légume/i)).toBeTruthy();
  });

  test('displays the unit price and unit', () => {
    renderWithProviders(<SoldOutLotCard lot={lot} />);
    expect(screen.getByText('1.20 € / kg')).toBeTruthy();
  });

  test('renders the product description', () => {
    renderWithProviders(<SoldOutLotCard lot={lot} />);
    expect(screen.getByText(/croquantes/i)).toBeTruthy();
  });

  test('displays initial and sold quantities', () => {
    renderWithProviders(<SoldOutLotCard lot={lot} />);
    expect(screen.getByText(/unités fournies/i)).toBeTruthy();
    expect(screen.getByText(/unités vendues/i)).toBeTruthy();
  });

  test('renders fallback image when imageUrl is empty', () => {
    renderWithProviders(<SoldOutLotCard lot={lot} />);
    const image = screen.getByRole('img') as HTMLImageElement;
    expect(image).toBeTruthy();
    expect(image.src).toContain('/placeholder.jpg');
  });

  test('navigates to edit image page when clicking the button', () => {
    renderWithProviders(<SoldOutLotCard lot={lot} />);
    const button = screen.getByRole('button', { name: /modifier la photo/i });
    expect(button).toBeTruthy();
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/edit-lot-image/2');
  });
});
