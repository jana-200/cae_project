import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Stack,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { ReservationContext } from '../../contexts/ReservationContext';
import { ReservationInfo, UserContextType } from '../../types';

import { UserContext } from '../../contexts/UserContext';

const ITEMS_PER_PAGE = 15;

const ReservationManagementPage = () => {
  const { fetchAllReservations, updateReservationState } =
    useContext(ReservationContext);
  const [reservations, setReservations] = useState<ReservationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { authenticatedUser } = useContext<UserContextType>(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    const loadReservations = async () => {
      if (!authenticatedUser) {
        return;
      }
      try {
        const data = await fetchAllReservations();
        setReservations(data);
      } catch (err) {
        setError('Erreur lors de la récupération des réservations');
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const sortedReservations = [...reservations].sort((a, b) => {
    if (a.state === 'RESERVED' && b.state !== 'RESERVED') return -1;
    if (a.state !== 'RESERVED' && b.state === 'RESERVED') return 1;
    return (
      new Date(b.reservationDate).getTime() -
      new Date(a.reservationDate).getTime()
    );
  });

  const paginatedReservations = sortedReservations.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des réservations...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const handleUpdateState = async (reservationId: number, newState: string) => {
    try {
      await updateReservationState(reservationId, newState);

      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === reservationId ? { ...r, state: newState } : r,
        ),
      );

      const reservation = reservations.find(
        (r) => r.reservationId === reservationId,
      );
      const email = reservation?.customerEmail;
      if (!email) return;

      let notificationTitle = '';
      let message = '';

      if (newState === 'ABANDONED') {
        notificationTitle = 'Réservation abandonnée';
        message = `Vous n'êtes pas venu récupérer votre réservation n°${reservationId}.`;
      } else if (newState === 'RETRIEVED') {
        notificationTitle = 'Réservation récupérée';
        message = `Votre réservation n°${reservationId} a été récupérée avec succès.`;
      } else {
        return;
      }
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          notifiedUser: email,
          notificationTitle,
          message,
        }),
      });
    } catch (err) {
      alert('Échec de la mise à jour de la réservation.');
      console.error("Erreur lors de l'envoi de la notification :", err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h6" fontWeight="bold" textAlign="center" mb={4}>
        Réservations des clients
      </Typography>
      {reservations.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          Aucune réservation trouvée.
        </Typography>
      ) : (
        <>
          <Stack spacing={2}>
            {paginatedReservations.map((reservation) => (
              <Card
                key={reservation.reservationId}
                elevation={1}
                sx={{
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f7f7f7',
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    cursor: 'pointer',
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexWrap: 'nowrap',
                    }}
                  >
                    <Box
                      sx={{ flexGrow: 1, cursor: 'pointer' }}
                      onClick={() =>
                        navigate(`/reservations/${reservation.reservationId}`)
                      }
                    >
                      <Typography fontWeight={600}>
                        Réservation n°{reservation.reservationId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        faite le{' '}
                        {new Date(
                          reservation.reservationDate,
                        ).toLocaleDateString('fr-FR')}
                      </Typography>
                      {reservation.state === 'RESERVED' && (
                        <Typography variant="body2" color="text.secondary">
                          à récupérer le{' '}
                          {new Date(
                            reservation.recoveryDate,
                          ).toLocaleDateString('fr-FR')}
                        </Typography>
                      )}
                      {reservation.state === 'RETRIEVED' && (
                        <Typography variant="body2" color="text.secondary">
                          récupérée le{' '}
                          {new Date(
                            reservation.recoveryDate,
                          ).toLocaleDateString('fr-FR')}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        par {reservation.customerLastname}{' '}
                        {reservation.customerFirstname}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.secondary"
                      sx={{ minWidth: 80, textAlign: 'right' }}
                    >
                      {reservation.totalPrice.toFixed(2)} €
                    </Typography>

                    {reservation.state === 'RESERVED' ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() =>
                            handleUpdateState(
                              reservation.reservationId,
                              'ABANDONED',
                            )
                          }
                          sx={{
                            textTransform: 'none',
                            backgroundColor: '#FFCDD2',
                            color: '#B71C1C',
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#EF9A9A' },
                          }}
                        >
                          Abandonnée
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() =>
                            handleUpdateState(
                              reservation.reservationId,
                              'RETRIEVED',
                            )
                          }
                          sx={{
                            textTransform: 'none',
                            backgroundColor: '#C8E6C9',
                            color: '#1B5E20',
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#A5D6A7' },
                          }}
                        >
                          Récupérée
                        </Button>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="text.secondary"
                        sx={{ minWidth: 100, textAlign: 'right' }}
                      >
                        {reservation.state === 'CANCELED'
                          ? 'Annulée par le client'
                          : reservation.state === 'RETRIEVED'
                            ? 'Récupérée'
                            : 'Abandonnée'}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={Math.ceil(reservations.length / ITEMS_PER_PAGE)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default ReservationManagementPage;
