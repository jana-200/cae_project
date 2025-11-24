import { useState, SyntheticEvent, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  TextField,
  Container,
  useTheme,
  Typography,
  AlertTitle,
  Checkbox,
} from '@mui/material';
import { UserContextType, Credentials } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import './index.css';

const LoginPage = () => {
  const {
    loginUser,
    fetchUserDetails,
    authenticatedUser,
    fetchIsDeactivated,
  }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);

  useEffect(() => {
    if (location.state?.justRegistered) {
      setShowSuccess(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const redirectAfterLogin = async () => {
      if (!authenticatedUser) return;
      try {
        const userDetails = await fetchUserDetails();

        if (userDetails.role === 'PRODUCER') {
          navigate('/my-lots');
        } else if (userDetails.role === 'MANAGER') {
          navigate('/proposed-lots');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Erreur lors du fetchUserDetails:', error);
      }
    };

    redirectAfterLogin();
  }, [authenticatedUser, fetchUserDetails, navigate]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const credentials: Credentials = { email, password };

    try {
      const deactivated = await fetchIsDeactivated(email);
      setIsDeactivated(deactivated);
      if (deactivated) {
        setError(
          "Votre compte a été désactivé. Veuillez contacter l'administrateur.",
        );
        return;
      }

      await loginUser(credentials, remember);
    } catch (err) {
      console.error('LoginPage::error: ', err);
      if (!isDeactivated) {
        setError('Email ou mot de passe incorrect');
      }
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 3,
        paddingBottom: 2,
      }}
    >
      {showSuccess && (
        <Box sx={{ width: 800, mb: 3 }}>
          <Alert severity="success">
            <AlertTitle>Inscription réussie !</AlertTitle>
            Vous pouvez maintenant vous connecter avec vos identifiants.
          </Alert>
        </Box>
      )}

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
        }}
      >
        <Typography variant="h5" gutterBottom>
          Connexion
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
            required
            color="primary"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
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
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  color="primary"
                />
              }
              label="Se souvenir de moi"
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Se connecter
          </Button>
        </form>

        {error && (
          <Box sx={{ mt: 2 }} data-testid="error-alert">
            <Alert severity="error" role="alert">
              {error}
            </Alert>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;
