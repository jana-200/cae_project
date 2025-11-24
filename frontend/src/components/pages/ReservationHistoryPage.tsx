import { useEffect, useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
} from '@mui/material';
import { MyReservationsContext } from '../../contexts/MyReservationsContext';
import { useNavigate } from 'react-router-dom';

const ReservationHistoryPage = () => {
  const { reservations, fetchMyReservations } = useContext(
    MyReservationsContext,
  );
  const { authenticatedUser } = useContext(UserContext);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  const handleOpenDialog = (id: number) => {
    setSelectedReservationId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReservationId(null);
  };

  const handleConfirmCancel = async () => {
    if (selectedReservationId !== null) {
      await cancelReservation(selectedReservationId);
      handleCloseDialog();
    }
  };

  const cancelReservation = async (id: number) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: authenticatedUser?.token ?? '',
        },
      });

      if (!response.ok) {
        throw new Error("Échec de l'annulation");
      }

      await fetchMyReservations();
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            notifiedUser: authenticatedUser?.email,
            notificationTitle: 'Réservation annulée',
            message: `Votre réservation n°${id} a été annulée avec succès.`,
          }),
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
    }
  };

  useEffect(() => {
    if (authenticatedUser?.token) {
      fetchMyReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser]);

  const filteredReservations = reservations.filter((res) => {
    if (selectedTab === 0) {
      return res.state === 'RESERVED';
    }

    if (selectedTab === 1) {
      return res.state === 'RETRIEVED';
    }

    if (selectedTab === 2) {
      return res.state === 'CANCELED';
    }
    return res.state === 'ABANDONED';
  });

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        textAlign="center"
        mb={4}
      >
        Mes réservations
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        centered
        sx={{ mb: 3 }}
      >
        <Tab label="En cours" />
        <Tab label="Récupérées" />
        <Tab label="Annulées" />
        <Tab label="Abandonnées" />
      </Tabs>
      {filteredReservations.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          Aucune réservation trouvée
        </Typography>
      ) : (
        <Stack spacing={2}>
          {[...filteredReservations]
            .sort(
              (a, b) =>
                new Date(b.reservationDate).getTime() -
                new Date(a.reservationDate).getTime(),
            )
            .map((res) => (
              <Card
                key={res.reservationId}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#F5F5F5',
                  cursor: 'pointer',
                  transition: '0.2s',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/reservations/${res.reservationId}`)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'nowrap',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight={600}>
                        Réservation n°{res.reservationId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Commandée le{' '}
                        {new Date(res.reservationDate).toLocaleDateString(
                          'fr-FR',
                          {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          },
                        )}
                      </Typography>

                      {res.recoveryDate && (
                        <Typography variant="body2" color="text.secondary">
                          Récupération{' '}
                          {res.state === 'RETRIEVED' ? 'effectuée' : 'prévue'}{' '}
                          le{' '}
                          {new Date(res.recoveryDate).toLocaleDateString(
                            'fr-FR',
                            {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            },
                          )}
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ minWidth: 80, textAlign: 'right' }}
                    >
                      {res.totalPrice.toFixed(2)} €
                    </Typography>

                    {res.state === 'RESERVED' ? (
                      <Button
                        variant="contained"
                        color="error"
                        sx={{
                          backgroundColor: '#ffcdd2',
                          color: '#b71c1c',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          '&:hover': { backgroundColor: '#ef9a9a' },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(res.reservationId);
                        }}
                      >
                        Annuler
                      </Button>
                    ) : res.state === 'CANCELED' ? (
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="error"
                        sx={{ minWidth: 100, textAlign: 'right' }}
                      >
                        Annulée
                      </Typography>
                    ) : res.state === 'RETRIEVED' ? (
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="green"
                        sx={{ minWidth: 100, textAlign: 'right' }}
                      >
                        Récupérée
                      </Typography>
                    ) : res.state === 'ABANDONED' ? (
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="error"
                        sx={{ minWidth: 100, textAlign: 'right' }}
                      >
                        Abandonnée
                      </Typography>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Stack>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action
            est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleConfirmCancel}>Confirmer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReservationHistoryPage;
