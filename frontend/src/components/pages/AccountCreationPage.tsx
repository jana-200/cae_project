import { useState, SyntheticEvent, useContext } from 'react';
import { User, UserContextType } from '../../types';
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
import { ErrorOutline } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Tooltip } from '@mui/material';
import './index.css';
import { getAuthenticatedUser } from '../../utils/session';
import { useNavigate } from 'react-router-dom';

const generateValidPassword = () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';

  const getRandom = (str: string) =>
    str[Math.floor(Math.random() * str.length)];

  const password = [
    getRandom(lower),
    getRandom(upper),
    getRandom(numbers),
    getRandom(symbols),
  ];

  const all = lower + upper + numbers + symbols;
  while (password.length < 6) {
    password.push(getRandom(all));
  }

  return password.sort(() => 0.5 - Math.random()).join('');
};

const AccountCreationPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext);
  const theme = useTheme();
  const navigate = useNavigate();

  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [poBox, setPoBox] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Belgique');
  const [errors, setErrors] = useState<string[]>([]);
  const [successfulRegistration, setSuccessfulRegistration] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [role, setRole] = useState<'PRODUCER' | 'MANAGER'>('MANAGER');
  const [companyName, setCompanyName] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch (err) {
      console.error('Erreur lors de la copie', err);
    }
  };
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
    setFieldErrors(newFieldErrors);
    return errors;
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSuccessfulRegistration(false);
      return;
    }

    const newUser: User = {
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

    if (role === 'PRODUCER') {
      newUser.companyName = companyName;
    }
    if (role === 'MANAGER') {
      const authenticatedUser = getAuthenticatedUser();
      newUser.accountCreatorManager = authenticatedUser
        ? authenticatedUser.email
        : '';
    }
    try {
      await registerUser(newUser);
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
      setSuccessfulRegistration(true);
      setErrors([]);
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
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      <Box
        sx={{
          width: 1000,
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
                select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as 'PRODUCER' | 'MANAGER')
                }
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                label="Rôle"
                fullWidth
                variant="outlined"
                margin="normal"
              >
                <option value="MANAGER">Gestionnaire</option>
                <option value="PRODUCER">Producteur</option>
              </TextField>
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

            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
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
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>

            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
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
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>

            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
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
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
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

            {role === 'PRODUCER' && (
              <Box sx={{ width: { xs: '100%' } }}>
                <TextField
                  fullWidth
                  margin="normal"
                  id="companyName"
                  name="companyName"
                  label="Nom de l’entreprise"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  sx={{
                    input: { color: theme.palette.secondary.contrastText },
                  }}
                />
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const generated = generateValidPassword();
              setPassword(generated);
            }}
            fullWidth
            sx={{ mt: 2 }}
            type="submit"
          >
            Soumettre
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
      {successfulRegistration && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1300,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              padding: 4,
              borderRadius: 2,
              textAlign: 'center',
              boxShadow: 6,
              width: 800,
            }}
          >
            <Typography
              data-testid="success-title"
              variant="h6"
              gutterBottom
              sx={{ mb: 3 }}
            >
              Inscription réussie !
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, fontWeight: 'bold' }}>
              Login : {email}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, fontWeight: 'bold' }}>
              Mot de passe : {password}
              <Tooltip title="Copier le mot de passe">
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{ ml: 1 }}
                  data-testid="copy-password-button"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {copied && (
                <Box component="span" sx={{ fontSize: 12, color: 'green' }}>
                  Copié !
                </Box>
              )}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSuccessfulRegistration(false);
                navigate('/');
              }}
            >
              Revenir à la page d'accueil
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default AccountCreationPage;
