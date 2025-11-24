import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Box,
  CardMedia,
  Pagination,
} from '@mui/material';
import { ProductLot } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import theme from '../../themes';
import { useLocation, useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 8;

const stateLabels: { [key: string]: string } = {
  PENDING: 'En attente',
  ACCEPTED: 'Accepté',
  REJECTED: 'Refusé',
  FOR_SALE: 'En vente',
  SOLD_OUT: 'Rupture de stock',
};

const ProducerLotsPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { authenticatedUser } = React.useContext(UserContext);
  const email = params.get('email');
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();

  const fetchLots = async () => {
    if (!email) {
      setError('Email du producteur non fourni.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `/api/producers/lots?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `${authenticatedUser?.token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Erreur de récupération des lots');
      }

      const data = await response.json();
      setLots(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération des lots.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticatedUser) {
      fetchLots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser]);

  const totalPages = Math.ceil(lots.length / ITEMS_PER_PAGE);
  const paginatedLots = lots.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <Container sx={{ marginTop: 4, paddingBottom: 8 }}>
      {loading && (
        <CircularProgress
          data-testid="loader"
          sx={{ display: 'block', margin: 'auto' }}
        />
      )}

      {error && (
        <Alert data-testid="error-alert" severity="error">
          {error}
        </Alert>
      )}

      {!loading && !error && lots.length === 0 && (
        <Alert data-testid="no-lots-alert" severity="error">
          Aucun lot trouvé pour ce producteur.
        </Alert>
      )}

      {email && lots.length > 0 && (
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}
        >
          Lots proposés par ce producteur
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center',
        }}
      >
        {paginatedLots.map((lot) => (
          <Box
            key={lot.lotId}
            sx={{ width: { xs: '100%', sm: '45%', md: '22%' } }}
            onClick={() => navigate(`/lots/${lot.lotId}`)}
          >
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: '#f9f9f9',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                },
              }}
            >
              {lot.imageUrl && (
                <CardMedia
                  component="img"
                  height="120"
                  image={lot.imageUrl}
                  alt={lot.productLabel}
                  sx={{
                    objectFit: 'cover',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                />
              )}
              <CardContent>
                <Typography
                  data-testid={`lot-title-${lot.lotId}`}
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    color: theme.palette.primary.dark,
                    marginBottom: 1,
                    textAlign: 'center',
                  }}
                >
                  {lot.productLabel}
                </Typography>

                <Typography
                  data-testid={`lot-description-${lot.lotId}`}
                  variant="body2"
                  color="textSecondary"
                  sx={{ marginBottom: 1, minHeight: 40, fontSize: '0.75rem' }}
                >
                  {lot.productDescription || 'Pas de description.'}
                </Typography>

                <Divider sx={{ marginY: 1 }} />

                <Typography
                  data-testid={`lot-price-${lot.lotId}`}
                  variant="body2"
                  sx={{ fontSize: '0.7rem', marginBottom: 0.5 }}
                >
                  <strong>Prix :</strong> {lot.unitPrice} € / {lot.productUnit}
                </Typography>

                <Typography
                  data-testid={`lot-quantity-${lot.lotId}`}
                  variant="body2"
                  sx={{ fontSize: '0.7rem', marginBottom: 0.5 }}
                >
                  <strong>Quantité :</strong> {lot.remainingQuantity}
                </Typography>

                <Typography
                  data-testid={`lot-state-${lot.lotId}`}
                  variant="body2"
                  sx={{ fontSize: '0.7rem' }}
                >
                  <strong>État :</strong>{' '}
                  {stateLabels[lot.productLotState] || lot.productLotState}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <Pagination
            data-testid="pagination"
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

export default ProducerLotsPage;
