import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProductContext, ProductContextProvider } from './ProductContext';
import React from 'react';

describe('ProductContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('handles fetch error for availableProducts', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject(new Error('fail available')),
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            json: () => Promise.resolve([]),
          }),
        ),
    );

    const Consumer = () => {
      const { availableProducts } = React.useContext(ProductContext);
      return <p data-testid="available-count">{availableProducts.length}</p>;
    };

    render(
      <ProductContextProvider>
        <Consumer />
      </ProductContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('available-count').textContent).toBe('0');
      expect(errorSpy).toHaveBeenCalled();
    });

    errorSpy.mockRestore();
  });

  test('handles fetch error for recentProducts', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            json: () => Promise.resolve([]),
          }),
        )
        .mockImplementationOnce(() => Promise.reject(new Error('fail recent'))),
    );

    const Consumer = () => {
      const { recentProducts } = React.useContext(ProductContext);
      return <p data-testid="recent-count">{recentProducts.length}</p>;
    };

    render(
      <ProductContextProvider>
        <Consumer />
      </ProductContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('recent-count').textContent).toBe('0');
      expect(errorSpy).toHaveBeenCalled();
    });

    errorSpy.mockRestore();
  });
});
