import { describe, expect, vi, beforeEach, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../Navbar', () => ({
  default: () => <div data-testid="navbar" />,
}));
vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('App component', () => {
  const mockContext: UserContextType = {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders NavBar, Outlet and Footer when token is valid', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <UserContext.Provider value={{ ...mockContext, isTokenExpired: false }}>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<div data-testid="outlet-content" />} />
            </Route>
          </Routes>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('navbar')).toBeTruthy();
    expect(screen.getByTestId('footer')).toBeTruthy();
    expect(screen.getByTestId('outlet-content')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('redirects to /login if token is expired', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <UserContext.Provider value={{ ...mockContext, isTokenExpired: true }}>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<div data-testid="outlet-content" />} />
            </Route>
          </Routes>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
