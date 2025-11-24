import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductTypeListPage from './TypePage';
import { ProductTypeContext } from '../../contexts/ProductTypeContext';
import { UserContext } from '../../contexts/UserContext';
import { describe, expect, vi, afterEach, test } from 'vitest';
import { UserContextType } from '../../types';

const mockProductTypes = [
  { typeId: 1, label: 'Fruit' },
  { typeId: 2, label: 'Légume' },
];

const mockFetchProductTypes = vi.fn();

const mockUserContext: UserContextType = {
  authenticatedUser: undefined,
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

const renderPage = () =>
  render(
    <UserContext.Provider value={mockUserContext}>
      <ProductTypeContext.Provider
        value={{
          productTypes: mockProductTypes,
          fetchProductTypes: mockFetchProductTypes,
        }}
      >
        <ProductTypeListPage />
      </ProductTypeContext.Provider>
    </UserContext.Provider>,
  );

describe('ProductTypeListPage', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should display all product types', () => {
    renderPage();
    expect(screen.getByText('Fruit')).toBeInTheDocument();
    expect(screen.getByText('Légume')).toBeInTheDocument();
  });

  test('should show error if trying to add empty type', async () => {
    renderPage();
    const addButton = screen.getByRole('button', { name: /ajouter/i });
    await userEvent.click(addButton);

    expect(
      await screen.findByText(/ne peut pas être vide/i),
    ).toBeInTheDocument();
  });

  test('should open edit dialog when clicking on "Modifier"', async () => {
    renderPage();
    const editButtons = screen.getAllByRole('button', { name: /modifier/i });
    await userEvent.click(editButtons[0]);

    expect(await screen.findByText(/modifier le type/i)).toBeInTheDocument();
  });

  test('should show error if trying to add a type that already exists', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({}),
    } as Response);

    renderPage();

    const input = screen.getByLabelText(/ajouter un type/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'Fruit');

    const addButton = screen.getByRole('button', { name: /^ajouter$/i });
    await userEvent.click(addButton);

    const confirmButton = await screen.findByRole('button', {
      name: /confirmer/i,
    });
    await userEvent.click(confirmButton);

    expect(await screen.findByText(/existe déjà/i)).toBeInTheDocument();
  });

  test('should show error if edited label is empty', async () => {
    renderPage();

    const editButton = screen.getAllByRole('button', { name: /modifier/i })[0];
    await userEvent.click(editButton);

    const input = screen.getByDisplayValue('Fruit');
    await userEvent.clear(input);

    const confirm = screen.getByRole('button', { name: /confirmer/i });
    await userEvent.click(confirm);

    expect(
      await screen.findByText(/ne peut pas être vide/i),
    ).toBeInTheDocument();
  });

  test('should show error if edited label already exists on another type', async () => {
    renderPage();

    const editButton = screen.getAllByRole('button', { name: /modifier/i })[0];
    await userEvent.click(editButton);

    const input = screen.getByDisplayValue('Fruit');
    await userEvent.clear(input);
    await userEvent.type(input, 'Légume');

    const confirm = screen.getByRole('button', { name: /confirmer/i });
    await userEvent.click(confirm);

    expect(await screen.findByText(/existe déjà/i)).toBeInTheDocument();
  });

  test('should pre-fill the edit dialog with the correct label', async () => {
    renderPage();

    const editButton = screen.getAllByRole('button', { name: /modifier/i })[1];
    await userEvent.click(editButton);

    const input = await screen.findByDisplayValue('Légume');
    expect(input).toBeInTheDocument();
  });

  test('should close the add dialog when clicking cancel', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText(/ajouter un type/i), 'Test');
    await userEvent.click(screen.getByRole('button', { name: /^ajouter$/i }));

    await userEvent.click(
      await screen.findByRole('button', { name: /annuler/i }),
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/veux-tu vraiment ajouter le type/i),
      ).not.toBeInTheDocument();
    });
  });

  test('should close the edit dialog when clicking cancel', async () => {
    renderPage();

    await userEvent.click(
      screen.getAllByRole('button', { name: /modifier/i })[0],
    );
    await userEvent.click(
      await screen.findByRole('button', { name: /annuler/i }),
    );

    await waitFor(() => {
      expect(screen.queryByText(/modifier le type/i)).not.toBeInTheDocument();
    });
  });

  test('should show error if fetch fails when adding a type', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Erreur test'));
    renderPage();

    await userEvent.type(screen.getByLabelText(/ajouter un type/i), 'Test');
    await userEvent.click(screen.getByRole('button', { name: /^ajouter$/i }));
    await userEvent.click(
      await screen.findByRole('button', { name: /confirmer/i }),
    );

    expect(await screen.findByText(/erreur test/i)).toBeInTheDocument();
  });

  test('should show error if fetch fails when editing a type', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Erreur modif'));
    renderPage();

    await userEvent.click(
      screen.getAllByRole('button', { name: /modifier/i })[0],
    );

    const input = screen.getByDisplayValue('Fruit');
    await userEvent.clear(input);
    await userEvent.type(input, 'Autre');

    await userEvent.click(screen.getByRole('button', { name: /confirmer/i }));

    expect(await screen.findByText(/erreur modif/i)).toBeInTheDocument();
  });
});
