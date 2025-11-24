import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Divider,
  CircularProgress,
} from '@mui/material';
import { UserContext } from '../../contexts/UserContext';

type ProductReserved = {
  productLotId: number;
  productLabel: string;
  productDescription: string;
  productUnit: string;
  unitPrice: number;
  quantity: number;
};

const ReservationDetailPage = () => {
  const { id } = useParams();
  const [items, setItems] = useState<ProductReserved[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { authenticatedUser } = useContext(UserContext);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await fetch(`/api/reservations/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${authenticatedUser?.token}`,
          },
        });
        if (!response.ok) throw new Error('Erreur');
        const data = await response.json();
        setItems(data);
      } catch (e) {
        console.error('Erreur de chargement des produits', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, authenticatedUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !items || items.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Typography color="error">Réservation introuvable.</Typography>
      </Box>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        textAlign="center"
        mb={4}
        sx={{ color: '#2f3e46' }}
      >
        Produits de la réservation
      </Typography>

      {items.map((item) => (
        <Box key={item.productLotId} sx={{ mb: 3 }}>
          <Typography fontWeight={600} fontSize="1.05rem">
            {item.productLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {item.productDescription}
          </Typography>
          <Typography variant="body2">
            {item.quantity} × {item.unitPrice.toFixed(2)} €/
            {item.productUnit} ={' '}
            <strong>{(item.unitPrice * item.quantity).toFixed(2)} €</strong>
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}

      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Typography fontWeight="bold" fontSize="1.2rem">
          Total : {total.toFixed(2)} €
        </Typography>
      </Box>
    </Container>
  );
};

export default ReservationDetailPage;
