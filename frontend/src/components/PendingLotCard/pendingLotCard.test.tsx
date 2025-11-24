import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import PendingLotCard from '.';
import { ProductLot } from '../../types';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PendingLotCard tests', () => {
  const mockLot: ProductLot = {
    lotId: 1,
    productLabel: 'Pommes',
    productType: 'Fruit',
    productDescription: 'Des pommes bien rouges',
    producerEmail: 'producteur@example.com',
    unitPrice: 1.5,
    productUnit: 'kg',
    initialQuantity: 100,
    soldQuantity: 0,
    remainingQuantity: 80,
    availabilityDate: '2025-04-01T08:00:00',
    reservedQuantity: 0,
    imageUrl: 'https://example.com/pomme.jpg',
    productLotState: '',
    producerName: '',
  };

  test('displays lot information', () => {
    render(
      <MemoryRouter>
        <PendingLotCard lot={mockLot} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Pommes')).toBeInTheDocument();
    expect(screen.getByText('1.50 € / kg')).toBeInTheDocument();
    expect(screen.getByText(/Des pommes bien rouges/i)).toBeInTheDocument();
    expect(screen.getByText(/unités fournies : 100 kg/i)).toBeInTheDocument();
  });

  test('redirects to image editing page on button click', () => {
    render(
      <MemoryRouter>
        <PendingLotCard lot={mockLot} />
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: /modifier la photo/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/edit-lot-image/1');
  });

  test('displays a replacement image if no image URL is provided', () => {
    const mockLotSansImage = { ...mockLot, imageUrl: '' };

    render(
      <MemoryRouter>
        <PendingLotCard lot={mockLotSansImage} />
      </MemoryRouter>,
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder.jpg');
  });
});
