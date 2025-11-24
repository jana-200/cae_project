import { useState, useContext, SyntheticEvent } from 'react';
import {
  Card,
  Button,
  CardContent,
  Container,
  Stack,
  Typography,
  Box,
  TextField,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { OpenSalesContext } from '../../contexts/OpenSalesContext';
import { UserContext } from '../../contexts/UserContext';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

const OpenSalesPage = () => {
  const { items, createOpenSale, updateQuantity, removeFromOpenSale } =
    useContext(OpenSalesContext);
  const { authenticatedUser } = useContext(UserContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const total = items.reduce(
    (acc, item) => acc + item.product.unitPrice * item.quantity,
    0,
  );

  const handleOpenSale = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (items.length === 0) {
      setError('Votre panier est vide.');
      return;
    }

    if (authenticatedUser) {
      try {
        const successCreate = await createOpenSale();
        if (successCreate) {
          setSuccess(true);
          for (const item of items) {
            removeFromOpenSale(item.product.lotId);
          }
        } else {
          setError('Une erreur est survenue lors de la vente libre.');
        }
      } catch (err) {
        console.error('OpenSalesPage::handleOpenSale::error: ', err);
        setError('Une erreur est survenue lors de la vente libre.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ textAlign: 'center', mb: 4 }}
        >
          vente libre
        </Typography>

        {!success && items.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: 'text.secondary' }}
          >
            Aucune vente libre en cours de traitement.
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
                        onClick={() => removeFromOpenSale(product.lotId)}
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

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Vente libre effectuée avec succès !
              </Alert>
            )}

            {items.length > 0 && !success && (
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
                  onClick={() => setOpenDialog(true)}
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
                  Finaliser la vente libre
                </Button>
              </Box>
            )}
          </>
        )}
      </>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{ fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }}
        >
          Confirmer la vente libre
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
            Confirmer l'enregistrement de la vente ?
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}
          >
            Total : {total.toFixed(2)} €
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
            }}
          >
            Annuler
          </Button>

          <Button
            onClick={(e) => {
              setOpenDialog(false);
              handleOpenSale(e);
            }}
            variant="contained"
            sx={{
              backgroundColor: '#AAB399',
              color: 'black',
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              px: 3,
              '&:hover': { backgroundColor: '#9BA88D' },
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OpenSalesPage;
