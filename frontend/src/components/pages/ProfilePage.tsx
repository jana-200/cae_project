import {
  Box,
  Container,
  TextField,
  Typography,
  useTheme,
  Button,
  Modal,
  CircularProgress,
  Fade,
} from '@mui/material';
import { useContext, useState, useEffect } from 'react';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType, UserDetails } from '../../types';

const ProfilePage = () => {
  const theme = useTheme();
  const { changePassword, fetchUserDetails, authenticatedUser } =
    useContext<UserContextType>(UserContext);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useEffect(() => {
    const loadUserDetails = async () => {
      if (!authenticatedUser) {
        return;
      }
      try {
        const details = await fetchUserDetails();
        setUserDetails(details);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };

    loadUserDetails();
  }, [authenticatedUser, fetchUserDetails]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = async () => {
    setCurrentPasswordError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let isValid = true;

    if (!currentPassword) {
      setCurrentPasswordError('Veuillez entrer votre mot de passe actuel.');
      isValid = false;
    }

    if (!newPassword) {
      setPasswordError('Veuillez entrer un nouveau mot de passe.');
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      setPasswordError(
        'Le mot de passe doit contenir au minimum 6 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux.',
      );
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Veuillez confirmer votre nouveau mot de passe.');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas.');
      isValid = false;
    }

    if (!isValid) return;

    try {
      await changePassword(currentPassword, newPassword);
      handleClose();
      alert('Mot de passe modifié avec succès.');
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            notifiedUser: authenticatedUser?.email,
            notificationTitle: 'Mot de passe modifié',
            message: `Votre mot de passe a été modifié avec succès.`,
          }),
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
      }
    } catch (err) {
      console.error('Erreur lors du changement de mot de passe:', err);
      setCurrentPasswordError('Le mot de passe actuel est incorrect.');
    }
  };

  if (!userDetails) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        marginTop: 1,
        marginBottom: 2,
      }}
    >
      <Box
        sx={{
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.secondary.main,
          border: 2,
          borderColor: theme.palette.primary.main,
          textAlign: 'center',
          width: '90%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 1,
            justifyContent: 'center',
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 45 }} />
          <Typography variant="h5">Mon Profil</Typography>
        </Box>
        {userDetails.role === 'PRODUCER' && userDetails.companyName && (
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: theme.palette.primary.main,
              mt: 1,
              mb: 2,
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {userDetails.companyName}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            fullWidth
            label="Prénom"
            value={userDetails.firstname}
            disabled
            sx={{ flex: 1 }}
          />
          <TextField
            fullWidth
            label="Nom"
            value={userDetails.lastname}
            disabled
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
          <TextField
            fullWidth
            label="Adresse email"
            value={userDetails.email}
            disabled
            sx={{ flex: 1 }}
          />
          <TextField
            fullWidth
            label="Numéro de téléphone"
            value={userDetails.phoneNumber}
            disabled
            sx={{ flex: 1 }}
          />
        </Box>
        <Box
          sx={{
            padding: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Adresse
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Rue"
              value={userDetails.address.street}
              disabled
              sx={{ flex: 2 }}
            />
            <TextField
              label="N°"
              value={userDetails.address.number}
              disabled
              sx={{ flex: 0.5 }}
            />
            <TextField
              label="Boîte"
              value={userDetails.address.poBox || ''}
              disabled
              sx={{ flex: 0.5 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
            <TextField
              label="Code postal"
              value={userDetails.address.postalCode}
              disabled
              sx={{ flex: 1 }}
            />
            <TextField
              label="Commune"
              value={userDetails.address.city}
              disabled
              sx={{ flex: 2 }}
            />
          </Box>

          <Box sx={{ marginTop: 2 }}>
            <TextField
              fullWidth
              label="Pays"
              value={userDetails.address.country}
              disabled
            />
          </Box>
          <Box sx={{ marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Modifier mon mot de passe
            </Button>
          </Box>
        </Box>
        <Modal
          open={open}
          onClose={handleClose}
          closeAfterTransition
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Fade in={open}>
            <Box
              component="form"
              data-testid="change-password-form"
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordChange();
              }}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: 320, sm: 400 },
                bgcolor: 'background.paper',
                borderRadius: 4,
                boxShadow: 24,
                p: 4,
                textAlign: 'center',
              }}
            >
              <LockIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />

              <Typography
                id="modal-title"
                variant="h6"
                component="h2"
                sx={{ mb: 2 }}
              >
                Modifier votre mot de passe
              </Typography>

              <TextField
                fullWidth
                label="Mot de passe actuel"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                margin="normal"
                error={!!currentPasswordError}
                helperText={currentPasswordError}
              />
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                error={!!passwordError}
                helperText={passwordError}
              />
              <TextField
                fullWidth
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 3,
                  gap: 2,
                }}
              >
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ borderRadius: 3, textTransform: 'none' }}
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ borderRadius: 3, textTransform: 'none' }}
                >
                  Confirmer
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Container>
  );
};

export default ProfilePage;
