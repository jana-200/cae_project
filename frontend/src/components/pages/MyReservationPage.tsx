import { useState, useContext, SyntheticEvent, useEffect } from 'react';
import {
  Card,
  Button,
  CardContent,
  Container,
  Stack,
  Typography,
  Box,
  TextField,
  MenuItem,
  Select,
  Alert,
  Divider,
} from '@mui/material';
import { ReservationContext } from '../../contexts/ReservationContext';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const getNextTuesdaysAndThursdays = (): string[] => {
  const today = new Date();
  const dates: string[] = [];
  const current = new Date(today);
  let count = 0;

  while (count < 4) {
    const day = current.getDay();
    if (day === 2 || day === 4) {
      if (current > today) {
        dates.push(current.toISOString().split('T')[0]);
        count++;
      }
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const ReservationPage = () => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [recoveryDate, setRecoveryDate] = useState('');
  const { items, submitReservation, updateQuantity, removeFromReservation } =
    useContext(ReservationContext);
  const [error, setError] = useState('');

  const { authenticatedUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    setAvailableDates(getNextTuesdaysAndThursdays());
  }, []);

  const handleReservation = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!recoveryDate) {
      setError('Veuillez sélectionner une date de récupération.');
      return;
    }
    if (authenticatedUser) {
      try {
        const success = await submitReservation(
          recoveryDate,
          authenticatedUser,
        );
        if (success) {
          navigate('/my-reservations');

          try {
            await fetch('/api/notifications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                notifiedUser: authenticatedUser.email,
                notificationTitle: 'Réservation effectuée',
                message: `La réservation a été effectuée avec succès pour le ${new Date(
                  recoveryDate,
                ).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}.`,
              }),
            });
          } catch (error) {
            console.error("Erreur lors de l'envoi de la notification :", error);
          }
        } else {
          setError('Une erreur est survenue lors de la réservation.');
        }
      } catch (err) {
        console.error('ReservationPage::handleReservation::error: ', err);
        setError('Une erreur est survenue lors de la réservation.');
      }
    }
  };

  const total = items.reduce(
    (acc, item) => acc + item.product.unitPrice * item.quantity,
    0,
  );

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ textAlign: 'center', mb: 4 }}
        >
          Ma réservation
        </Typography>

        {items.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: 'text.secondary' }}
          >
            Votre panier est vide.
          </Typography>
        ) : (
          <>
            <Stack spacing={2} sx={{ mb: 4 }}>
              {items.map(({ product, quantity }) => (
                <Card
                  key={product.lotId}
                  elevation={2}
                  sx={{ borderRadius: 3 }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                      }}
                    >
                      <img
                        src={product.imageUrl || '/placeholder.jpg'}
                        alt={product.productLabel}
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 12,
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          navigate(`/lots/${product.lotId}`);
                        }}
                      />
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 150,
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scale(1.01)',
                          },
                        }}
                        onClick={() => {
                          navigate(`/lots/${product.lotId}`);
                        }}
                      >
                        <Typography variant="body1" fontWeight={600}>
                          {product.productLabel}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {product.productDescription}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          prix à l'unité : {product.unitPrice.toFixed(2)} € /{' '}
                          {product.productUnit}
                        </Typography>
                      </Box>

                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {(product.unitPrice * quantity).toFixed(2)} €
                      </Typography>
                      <TextField
                        type="number"
                        value={String(quantity)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const parsed = Number(raw);
                          const safe = raw === '' ? 1 : parsed;
                          updateQuantity(product.lotId, safe);
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          const safe = isNaN(val)
                            ? 1
                            : Math.min(
                                Math.max(1, val),
                                product.remainingQuantity,
                              );
                          updateQuantity(product.lotId, safe);
                        }}
                        size="small"
                        inputProps={{ min: 1, max: product.remainingQuantity }}
                        error={quantity > product.remainingQuantity}
                        helperText={
                          <span
                            style={{
                              visibility: 'visible',
                              minHeight: 20,
                              display: 'block',
                              whiteSpace: 'nowrap',
                              fontSize: '0.75rem',
                              color:
                                quantity > product.remainingQuantity
                                  ? '#d32f2f'
                                  : 'transparent',
                            }}
                          >
                            {quantity > product.remainingQuantity
                              ? `Stock max: ${product.remainingQuantity} ${product.productUnit}`
                              : '—'}
                          </span>
                        }
                        sx={{
                          mt: 2.8,
                          width: 90,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            fontSize: '0.85rem',
                            backgroundColor: '#f5f5f5',
                            px: 1,
                          },
                        }}
                      />

                      <IconButton
                        onClick={() => removeFromReservation(product.lotId)}
                        data-testid="remove-item"
                        aria-label="Supprimer"
                        sx={{
                          '&:hover': {
                            color: 'error.main',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3,
                p: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                Veuillez sélectionner une date de récupération parmi celles
                disponibles :
              </Typography>

              <Select
                value={recoveryDate}
                onChange={(e) => setRecoveryDate(e.target.value)}
                size="small"
                displayEmpty
                sx={{
                  minWidth: 150,
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: 1,
                }}
              >
                <MenuItem value="" disabled>
                  Choisissez une date
                </MenuItem>
                {availableDates.map((date) => (
                  <MenuItem key={date} value={date}>
                    {new Date(date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {error && (
              <Alert severity="error" data-testid="error-alert" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mt: 2,
                p: 2,
                borderRadius: 3,
              }}
            >
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{ flexGrow: 1, color: 'text.primary' }}
              >
                Total : {total.toFixed(2)} €
              </Typography>

              <Button
                variant="contained"
                disabled={!recoveryDate}
                onClick={handleReservation}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 3,
                  backgroundColor: '#AAB399',
                  color: 'black',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Réserver
              </Button>
            </Box>
          </>
        )}
      </>
    </Container>
  );
};

export default ReservationPage;
