import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  NotificationContext,
  NotificationContextProvider,
} from './NotificationContext';
import { UserContext } from './UserContext';
import React from 'react';
import type { UserContextType } from '../types';

const mockUser = {
  email: 'user@test.com',
  token: 'abc123',
};

const mockUserContext: UserContextType = {
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
};

describe('NotificationContextProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test('loads notifications on mount if user is authenticated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 1,
            notificationTitle: 'Test',
            message: 'Ceci est un test',
            notificationDate: new Date().toISOString(),
            status: 'UNREAD',
          },
        ],
      }),
    );

    const Consumer = () => {
      const { notifications } = React.useContext(NotificationContext);
      return <p data-testid="notif-count">{notifications.length}</p>;
    };

    render(
      <UserContext.Provider value={mockUserContext}>
        <NotificationContextProvider>
          <Consumer />
        </NotificationContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('notif-count').textContent).toBe('1');
    });
  });

  test('handles fetch error and logs it', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fetch fail')));

    const Consumer = () => {
      const { notifications } = React.useContext(NotificationContext);
      return <p data-testid="notif-count">{notifications.length}</p>;
    };

    render(
      <UserContext.Provider value={mockUserContext}>
        <NotificationContextProvider>
          <Consumer />
        </NotificationContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('notif-count').textContent).toBe('0');
      expect(errorSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des notifications',
        expect.any(Error),
      );
    });

    errorSpy.mockRestore();
  });

  test('does not call fetchNotifications if user is undefined', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const Consumer = () => {
      const { notifications } = React.useContext(NotificationContext);
      return <p data-testid="notif-count">{notifications.length}</p>;
    };

    render(
      <UserContext.Provider
        value={{ ...mockUserContext, authenticatedUser: undefined }}
      >
        <NotificationContextProvider>
          <Consumer />
        </NotificationContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    errorSpy.mockRestore();
  });

  test('logs error if authenticatedUser has no email when fetching notifications', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const Consumer = () => {
      const { fetchNotifications } = React.useContext(NotificationContext);
      React.useEffect(() => {
        fetchNotifications();
      }, [fetchNotifications]);
      return <div>Consumer</div>;
    };

    render(
      <UserContext.Provider
        value={{
          ...mockUserContext,
          authenticatedUser: undefined,
        }}
      >
        <NotificationContextProvider>
          <Consumer />
        </NotificationContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        "Email de l'utilisateur introuvable.",
      );
    });

    errorSpy.mockRestore();
  });

  test('markAsRead sends PUT request to correct URL', async () => {
    const putSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', putSpy);

    const Consumer = () => {
      const { markAsRead } = React.useContext(NotificationContext);
      React.useEffect(() => {
        markAsRead(123);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <div>Consumer</div>;
    };

    render(
      <UserContext.Provider value={mockUserContext}>
        <NotificationContextProvider>
          <Consumer />
        </NotificationContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith(
        '/api/notifications/123/read',
        expect.any(Object),
      );
    });
  });

  test('markAsRead throws error on failed request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server exploded',
      }),
    );

    const Consumer = () => {
      const { markAsRead } = React.useContext(NotificationContext);
      React.useEffect(() => {
        markAsRead(456).catch((e) =>
          expect(e.message).toMatch(/Failed to mark as read/),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <div>Consumer</div>;
    };

    render(
      <UserContext.Provider value={mockUserContext}>
        <NotificationContextProvider>
          <Consumer />
        </NotificationContextProvider>
      </UserContext.Provider>,
    );
  });

  test('markAllAsRead sends PUT request to correct URL with email', async () => {
    const putSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', putSpy);

    const Consumer = () => {
      const { markAllAsRead } = React.useContext(NotificationContext);
      React.useEffect(() => {
        markAllAsRead('user@test.com');
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <div>Consumer</div>;
    };

    render(
      <UserContext.Provider value={mockUserContext}>
        <NotificationContextProvider>
          <Consumer />
        </NotificationContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith(
        '/api/notifications/read-all?email=user@test.com',
        expect.any(Object),
      );
    });
  });

  test('markAllAsRead throws error on failed request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid email',
      }),
    );

    const Consumer = () => {
      const { markAllAsRead } = React.useContext(NotificationContext);
      React.useEffect(() => {
        markAllAsRead('invalid-email').catch((e) =>
          expect(e.message).toMatch(/Failed to mark as read/),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <div>Consumer</div>;
    };

    render(
      <UserContext.Provider value={mockUserContext}>
        <NotificationContextProvider>
          <Consumer />
        </NotificationContextProvider>
      </UserContext.Provider>,
    );
  });
});
