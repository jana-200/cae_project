import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  ProductTypeContext,
  ProductTypeContextProvider,
} from './ProductTypeContext';
import { ProductType } from '../types';
import React from 'react';

const mockProductTypes: ProductType[] = [
  { typeId: 1, label: 'Légume' },
  { typeId: 2, label: 'Fruit' },
];

describe('ProductTypeContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('fetchProductTypes sets productTypes correctly', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockProductTypes),
      }),
    ) as unknown as typeof fetch;

    const ConsumerComponent = () => {
      const { productTypes } = React.useContext(ProductTypeContext);
      return (
        <ul>
          {productTypes.map((type) => (
            <li key={type.typeId}>{type.label}</li>
          ))}
        </ul>
      );
    };

    render(
      <ProductTypeContextProvider>
        <ConsumerComponent />
      </ProductTypeContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Légume')).toBeTruthy();
      expect(screen.getByText('Fruit')).toBeTruthy();
    });
  });

  test('fetchProductTypes handles fetch error gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Fetch error')),
    ) as unknown as typeof fetch;

    const ConsumerComponent = () => {
      const { productTypes } = React.useContext(ProductTypeContext);
      return <div data-testid="count">{productTypes.length}</div>;
    };

    render(
      <ProductTypeContextProvider>
        <ConsumerComponent />
      </ProductTypeContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('0');
    });
  });

  test('fetchProductTypes handles invalid format', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ invalid: true }),
      }),
    ) as unknown as typeof fetch;

    const ConsumerComponent = () => {
      const { productTypes } = React.useContext(ProductTypeContext);
      return <div data-testid="count">{productTypes.length}</div>;
    };

    render(
      <ProductTypeContextProvider>
        <ConsumerComponent />
      </ProductTypeContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('0');
      expect(warnSpy).toHaveBeenCalledWith('Types mal formatés :', {
        invalid: true,
      });
    });

    warnSpy.mockRestore();
  });
});
