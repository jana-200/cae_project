import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  CardActions,
  Divider,
  Box,
  Pagination,
} from '@mui/material';
import { Producer } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import theme from '../../themes';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 9;

const ProducerListPage: React.FC = () => {
  const navigate = useNavigate();
  const { authenticatedUser } = React.useContext(UserContext);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const refreshProducers = async () => {
    setLoading(true);
    await fetchProducers();
    setLoading(false);
  };

  const fetchProducers = async () => {
    try {
      const response = await fetch('api/producers/', {
        headers: {
          Authorization: `${authenticatedUser?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur de récupération des producteurs');
      }

      const data = await response.json();
      setProducers(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération des producteurs.',
      );
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (email: string): Promise<void> => {
    try {
      const response = await fetch(`api/auths/deactivate/?email=${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur désactivation : ${errorText}`);
      }
    } catch (err) {
      console.error('deactivateUser::error', err);
      throw err;
    }
  };

  useEffect(() => {
    if (authenticatedUser) {
      fetchProducers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser]);

  const totalPages = Math.ceil(producers.length / ITEMS_PER_PAGE);
  const paginatedProducers = producers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDeactivate = async (email: string) => {
    try {
      await deactivateUser(email);
      await refreshProducers();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la désactivation');
    }
  };

  return (
    <Container sx={{ marginTop: 4, paddingBottom: 8 }}>
      {loading && (
        <CircularProgress sx={{ display: 'block', margin: 'auto' }} />
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && producers.length === 0 && (
        <Alert severity="info">Aucun producteur trouvé.</Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'center',
        }}
      >
        {paginatedProducers.map((producer) => (
          <Box
            key={producer.userId}
            sx={{ width: { xs: '100%', sm: '45%', md: '30%' } }}
          >
            <Card
              sx={{
                height: '100%',
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'scale(1.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                },
              }}
              onClick={() =>
                navigate(
                  `/producers/lots?email=${encodeURIComponent(producer.email)}`,
                )
              }
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: theme.palette.primary.dark,
                    marginBottom: 1,
                  }}
                >
                  {producer.companyName}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                  {producer.firstname} {producer.lastname}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontSize: '0.85rem' }}
                >
                  {producer.email}
                  <br />
                  {producer.address?.street} {producer.address?.number},{' '}
                  {producer.address?.postalCode} {producer.address?.city},{' '}
                  {producer.address?.country}
                  <br />
                  {producer.phoneNumber}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'center', padding: '16px' }}>
                {producer.deactivated ? (
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeactivate(producer.email);
                    }}
                    sx={{
                      width: '100%',
                      fontWeight: '600',
                      color: theme.palette.primary.light,
                      borderColor: theme.palette.primary.light,
                      backgroundColor: '#ffffff',
                      borderWidth: 2,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Réactiver le compte
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeactivate(producer.email);
                    }}
                    sx={{
                      width: '100%',
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.light,
                      '&:hover': {
                        bgcolor: theme.palette.primary.main,
                      },
                    }}
                  >
                    Désactiver le compte
                  </Button>
                )}
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 4,
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setCurrentPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default ProducerListPage;
