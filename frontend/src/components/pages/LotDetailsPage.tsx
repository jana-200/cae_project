import {
  Box,
  Container,
  Typography,
  useTheme,
  Alert,
  Button,
  TextField,
  Divider,
  Chip,
} from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { ProductLotContextType, UserDetails } from '../../types';
import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { ReservationContext } from '../../contexts/ReservationContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { OpenSalesContext } from '../../contexts/OpenSalesContext';

const LotDetailsPage = () => {
  const { lotId } = useParams<{ lotId: string }>();
  const { fetchProductLotById, lot }: ProductLotContextType =
    useContext(ProductLotContext);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { authenticatedUser, fetchUserDetails, clearUser } =
    useContext(UserContext);
  const { addToReservation } = useContext(ReservationContext);
  const navigate = useNavigate();
  const { addToOpenSale } = useContext(OpenSalesContext);
  const { decreaseLotQuantity } = useContext(ProductLotContext);

  const [openDialog, setOpenDialog] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [quantities, setQuantities] = useState<{ [lotId: number]: number }>({});
  const [openDialog2, setOpenDialog2] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [managerAction, setManagerAction] = useState<
    'DELETE' | 'FREE_SALE' | null
  >(null);

  const stateLabels: { [key: string]: string } = {
    PENDING: 'En attente',
    ACCEPTED: 'Accepté',
    REJECTED: 'Refusé',
    FOR_SALE: 'En vente',
    SOLD_OUT: 'Rupture de stock',
  };

  useEffect(() => {
    const loadLot = async () => {
      try {
        if (lotId) {
          await fetchProductLotById(Number(lotId));
          setError(null);
        }
      } catch (err) {
        setError('Lot demandé introuvable.');
      }
    };
    loadLot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotId]);

  useEffect(() => {
    const loadUserDetails = async () => {
      if (!authenticatedUser) return;
      try {
        const details = await fetchUserDetails();
        setUserDetails(details);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };

    loadUserDetails();
  }, [authenticatedUser, fetchUserDetails]);

  if (!lot) {
    return (
      <Container sx={{ pt: 10 }}>
        {error && (
          <Alert severity="error" data-testid="error-message">
            <Typography>{error}</Typography>
          </Alert>
        )}
      </Container>
    );
  }

  return (
    <Container sx={{ pt: 3 }} maxWidth="md">
      <Box
        sx={{
          position: 'relative',
          marginBottom: 3,
          p: 4,
          backgroundColor: theme.palette.secondary.main,
          borderRadius: 3,
          border: 2,
          borderColor: theme.palette.primary.main,
          boxShadow: 4,
          maxWidth: '1100px',
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: '#e0e0e0',
            borderRadius: 20,
            px: 2,
            py: 0.5,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            boxShadow: 2,
          }}
        >
          <Typography
            variant="caption"
            data-testid={`lot-state-${lot.lotId}`}
            sx={{ textTransform: 'uppercase' }}
          >
            {stateLabels[lot.productLotState] || lot.productLotState}
          </Typography>
        </Box>

        <Typography
          variant="h5"
          gutterBottom
          textAlign="center"
          fontWeight="bold"
          data-testid="product-label"
        >
          {lot.productLabel}
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

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'flex-start',
            gap: 4,
          }}
        >
          <Box
            component="img"
            src={lot.imageUrl}
            alt="Lot"
            sx={{
              width: '100%',
              maxWidth: 350,
              height: 'auto',
              maxHeight: 280,
              objectFit: 'cover',
              borderRadius: 2,
              border: '1px solid gray',
              boxShadow: 2,
              mx: 'auto',
            }}
          />

          <Box
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography variant="h6" data-testid="unit-price">
              {lot.unitPrice.toFixed(2)} € / {lot.productUnit}
            </Typography>

            <Typography> {lot.productDescription} </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                border: '1px solid #ccc',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
                alignItems: 'center',
              }}
            >
              {!(
                userDetails?.role === 'MANAGER' ||
                userDetails?.email === lot.producerEmail
              ) ? (
                <Typography
                  variant="body2"
                  sx={{ gridColumn: 'span 2', textAlign: 'center' }}
                >
                  <strong>Quantité disponible :</strong> {lot.remainingQuantity}
                </Typography>
              ) : (
                <>
                  <Typography variant="body2">
                    <strong>Quantité disponible :</strong>{' '}
                    {lot.remainingQuantity}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Quantité fournie :</strong> {lot.initialQuantity}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Quantité vendue :</strong> {lot.soldQuantity}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Quantité réservée :</strong> {lot.reservedQuantity}
                  </Typography>

                  <Typography variant="body2" sx={{ gridColumn: 'span 2' }}>
                    <strong>Producteur :</strong> {lot.producerName}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Divider />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            textAlign: 'center',
            gap: 2,
          }}
        >
          <TextField
            data-testid="quantity-input"
            type="number"
            value={
              quantities[lot.lotId] !== undefined
                ? String(quantities[lot.lotId])
                : ''
            }
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const raw = e.target.value;
              setQuantities((prev) => ({
                ...prev,
                [lot.lotId]: raw === '' ? 1 : Number(raw),
              }));
            }}
            onBlur={(e) => {
              const val = Number(e.target.value);
              const safe = isNaN(val)
                ? 1
                : Math.min(Math.max(1, val), lot.remainingQuantity);
              setQuantities((prev) => ({
                ...prev,
                [lot.lotId]: safe,
              }));
            }}
            size="small"
            inputProps={{
              min: 1,
              max: lot.remainingQuantity,
            }}
            error={
              typeof quantities[lot.lotId] === 'number' &&
              quantities[lot.lotId] > lot.remainingQuantity
            }
            sx={{
              width: 90,
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                fontSize: '0.85rem',
                backgroundColor: '#f5f5f5',
                px: 1,
              },
            }}
          />

          {userDetails?.role === 'MANAGER' ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                sx={{ borderRadius: '20px', minWidth: '40px' }}
                onClick={() => {
                  setSelectedQuantity(quantities[lot.lotId] || 1);
                  setManagerAction('DELETE');
                  setIsDialogOpen(true);
                }}
              >
                🗑️
              </Button>

              <Button
                variant="contained"
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 'medium',
                  fontSize: '0.8rem',
                  backgroundColor: '#AAB399',
                  color: 'black',
                  '&:hover': { backgroundColor: '#9BA88D' },
                }}
                onClick={() => {
                  setSelectedQuantity(quantities[lot.lotId] || 1);
                  setManagerAction('FREE_SALE');
                  setIsDialogOpen(true);
                }}
              >
                Vente libre
              </Button>
            </Box>
          ) : (
            <Button
              data-testid="add-to-reservation-button"
              variant="contained"
              sx={{
                borderRadius: '20px',
                px: 3,
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.9rem',
                backgroundColor: '#AAB399',
                color: 'black',
                '&:hover': { backgroundColor: '#9BA88D' },
              }}
              onClick={() => {
                const qty = quantities[lot.lotId] ?? 1;
                setSelectedQuantity(qty);
                if (!authenticatedUser || authenticatedUser == undefined)
                  setOpenDialog(true);
                else if (userDetails?.role !== 'CUSTOMER') setOpenDialog2(true);
                else setIsDialogOpen(true);
              }}
            >
              Ajouter à la réservation
            </Button>
          )}
        </Box>
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        data-testid="dialog-confirmation-dialog"
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          {managerAction === 'DELETE' ? (
            <Typography>
              Voulez-vous retirer {selectedQuantity} {lot.productLabel} de la
              vente ?
            </Typography>
          ) : managerAction === 'FREE_SALE' ? (
            <Typography>
              Voulez-vous ajouter {selectedQuantity} {lot.productLabel} en vente
              libre ?
            </Typography>
          ) : (
            <Typography>
              Voulez-vous ajouter {selectedQuantity} {lot.productLabel} à votre
              réservation ?
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Annuler</Button>
          <Button
            data-testid="dialog-confirmation-button"
            onClick={async () => {
              if (!lot) return;

              if (managerAction === 'DELETE') {
                await decreaseLotQuantity(lot.lotId, selectedQuantity);
              } else if (managerAction === 'FREE_SALE') {
                addToOpenSale(lot, selectedQuantity);
              } else {
                addToReservation(lot, selectedQuantity);
                navigate('/my-reservation');
              }

              setIsDialogOpen(false);
              setManagerAction(null);
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent sx={{ textAlign: 'center', px: 4, pt: 4 }}>
          <Typography
            variant="body1"
            sx={{ mb: 2 }}
            data-testid="dialog-customer-message"
          >
            Pour pouvoir réserver un produit, vous devez être inscrit et
            connecté à votre compte.
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#AAB399',
              color: 'black',
              borderRadius: '20px',
              px: 4,
              mb: 2,
              '&:hover': { backgroundColor: '#9BA88D' },
            }}
            onClick={() => navigate('/register')}
          >
            Inscrivez-vous
          </Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ mb: 1 }}>
            Déjà inscrit ?
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#AAB399',
              color: 'black',
              borderRadius: '20px',
              px: 4,
              '&:hover': { backgroundColor: '#9BA88D' },
            }}
            onClick={() => navigate('/login')}
          >
            Connectez-vous
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDialog2}
        onClose={() => setOpenDialog2(false)}
        data-testid="dialog-registration-message"
      >
        <DialogContent sx={{ textAlign: 'center', px: 4, pt: 4 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Pour pouvoir réserver un produit, vous devez être inscrit et
            connecté à un compte client.
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#AAB399',
              color: 'black',
              borderRadius: '20px',
              px: 4,
              mb: 2,
              '&:hover': { backgroundColor: '#9BA88D' },
            }}
            onClick={() => {
              clearUser();
              navigate('/register');
            }}
          >
            Créer un compte client
          </Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ mb: 1 }}>
            Déjà un comtpe client ?
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#AAB399',
              color: 'black',
              borderRadius: '20px',
              px: 4,
              '&:hover': { backgroundColor: '#9BA88D' },
            }}
            onClick={() => {
              clearUser();
              navigate('/login');
            }}
          >
            Connectez-vous
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default LotDetailsPage;
