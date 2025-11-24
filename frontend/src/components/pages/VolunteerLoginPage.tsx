import { useState, SyntheticEvent, useContext } from 'react';
import {
  Alert,
  Box,
  Button,
  TextField,
  Container,
  useTheme,
  Typography,
} from '@mui/material';
import { UserContextType, Credentials } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import './index.css';

const VolunteerLoginPage = () => {
  const { loginUser }: UserContextType = useContext(UserContext);
  const theme = useTheme();

  const email = 'volunteer@terroircie.be';
  const [password, setPassword] = useState('');
  const [remember] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const credentials: Credentials = { email, password };

    try {
      await loginUser(credentials, remember);
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      console.error('LoginPage::error: ', err);
      const error = err as Error;
      if (error.message.includes('401')) {
        setError('Mot de passe invalide. Veuillez réessayer.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'auto',
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      {isLoggedIn ? (
        <Box
          sx={{
            width: 800,
            padding: 5,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: theme.palette.secondary.main,
            border: 2,
            borderColor: theme.palette.primary.main,
            textAlign: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: theme.palette.secondary.contrastText,
              fontWeight: 'bold',
            }}
          >
            Connexion réussie !
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.secondary.contrastText,
              fontSize: '1.1rem',
              mt: 2,
            }}
          >
            Vous êtes maintenant connecté(e) en tant que bénévole. Bienvenue sur
            votre espace !
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            width: 800,
            padding: 5,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: theme.palette.secondary.main,
            border: 2,
            borderColor: theme.palette.primary.main,
            textAlign: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: theme.palette.secondary.contrastText }}
          >
            Veuillez vous connecter pour accéder à l'espace bénévole
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              disabled
              color="primary"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                label: { color: theme.palette.secondary.contrastText },
              }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Mot de passe"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              required
              color="primary"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                label: { color: theme.palette.secondary.contrastText },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.3, fontWeight: 'bold', fontSize: '1rem' }}
            >
              Se connecter
            </Button>
          </form>

          {error && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error" role="alert">
                {error}
              </Alert>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default VolunteerLoginPage;
