import { useState, SyntheticEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
  Container,
  useTheme,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import './index.css';
import { ErrorOutline } from '@mui/icons-material';

const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('04');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [poBox, setPoBox] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Belgique');
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [successfulRegistration, setSuccessfulRegistration] = useState(false);
  const [role] = useState<'CUSTOMER' | 'PRODUCER' | 'MANAGER'>('CUSTOMER');

  const validateForm = () => {
    const errors: string[] = [];
    const newFieldErrors: { [key: string]: boolean } = {};
    const strCondition = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([-' ][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
    const nbCondition = /^\d+$/;
    const phoneCondition = /^(0\d{8,10}|\+\d{8,15})$/;
    const emailCondition = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordCondition =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    if (!title) {
      errors.push('La civilité est requise.');
      newFieldErrors.title = true;
    }
    if (!strCondition.test(lastname)) {
      errors.push('Le nom ne doit pas contenir de chiffres.');
      newFieldErrors.lastname = true;
    }
    if (!strCondition.test(firstname)) {
      errors.push('Le prénom ne doit pas contenir de chiffres.');
      newFieldErrors.firstname = true;
    }
    if (!strCondition.test(street)) {
      errors.push('La rue ne doit pas contenir de chiffres.');
      newFieldErrors.street = true;
    }
    if (!nbCondition.test(postalCode)) {
      errors.push('Le code postal doit être composé uniquement de chiffres.');
      newFieldErrors.postalCode = true;
    }
    if (!strCondition.test(city)) {
      errors.push('La ville doit être composée uniquement de lettres.');
      newFieldErrors.city = true;
    }
    if (!phoneCondition.test(phoneNumber.replace(/\s+/g, ''))) {
      errors.push(
        'Le numéro de téléphone doit commencer par 0 (national) ou + (international), et contenir uniquement des chiffres.',
      );
      newFieldErrors.phoneNumber = true;
    }
    if (!emailCondition.test(email)) {
      errors.push(
        "L'adresse email n'est pas valide. Elle doit suivre ce format : xxx@xxx.xx .",
      );
      newFieldErrors.email = true;
    }
    if (!passwordCondition.test(password)) {
      errors.push(
        'Le mot de passe doit contenir au minimum 6 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux.',
      );
      newFieldErrors.password = true;
    }
    if (password !== confirmPassword) {
      errors.push('Le mot de passe et sa confirmation ne correspondent pas.');
      newFieldErrors.confirmPassword = true;
    }
    setFieldErrors(newFieldErrors);
    return errors;
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newUser = {
      firstname,
      lastname,
      title,
      phoneNumber,
      email,
      password,
      address: {
        street,
        number,
        poBox,
        postalCode,
        city,
        country,
      },
      role,
    };

    try {
      await registerUser(newUser);
      setSuccessfulRegistration(true);
      setErrors([]);
      console.log('RegisterPage::success: ', successfulRegistration);
      navigate('/login', { state: { justRegistered: true } });

      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            notifiedUser: email,
            notificationTitle: 'Inscription réussie',
            message: `Bienvenue ${firstname} ${lastname}, votre compte a été créé avec succés.`,
          }),
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
      }
    } catch (err) {
      const error = err as Error;
      setSuccessfulRegistration(false);
      if (error.message.includes('409')) {
        setErrors(['Adresse email déjà utilisée.']);
      } else {
        setErrors(['Une erreur est survenue. Veuillez réessayer plus tard.']);
      }
      console.error('RegisterPage::error: ', err);
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'auto',
        paddingTop: 2,
        paddingBottom: 2,
      }}
    >
      <Box
        sx={{
          width: 900,
          padding: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.secondary.main,
          border: 1,
          borderColor: theme.palette.primary.main,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Inscription
        </Typography>
        <form onSubmit={handleSubmit} data-testid="account-form">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <FormControl
                component="fieldset"
                required
                error={fieldErrors.title}
                fullWidth
                sx={{ mt: 1, mb: -2, px: 2, py: 1 }}
              >
                <FormLabel component="legend" sx={{ textAlign: 'left' }}>
                  Civilité
                </FormLabel>
                <RadioGroup
                  row
                  aria-label="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                >
                  <FormControlLabel value="Mr" control={<Radio />} label="Mr" />
                  <FormControlLabel
                    value="Mme"
                    control={<Radio />}
                    label="Mme"
                  />
                  <FormControlLabel value="Mx" control={<Radio />} label="Mx" />
                </RadioGroup>
                {fieldErrors.title && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ pl: 2, mt: 0.5, textAlign: 'left' }}
                  >
                    Veuillez sélectionner une civilité.
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                id="lastname"
                name="lastname"
                label="Nom"
                variant="outlined"
                margin="normal"
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                error={fieldErrors.lastname}
                slotProps={{
                  input: {
                    endAdornment: fieldErrors.lastname ? (
                      <InputAdornment position="end">
                        <ErrorOutline color="error" />
                      </InputAdornment>
                    ) : null,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
                required
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>

            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                id="firstname"
                name="firstname"
                label="Prénom"
                variant="outlined"
                margin="normal"
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                error={fieldErrors.firstname}
                slotProps={{
                  input: {
                    endAdornment: fieldErrors.firstname ? (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon color="error" />
                      </InputAdornment>
                    ) : null,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
                required
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>

            <Box
              sx={{ width: '100%', display: 'flex', gap: 2, flexWrap: 'wrap' }}
            >
              <Box sx={{ flex: 2 }}>
                <TextField
                  fullWidth
                  id="street"
                  name="street"
                  label="Rue"
                  variant="outlined"
                  margin="normal"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  error={fieldErrors.street}
                  slotProps={{
                    input: {
                      endAdornment: fieldErrors.street ? (
                        <InputAdornment position="end">
                          <ErrorOutlineIcon color="error" />
                        </InputAdornment>
                      ) : null,
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  required
                  color="primary"
                  sx={{
                    input: { color: theme.palette.secondary.contrastText },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  id="number"
                  name="number"
                  label="Numéro"
                  variant="outlined"
                  margin="normal"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  error={fieldErrors.number}
                  slotProps={{
                    input: {
                      endAdornment: fieldErrors.number ? (
                        <InputAdornment position="end">
                          <ErrorOutlineIcon color="error" />
                        </InputAdornment>
                      ) : null,
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  required
                  color="primary"
                  sx={{
                    input: { color: theme.palette.secondary.contrastText },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  id="poBox"
                  name="poBox"
                  label="Boîte"
                  variant="outlined"
                  margin="normal"
                  value={poBox}
                  onChange={(e) => setPoBox(e.target.value)}
                  error={fieldErrors.poBox}
                  slotProps={{
                    input: {
                      endAdornment: fieldErrors.poBox ? (
                        <InputAdornment position="end">
                          <ErrorOutlineIcon color="error" />
                        </InputAdornment>
                      ) : null,
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  color="primary"
                  sx={{
                    input: { color: theme.palette.secondary.contrastText },
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{ width: '100%', display: 'flex', gap: 2, flexWrap: 'wrap' }}
            >
              <Box sx={{ flex: 2 }}>
                <TextField
                  fullWidth
                  id="country"
                  name="country"
                  label="Pays"
                  variant="outlined"
                  required
                  margin="normal"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  error={fieldErrors.country}
                  slotProps={{
                    input: {
                      endAdornment: fieldErrors.country ? (
                        <InputAdornment position="end">
                          <ErrorOutlineIcon color="error" />
                        </InputAdornment>
                      ) : null,
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  color="primary"
                  sx={{
                    input: { color: theme.palette.secondary.contrastText },
                  }}
                />
              </Box>

              <Box sx={{ flex: 2 }}>
                <TextField
                  fullWidth
                  id="city"
                  name="city"
                  label="Ville"
                  variant="outlined"
                  margin="normal"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={fieldErrors.city}
                  slotProps={{
                    input: {
                      endAdornment: fieldErrors.city ? (
                        <InputAdornment position="end">
                          <ErrorOutlineIcon color="error" />
                        </InputAdornment>
                      ) : null,
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  required
                  color="primary"
                  sx={{
                    input: { color: theme.palette.secondary.contrastText },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  id="postalCode"
                  name="postalCode"
                  label="Code Postal"
                  variant="outlined"
                  margin="normal"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  error={fieldErrors.postalCode}
                  slotProps={{
                    input: {
                      endAdornment: fieldErrors.postalCode ? (
                        <InputAdornment position="end">
                          <ErrorOutlineIcon color="error" />
                        </InputAdornment>
                      ) : null,
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  required
                  color="primary"
                  sx={{
                    input: { color: theme.palette.secondary.contrastText },
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                id="phoneNb"
                name="phoneNb"
                label="Numéro de téléphone"
                variant="outlined"
                margin="normal"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                error={fieldErrors.phoneNumber}
                slotProps={{
                  input: {
                    endAdornment: fieldErrors.phoneNumber ? (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon color="error" />
                      </InputAdornment>
                    ) : null,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
                required
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                slotProps={{
                  input: {
                    endAdornment: fieldErrors.email ? (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon color="error" />
                      </InputAdornment>
                    ) : null,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
                required
                color="primary"
                sx={{
                  input: { color: theme.palette.secondary.contrastText },
                }}
              />
            </Box>

            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Mot de passe"
                variant="outlined"
                margin="normal"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                slotProps={{
                  input: {
                    endAdornment: fieldErrors.password ? (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon color="error" />
                      </InputAdornment>
                    ) : null,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
                required
                color="primary"
                sx={{
                  input: { color: theme.palette.secondary.contrastText },
                }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                id="confirmPswd"
                name="confirmPswd"
                label="Confirmer le mot de passe"
                variant="outlined"
                margin="normal"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors.confirmPassword}
                slotProps={{
                  input: {
                    endAdornment: fieldErrors.confirmPassword ? (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon color="error" />
                      </InputAdornment>
                    ) : null,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
                required
                color="primary"
                sx={{
                  input: { color: theme.palette.secondary.contrastText },
                }}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            type="submit"
          >
            S'inscrire
          </Button>
        </form>

        {errors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {errors.map((error, index) => (
              <Alert
                key={index}
                severity="error"
                role="alert"
                data-testid={`error-${index}`}
              >
                <Typography variant="body2">{error}</Typography>
              </Alert>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default RegisterPage;
