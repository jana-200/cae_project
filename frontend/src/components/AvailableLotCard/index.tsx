import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CardMedia,
  useTheme,
} from '@mui/material';
import { ProductLot } from '../../types';
import { useNavigate } from 'react-router-dom';

type Props = {
  lot: ProductLot;
};

const AvailableLotCard: React.FC<Props> = ({ lot }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleEditImage = () => {
    navigate(`/edit-lot-image/${lot.lotId}`);
  };

  return (
    <Card
      sx={{
        border: '2px solid #a3b18a',
        borderRadius: 2,
        backgroundColor: '#fefdf9',
        maxWidth: 900,
        margin: '0 auto',
        width: '100%',
        px: 2,
        py: 2,
        textAlign: 'left',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CardMedia
          component="img"
          image={lot.imageUrl || '/placeholder.jpg'}
          alt={lot.productLabel}
          sx={{
            width: 100,
            height: 100,
            objectFit: 'cover',
            borderRadius: 1,
          }}
        />

        <Box sx={{ flex: '1 1 300px' }}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {lot.productLabel}{' '}
              <Chip
                label={lot.productType}
                size="small"
                sx={{
                  ml: 1,
                  height: '20px',
                  fontSize: '0.65rem',
                  backgroundColor: '#c8e6c9',
                  color: '#2e7d32',
                  fontWeight: 500,
                }}
              />
            </Typography>

            <Typography
              variant="body1"
              fontWeight="bold"
              sx={{ mt: 0.5, mb: 0.5 }}
            >
              {lot.unitPrice.toFixed(2)} € / {lot.productUnit}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {lot.productDescription}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="body2">
                  unités fournies : {lot.initialQuantity} {lot.productUnit}
                </Typography>
                <Typography variant="body2">
                  unités vendues : {lot.soldQuantity} {lot.productUnit}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  unités réservées : {lot.reservedQuantity} {lot.productUnit}
                </Typography>
                <Typography variant="body2">
                  unités disponibles : {lot.remainingQuantity} {lot.productUnit}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Box>

        <Box>
          <Button
            onClick={handleEditImage}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.light,
              color: 'black',
              textTransform: 'none',
              borderRadius: 1,
              boxShadow: 'none',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              height: '32px',
              px: 2,
              border: `1px solid ${theme.palette.primary.main}`,
              '&:hover': {
                bgcolor: theme.palette.primary.main,
              },
            }}
          >
            Modifier la photo
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default AvailableLotCard;
