import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './components/App/index.tsx';
import HomePage from './components/pages/HomePage.tsx';
import RegisterPage from './components/pages/RegisterPage.tsx';
import LoginPage from './components/pages/LoginPage.tsx';
import AccountCreationPage from './components/pages/AccountCreationPage.tsx';
import ProfilePage from './components/pages/ProfilePage.tsx';
import ProductsLotsPage from './components/pages/ProductsLotsPage.tsx';
import EditLotImagePage from './components/pages/EditLotImagePage.tsx';
import VolunteerLoginPage from './components/pages/VolunteerLoginPage.tsx';
import MyReservationPage from './components/pages/MyReservationPage.tsx';
import { ReservationContextProvider } from './contexts/ReservationContext.tsx';
import ProposedLotsPage from './components/pages/ProposedLotsPage.tsx';
import { UserContextProvider } from './contexts/UserContext.tsx';
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes.ts';
import { ProductLotContextProvider } from './contexts/ProductLotContext.tsx';
import { ProductContextProvider } from './contexts/ProductContext.tsx';
import LotCreationPage from './components/pages/LotCreationPage.tsx';
import { ProductTypeContextProvider } from './contexts/ProductTypeContext.tsx';
import LotDetailsPage from './components/pages/LotDetailsPage.tsx';
import ReservationHistoryPage from './components/pages/ReservationHistoryPage.tsx';
import { MyReservationsProvider } from './contexts/MyReservationsContext.tsx';
import ReservationDetailsPage from './components/pages/ReservationDetailsPage.tsx';
import DashboardPage from './components/pages/DashboardPage.tsx';
import NotificationsPage from './components/pages/NotificationPage.tsx';
import { NotificationContextProvider } from './contexts/NotificationContext.tsx';
import ProducersListPage from './components/pages/ProducersListPage.tsx';
import ProducerLotsPage from './components/pages/ProducerLotsPage.tsx';
import { OpenSalesProvider } from './contexts/OpenSalesContext.tsx';
import OpenSalesPage from './components/pages/OpenSalesPage.tsx';
import TypePage from './components/pages/TypePage.tsx';
import ReservationManagementPage from './components/pages/ReservationManagementPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'login',
        element: (
          <ProtectedRoute redirectIfAuthenticated>
            <LoginPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'volunteer',
        element: (
          <ProtectedRoute>
            <VolunteerLoginPage />
          </ProtectedRoute>
        ),
      },

      {
        path: 'account-creation',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']} disallowVolunteer>
            <AccountCreationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'proposed-lots',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']} disallowVolunteer>
            <ProposedLotsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']} disallowVolunteer>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reservations-management',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ReservationManagementPage />
          </ProtectedRoute>
        ),
      },

      {
        path: 'profile',
        element: (
          <ProtectedRoute disallowVolunteer>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      {
        path: 'create-lot',
        element: (
          <ProtectedRoute allowedRoles={['PRODUCER']}>
            <LotCreationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-lots',
        element: (
          <ProtectedRoute allowedRoles={['PRODUCER']}>
            <ProductsLotsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'edit-lot-image/:lotId',
        element: (
          <ProtectedRoute allowedRoles={['PRODUCER']}>
            <EditLotImagePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'lots/:lotId',
        element: <LotDetailsPage />,
      },

      {
        path: 'my-reservation',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <MyReservationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-reservations',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <ReservationHistoryPage />,
          </ProtectedRoute>
        ),
      },
      {
        path: 'reservations/:id',
        element: <ReservationDetailsPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'producers',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']} disallowVolunteer>
            <ProducersListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'producers/lots',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']} disallowVolunteer>
            <ProducerLotsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'product-types',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']} disallowVolunteer>
            <TypePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'open-sale',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <OpenSalesPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserContextProvider>
        <ReservationContextProvider>
          <ProductLotContextProvider>
            <ProductTypeContextProvider>
              <ProductContextProvider>
                <MyReservationsProvider>
                  <NotificationContextProvider>
                    <OpenSalesProvider>
                      <RouterProvider router={router} />
                    </OpenSalesProvider>
                  </NotificationContextProvider>
                </MyReservationsProvider>
              </ProductContextProvider>
            </ProductTypeContextProvider>
          </ProductLotContextProvider>
        </ReservationContextProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
