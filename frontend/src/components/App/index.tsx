import { Outlet, useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import NavBar from '../Navbar';
import { Box, useTheme } from '@mui/material';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';
import { useContext, useEffect } from 'react';

const App = () => {
  const theme = useTheme();

  const { isTokenExpired }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isTokenExpired) {
      navigate('/login');
    }
  }, [isTokenExpired, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundSize: 'cover',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <NavBar />
      <Box
        component="main"
        sx={{
          flex: '1',
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default App;
