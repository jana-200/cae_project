import React, { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ProductLot } from '../../types';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { NotificationContext } from '../../contexts/NotificationContext';

type Props = {
  lot: ProductLot;
  fetchAllLots: () => Promise<void>;
};

const ProposedLotCard: React.FC<Props> = ({ lot, fetchAllLots }) => {
  const [openRefuseDialog, setOpenRefuseDialog] = useState(false);
  const [refuseReason, setRefuseReason] = useState('');
  const { changeLotState } = useContext(ProductLotContext);
  const { fetchNotifications } = useContext(NotificationContext);

  const handleAccept = async () => {
    await changeLotState(lot.lotId, 'ACCEPTED');
    await fetchAllLots();

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          notifiedUser: lot.producerEmail,
          notificationTitle: 'Lot accepté',
          message: `Votre lot de ${lot.productLabel} a été accepté.`,
        }),
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification :", error);
    }
  };

  const confirmRefuse = async () => {
    await changeLotState(lot.lotId, 'REJECTED');

    const message = refuseReason
      ? `Votre lot de ${lot.productLabel} a été refusé car ${refuseReason}.`
      : `Votre lot de ${lot.productLabel} a été refusé.`;

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          notifiedUser: lot.producerEmail,
          notificationTitle: 'Lot refusé',
          message: message,
        }),
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification :", error);
    }
    setOpenRefuseDialog(false);
    setRefuseReason('');
    await fetchAllLots();
  };

  const handleReception = async () => {
    await changeLotState(lot.lotId, 'FOR_SALE');
    await fetchAllLots();
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          notifiedUser: lot.producerEmail,
          notificationTitle: 'Lot réceptionné',
          message: `votre lot de ${lot.productLabel} a été réceptionné avec succès.`,
        }),
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification :", error);
    }
  };

  const isHidden =
    lot.productLotState === 'REJECTED' ||
    lot.productLotState === 'SOLD_OUT' ||
    lot.productLotState === 'FOR_SALE';

  return (
    <>
      <Card
        sx={{
          border: '2px solid #a3b18a',
          borderRadius: 2,
          backgroundColor: '#fefdf9',
          maxWidth: 900,
          margin: '0 auto',
          width: '100%',
          px: 2,
          py: 1.5,
          p: 0,
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
              marginLeft: 2,
              marginTop: 1,
              marginBottom: 1,
            }}
          />

          <CardContent sx={{ p: 0, flex: '1 1 300px' }}>
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

            <Typography variant="body2" sx={{ mb: 1 }}>
              {lot.productDescription}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              par : {lot.producerName}
            </Typography>
          </CardContent>

          {(lot.productLotState === 'FOR_SALE' ||
            lot.productLotState === 'SOLD_OUT') && (
            <Box sx={{ display: 'flex', gap: 2, marginRight: 2 }}>
              <Box>
                <Typography variant="body2">
                  Fournies : {lot.initialQuantity} {lot.productUnit}
                </Typography>
                <Typography variant="body2">
                  Vendues : {lot.soldQuantity} {lot.productUnit}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  Réservées : {lot.reservedQuantity} {lot.productUnit}
                </Typography>
                <Typography variant="body2">
                  Disponibles : {lot.remainingQuantity} {lot.productUnit}
                </Typography>
              </Box>
            </Box>
          )}

          {!isHidden && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              justifyContent="space-between"
              height="100%"
              mr={2}
              gap={1}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}
              >
                Disponible le :{' '}
                {new Date(lot.availabilityDate).toLocaleDateString('fr-BE')}
              </Typography>

              {lot.productLotState === 'PENDING' && (
                <Box display="flex" gap={1}>
                  <Button
                    onClick={handleAccept}
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#c8e6c9',
                      color: '#2e7d32',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#aedfae' },
                    }}
                  >
                    Accepter
                  </Button>
                  <Button
                    onClick={() => setOpenRefuseDialog(true)}
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#ffcdd2',
                      color: '#b71c1c',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#ef9a9a' },
                    }}
                  >
                    Refuser
                  </Button>
                </Box>
              )}

              {lot.productLotState === 'ACCEPTED' && (
                <Button
                  onClick={handleReception}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: '#e0e0e0',
                    color: '#424242',
                    fontWeight: 'bold',
                    textTransform: 'none',
                  }}
                >
                  Réceptionner
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Card>

      <Dialog
        open={openRefuseDialog}
        onClose={() => {
          setOpenRefuseDialog(false);
          setRefuseReason('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            border: '2px solid #a3b18a',
            borderRadius: 2,
            backgroundColor: '#fefdf9',
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 500,
            fontSize: '1rem',
            color: '#344e41',
            pb: 0.5,
          }}
        >
          Motif du refus (facultatif)
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            label="Ajouter un message au producteur"
            value={refuseReason}
            onChange={(e) => setRefuseReason(e.target.value)}
            placeholder="Ex: quantité trop faible, produit non conforme, etc."
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2, pt: 2, pb: 1 }}>
          <Button
            onClick={() => {
              setOpenRefuseDialog(false);
              setRefuseReason('');
            }}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#c8e6c9',
              color: '#2e7d32',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '0.85rem',
              px: 3,
              py: 1,
              borderRadius: 1.5,
              minWidth: 140,
              '&:hover': {
                backgroundColor: '#aedfae',
              },
            }}
          >
            Annuler
          </Button>

          <Button
            onClick={confirmRefuse}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#c8e6c9',
              color: '#2e7d32',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '0.85rem',
              px: 3,
              py: 1,
              borderRadius: 1.5,
              minWidth: 140,
              '&:hover': {
                backgroundColor: '#aedfae',
              },
            }}
          >
            Refuser{refuseReason ? '' : ' sans message'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProposedLotCard;
