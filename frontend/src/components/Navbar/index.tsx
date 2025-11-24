import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';

import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Container,
  Tooltip,
  Badge,
} from '@mui/material';

import {
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

import { UserContext } from '../../contexts/UserContext';
import { UserContextType, UserDetails } from '../../types';
import { ReservationContext } from '../../contexts/ReservationContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { OpenSalesContext } from '../../contexts/OpenSalesContext';

import logo from '../../assets/images/logo.png';

const NavBar = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const { authenticatedUser, clearUser, fetchUserDetails, isVolunteer } =
    useContext<UserContextType>(UserContext);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const { items: reservationItems, clearReservation } =
    useContext(ReservationContext);
  const { items: openSaleItems } = useContext(OpenSalesContext);
  const { notifications } = useContext(NotificationContext);
  const unreadNotifications = notifications
    ? notifications.filter((notif) => notif.status === 'UNREAD').length
    : 0;
  const totalReservationItems = reservationItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const totalOpenSaleItems = openSaleItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserDetails = async () => {
      if (!authenticatedUser) return;
      try {
        const details = await fetchUserDetails();
        setUserDetails(details);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };

    loadUserDetails();
  }, [authenticatedUser, fetchUserDetails]);

  const handleLogout = () => {
    clearReservation();
    clearUser();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ mr: 2, flexGrow: 1 }}>
            <img
              data-testid="logo"
              src={logo}
              alt="Logo"
              style={{ height: 100, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            />
          </Box>

          <Box
            sx={{
              flexGrow: 0,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {!authenticatedUser ? (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Se connecter
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}>
                  S'inscrire
                </Button>
              </>
            ) : (
              <>
                {userDetails?.role === 'CUSTOMER' && (
                  <Button
                    color="inherit"
                    onClick={() => {
                      setAnchorElUser(null);
                      navigate('/my-reservations');
                    }}
                  >
                    Mes réservations
                  </Button>
                )}
                {userDetails?.role === 'CUSTOMER' && (
                  <IconButton
                    onClick={() => navigate('/my-reservation')}
                    sx={{ ml: 2 }}
                  >
                    <Badge
                      badgeContent={totalReservationItems}
                      color="warning"
                      max={99}
                    >
                      <ShoppingCartIcon fontSize="large" />
                    </Badge>
                  </IconButton>
                )}

                {userDetails?.role === 'PRODUCER' && (
                  <>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/my-lots')}
                    >
                      Mes lots
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/create-lot')}
                    >
                      Proposer un lot
                    </Button>
                  </>
                )}

                {userDetails?.role === 'MANAGER' && !isVolunteer && (
                  <>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/account-creation')}
                    >
                      créer un compte
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/proposed-lots')}
                    >
                      Propositions de lots
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/reservations-management')}
                    >
                      Réservations
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/dashboard')}
                    >
                      Tableau de bord
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/producers')}
                    >
                      Producteurs
                    </Button>
                  </>
                )}
                {(userDetails?.role === 'MANAGER' || isVolunteer) && (
                  <>
                    <IconButton
                      onClick={() => navigate('/open-sale')}
                      sx={{ ml: 2 }}
                    >
                      <Badge
                        badgeContent={totalOpenSaleItems}
                        color="success"
                        max={99}
                      >
                        <ShoppingCartIcon fontSize="large" />
                      </Badge>
                    </IconButton>
                  </>
                )}

                {!isVolunteer && (
                  <>
                    <Tooltip title="Menu utilisateur">
                      <IconButton
                        data-testid="user-menu-button"
                        onClick={(e) => setAnchorElUser(e.currentTarget)}
                        sx={{ p: 0 }}
                      >
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                        >
                          <Badge
                            badgeContent={unreadNotifications}
                            color="success"
                            max={99}
                          >
                            <PersonIcon fontSize="large" />
                          </Badge>
                          <Typography variant="caption">
                            {userDetails?.firstname ??
                              authenticatedUser?.email ??
                              ''}
                          </Typography>
                        </Box>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorElUser}
                      open={Boolean(anchorElUser)}
                      onClose={() => setAnchorElUser(null)}
                    >
                      <MenuItem
                        onClick={() => {
                          setAnchorElUser(null);
                          navigate('/profile');
                        }}
                      >
                        <AccountCircleIcon sx={{ mr: 1 }} /> Profil
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          setAnchorElUser(null);
                          navigate('/notifications');
                        }}
                      >
                        <Badge
                          badgeContent={unreadNotifications}
                          color="warning"
                          max={99}
                          sx={{ mr: 1 }}
                        >
                          🛎️
                        </Badge>
                        Notifications
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          setAnchorElUser(null);
                          handleLogout();
                        }}
                      >
                        <LogoutIcon sx={{ mr: 1 }} /> Déconnexion
                      </MenuItem>
                    </Menu>
                  </>
                )}

                {isVolunteer && (
                  <>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/reservations-management')}
                    >
                      Réservations
                    </Button>
                    <Tooltip title="Menu bénévole">
                      <IconButton
                        onClick={(e) => setAnchorElUser(e.currentTarget)}
                        sx={{ p: 0 }}
                      >
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                        >
                          <PersonIcon fontSize="large" />
                          <Typography variant="caption">Bénévole</Typography>
                        </Box>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorElUser}
                      open={Boolean(anchorElUser)}
                      onClose={() => setAnchorElUser(null)}
                    >
                      <MenuItem
                        onClick={() => {
                          setAnchorElUser(null);
                          handleLogout();
                        }}
                      >
                        <LogoutIcon sx={{ mr: 1 }} /> Déconnexion
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
