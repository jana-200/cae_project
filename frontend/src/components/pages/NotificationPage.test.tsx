import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import NotificationsPage from './NotificationPage';

import { NotificationContext } from '../../contexts/NotificationContext';
import { UserContext } from '../../contexts/UserContext';

const fetchNotificationsMock = vi.fn();
const markAsReadMock = vi.fn();
const markAllAsReadMock = vi.fn();

const mockUserContextValue = {
  authenticatedUser: { email: 'user@test.com', token: 'faketoken' },
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  checkUserAuthentication: vi.fn(),
  logoutUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  isTokenExpired: false,
  changePassword: vi.fn(),
  fetchUserDetails: vi.fn(),
  isVolunteer: false,
  fetchIsDeactivated: vi.fn(),
};

const mockNotificationContextValue = {
  notifications: [
    {
      id: 1,
      notificationTitle: 'Nouvelle commande',
      message: 'Une nouvelle commande a été passée.',
      notificationDate: new Date().toISOString(),
      status: 'UNREAD' as 'UNREAD' | 'READ',
    },
  ],
  markAsRead: markAsReadMock,
  markAllAsRead: markAllAsReadMock,
  fetchNotifications: fetchNotificationsMock,
};

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('displays the notification and marks it as read on click', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider value={mockNotificationContextValue}>
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const cards = screen.getAllByText(/Nouvelle commande/i);
    fireEvent.click(cards[0]);

    await waitFor(() => {
      expect(markAsReadMock).toHaveBeenCalledWith(1);
    });
  });

  test('clicking "Mark all as read" triggers markAllAsRead', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider value={mockNotificationContextValue}>
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', {
      name: /Marquer tout comme lu/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(markAllAsReadMock).toHaveBeenCalledWith('user@test.com');
    });
  });

  test('displays a message when there are no notifications', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider
            value={{
              ...mockNotificationContextValue,
              notifications: [],
            }}
          >
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/Aucune notification pour le moment/i),
    ).toBeTruthy();
  });

  test('does nothing if authenticatedUser is undefined', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider
          value={{ ...mockUserContextValue, authenticatedUser: undefined }}
        >
          <NotificationContext.Provider value={mockNotificationContextValue}>
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', {
      name: /Marquer tout comme lu/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(markAllAsReadMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error if markAsRead fails', async () => {
    markAsReadMock.mockRejectedValueOnce(new Error('Erreur simulée'));

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider value={mockNotificationContextValue}>
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByText(/Nouvelle commande/i)[0]);

    await waitFor(() => {
      expect(markAsReadMock).toHaveBeenCalled();
    });
  });

  test('does not trigger markAsRead for a read notification', async () => {
    const readNotif = {
      ...mockNotificationContextValue.notifications[0],
      status: 'READ' as 'UNREAD' | 'READ',
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider
            value={{
              ...mockNotificationContextValue,
              notifications: [readNotif],
            }}
          >
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByText(/Nouvelle commande/i)[0]);

    await waitFor(() => {
      expect(markAsReadMock).not.toHaveBeenCalled();
    });
  });

  test('calls fetchNotifications on load if user is authenticated', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider value={mockNotificationContextValue}>
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(fetchNotificationsMock).toHaveBeenCalled();
  });

  test('calls handleMarkAsRead and fetchNotifications', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider value={mockNotificationContextValue}>
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByText(/Nouvelle commande/i)[0]);

    await waitFor(() => {
      expect(markAsReadMock).toHaveBeenCalledWith(1);
      expect(fetchNotificationsMock).toHaveBeenCalled();
    });
  });

  test('calls fetchNotifications on load', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider value={mockNotificationContextValue}>
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(fetchNotificationsMock).toHaveBeenCalled();
    });
  });

  test('displays an error if markAllAsRead fails', async () => {
    const failingMarkAll = vi.fn(() => Promise.reject(new Error('échec')));

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider
            value={{
              ...mockNotificationContextValue,
              markAllAsRead: failingMarkAll,
            }}
          >
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Marquer tout comme lu/i }),
    );

    await waitFor(() => {
      expect(failingMarkAll).toHaveBeenCalled();
    });
  });

  test('changes style on hover over a notification', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <NotificationContext.Provider value={mockNotificationContextValue}>
            <NotificationsPage />
          </NotificationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId('notification-card-1');
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
  });
});
