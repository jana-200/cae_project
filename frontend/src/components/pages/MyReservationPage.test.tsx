import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import MyReservationPage from './MyReservationPage';
import { ReservationContext } from '../../contexts/ReservationContext';
import { ReservationContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import '@testing-library/jest-dom';

const mockSubmitReservation = vi.fn();
const mockUpdateQuantity = vi.fn();

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockContext: ReservationContextType = {
  items: [
    {
      product: {
        lotId: 1,
        productLabel: 'Pomme',
        productType: 'Fruit',
        imageUrl: '',
        producerEmail: 'prod@test.com',
        unitPrice: 2,
        remainingQuantity: 50,
        availabilityDate: '',
        productUnit: 'kg',
        productDescription: 'Des pommes bio',
        initialQuantity: 50,
        soldQuantity: 0,
        reservedQuantity: 0,
        productLotState: 'FOR_SALE',
        producerName: 'Testeur',
      },
      quantity: 2,
    },
  ],
  submitReservation: mockSubmitReservation,
  updateQuantity: mockUpdateQuantity,
  addToReservation: vi.fn(),
  clearReservation: vi.fn(),
  removeFromReservation: vi.fn(),
  fetchAllReservations: vi.fn(),
  updateReservationState: vi.fn(),
};

describe('ReservationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('display a message if the cart is empty', () => {
    render(
      <MemoryRouter>
        <ReservationContext.Provider value={{ ...mockContext, items: [] }}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.queryByText(/Votre panier est vide/i)).toBeTruthy();
  });

  test('display cart products with total', () => {
    render(
      <MemoryRouter>
        <ReservationContext.Provider value={mockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.queryByText(/Pomme/)).toBeTruthy();
    expect(screen.queryByText(/Des pommes bio/)).toBeTruthy();
    expect(screen.queryByText('4.00 €')).toBeTruthy();
  });

  test('change the quantity manually', () => {
    render(
      <MemoryRouter>
        <ReservationContext.Provider value={mockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByDisplayValue('2');
    fireEvent.change(input, { target: { value: '5' } });

    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 5);
  });

  test('prevents booking if no date selected', async () => {
    render(
      <MemoryRouter>
        <ReservationContext.Provider value={mockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Réserver/i }));

    const error = await screen.findByText(
      /Veuillez sélectionner une date de récupération/i,
    );
    expect(error).toBeTruthy();
  });

  test('successfully submits the reservation', async () => {
    mockSubmitReservation.mockResolvedValueOnce(true);

    render(
      <MemoryRouter>
        <ReservationContext.Provider value={mockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      const select = screen.getByText(/Choisissez une date/i);

      fireEvent.mouseDown(select);
    });

    const options = await screen.findAllByRole('option');
    fireEvent.click(options[1]);

    fireEvent.click(screen.getByRole('button', { name: /Réserver/i }));
  });

  test('displays an error if submit Reservation fails', async () => {
    const mockUser = {
      token: 'mocked-token',
      email: 'customer@test.com',
      role: 'CUSTOMER',
    };

    mockSubmitReservation.mockResolvedValueOnce(false);

    render(
      <MemoryRouter>
        <UserContext.Provider
          value={{
            authenticatedUser: mockUser,
            registerUser: vi.fn(),
            loginUser: vi.fn(),
            clearUser: vi.fn(),
            checkUserAuthentication: vi.fn(),
            isTokenExpired: false,
            changePassword: vi.fn(),
            fetchUserDetails: vi.fn(),
            isVolunteer: false,
            fetchIsDeactivated: vi.fn(),
          }}
        >
          <ReservationContext.Provider value={mockContext}>
            <MyReservationPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const dateSelect = await screen.findByText(/Choisissez une date/i);
    fireEvent.mouseDown(dateSelect);

    const options = await screen.findAllByRole('option');
    fireEvent.click(options[1]);

    fireEvent.click(screen.getByRole('button', { name: /Réserver/i }));
    expect(mockSubmitReservation).toHaveBeenCalledWith(
      expect.any(String),
      mockUser,
    );
  });

  test('remove an item from the reservation', () => {
    const mockRemove = vi.fn();

    render(
      <MemoryRouter>
        <ReservationContext.Provider
          value={{ ...mockContext, removeFromReservation: mockRemove }}
        >
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    const deleteButton = screen.getByRole('button', { name: /supprimer/i });
    fireEvent.click(deleteButton);

    expect(mockRemove).toHaveBeenCalledWith(1);
  });

  test('submit button is disabled when no date is selected', () => {
    render(
      <MemoryRouter>
        <ReservationContext.Provider value={mockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', { name: /Réserver/i });
    expect(submitButton).toBeDisabled();
  });

  test('displays 4 available dates in the select', async () => {
    render(
      <MemoryRouter>
        <ReservationContext.Provider value={mockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    const select = await screen.findByText(/Choisissez une date/i);
    fireEvent.mouseDown(select);

    const options = await screen.findAllByRole('option');
    expect(options.length).toBe(5);
  });

  test('clicking on image navigates to product page', () => {
    render(
      <MemoryRouter>
        <ReservationContext.Provider value={mockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    const image = screen.getByRole('img');
    fireEvent.click(image);

    expect(mockNavigate).toHaveBeenCalledWith('/lots/1');
  });

  test('displays the correct total dynamically', () => {
    render(
      <MemoryRouter>
        <ReservationContext.Provider value={mockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    const totalAmount = mockContext.items.reduce(
      (acc, { product, quantity }) => acc + product.unitPrice * quantity,
      0,
    );

    const formattedTotal = `Total : ${totalAmount.toFixed(2)} €`;

    expect(screen.getByText(formattedTotal)).toBeInTheDocument();
  });

  test('resets quantity to 1 when input is left empty', () => {
    render(
      <MemoryRouter>
        <ReservationContext.Provider value={mockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByDisplayValue('2');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });

  test('displays "Stock max" warning when quantity exceeds remaining stock', () => {
    const overStockContext = {
      ...mockContext,
      items: [
        {
          ...mockContext.items[0],
          quantity: 999,
          product: {
            ...mockContext.items[0].product,
            remainingQuantity: 5,
          },
        },
      ],
    };

    render(
      <MemoryRouter>
        <ReservationContext.Provider value={overStockContext}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Stock max: 5/i)).toBeInTheDocument();
  });

  test('caps quantity to remaining stock on blur', () => {
    const contextWithLimitedStock = {
      ...mockContext,
      items: [
        {
          ...mockContext.items[0],
          quantity: 10,
          product: {
            ...mockContext.items[0].product,
            remainingQuantity: 3,
          },
        },
      ],
    };

    render(
      <MemoryRouter>
        <ReservationContext.Provider value={contextWithLimitedStock}>
          <MyReservationPage />
        </ReservationContext.Provider>
      </MemoryRouter>,
    );

    const input = screen.getByDisplayValue('10');
    fireEvent.blur(input);

    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);
  });
});
