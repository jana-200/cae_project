import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box as MuiBox,
  InputAdornment,
  Pagination,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  ProductLot,
  ProductType,
  ReservationContextType,
  UserDetails,
  ProductLotContextType,
  Product,
} from '../../types';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import TypographyJoy from '@mui/joy/Typography';
import CardJoy from '@mui/joy/Card';
import IconButton from '@mui/joy/IconButton';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';
import { ReservationContext } from '../../contexts/ReservationContext';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import theme from '../../themes';
import { OpenSalesContext } from '../../contexts/OpenSalesContext';
import { ProductLotContext } from '../../contexts/ProductLotContext';

const HomePage = () => {
  const [managerAction, setManagerAction] = useState<
    'DELETE' | 'FREE_SALE' | null
  >(null);
  const [selectedLotForManager, setSelectedLotForManager] =
    useState<ProductLot | null>(null);
  const [allProducts, setAllProducts] = useState<ProductLot[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductLot[]>([]);
  const [carouselItems, setCarouselItems] = useState<ProductLot[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToReservation }: ReservationContextType =
    useContext(ReservationContext);
  const { decreaseLotQuantity } =
    useContext<ProductLotContextType>(ProductLotContext);
  const navigate = useNavigate();
  const { authenticatedUser, fetchUserDetails, clearUser, isVolunteer } =
    useContext(UserContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialog2, setOpenDialog2] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quantities, setQuantities] = useState<{ [lotId: number]: number }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const { addToOpenSale } = useContext(OpenSalesContext);
  const [selectedProduct, setSelectedProduct] = useState<ProductLot | null>(
    null,
  );
  const [loopedCarouselItems, setLoopedCarouselItems] = useState<ProductLot[]>(
    [],
  );
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const { fetchProductSuggestions, productOptions }: ProductLotContextType =
    useContext(ProductLotContext);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/product-lots/?state=FOR_SALE');
      const data = await res.json();
      setFilteredProducts([...data]);
      setAllProducts([...data]);
    } catch (err) {
      console.error('Error fetching products:', err);
    }

    try {
      const resRecent = await fetch('/api/product-lots/recent');
      const dataRecent = await resRecent.json();
      setCarouselItems([...dataRecent]);
      setLoopedCarouselItems([...dataRecent, ...dataRecent]);
    } catch (err) {
      console.error('Error fetching recent products:', err);
    }

    try {
      const resTypes = await fetch('/api/product-types/');
      const dataTypes = await resTypes.json();
      if (Array.isArray(dataTypes)) setProductTypes(dataTypes);
      else setProductTypes([]);
    } catch (err) {
      console.error('Error fetching product types:', err);
    }
  };

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

  const handleQuantity = (product: ProductLot, quantity: number) => {
    setSelectedProduct(product);
    setSelectedQuantity(quantity);
    setIsDialogOpen(true);
  };

  const confirmAddToReservation = () => {
    if (selectedProduct) {
      addToReservation(selectedProduct, selectedQuantity);
      setSelectedProduct(null);
      setSelectedQuantity(1);
    }
    setIsDialogOpen(false);
  };

  const confirmDecrease = async () => {
    if (selectedProduct) {
      decreaseLotQuantity(selectedProduct.lotId, selectedQuantity);
    }
    setIsDialogOpen(false);
  };

  const cancelAddToReservation = () => setIsDialogOpen(false);

  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container || loopedCarouselItems.length === 0) return;

    const itemWidth = 240;
    let scrollCount = 0;

    const interval = setInterval(() => {
      if (!container) return;

      scrollCount++;
      container.scrollBy({ left: itemWidth, behavior: 'smooth' });

      if (scrollCount >= carouselItems.length) {
        setTimeout(() => {
          if (!container) return;
          container.scrollTo({ left: 0, behavior: 'auto' });
          scrollCount = 0;
        }, 300);
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopedCarouselItems]);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const scrollByAmount = (amount: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleSearch = () => {
    const filtered = allProducts.filter((lot) => {
      const matchesType =
        selectedType === '' ||
        lot.productType?.toLowerCase().trim() ===
          selectedType.toLowerCase().trim();
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        search === '' || lot.productLabel.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (_e: React.ChangeEvent<unknown>, val: number) => {
    setCurrentPage(val);
  };

  const handleInputChange = async (
    _event: React.SyntheticEvent,
    value: string,
  ) => {
    setSearchTerm(value);
    if (value.length >= 2) {
      await fetchProductSuggestions(value);
    }
  };

  const productsPerPage = 8;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Container sx={{ mt: 6 }} maxWidth="lg">
      <Typography variant="body1" gutterBottom>
        Découvrez nos produits récents
      </Typography>

      <JoyCssVarsProvider>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => scrollByAmount(-300)}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'white',
              boxShadow: 'sm',
              '&:hover': { backgroundColor: '#eee' },
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" data-testid="arrow1" />
          </IconButton>

          <Box
            ref={carouselRef}
            sx={{
              display: 'flex',
              gap: 2,
              py: 2,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              '& > *': { scrollSnapAlign: 'center' },
              '::-webkit-scrollbar': { display: 'none' },
              mb: 4,
            }}
          >
            {loopedCarouselItems.map((lot, index) => (
              <CardJoy
                orientation="vertical"
                key={`${lot.lotId}-${index}`}
                variant="outlined"
                sx={{
                  width: 220,
                  flexShrink: 0,
                  borderRadius: '16px',
                  backgroundColor: '#fafafa',
                  boxShadow: 2,
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 'lg',
                    borderColor: theme.palette.primary.main,
                  },
                }}
                onClick={() => navigate(`/lots/${lot.lotId}`)}
              >
                <AspectRatio
                  ratio="1"
                  sx={{ width: '80%', borderRadius: '12px' }}
                >
                  <img
                    src={lot.imageUrl || '/placeholder.jpg'}
                    alt={lot.productLabel}
                    loading="lazy"
                    style={{ borderRadius: '12px', objectFit: 'cover' }}
                  />
                </AspectRatio>
                <TypographyJoy
                  level="body-md"
                  fontWeight="lg"
                  textAlign="center"
                  noWrap
                >
                  {lot.productLabel}
                </TypographyJoy>
                <TypographyJoy
                  level="body-xs"
                  color="neutral"
                  textAlign="center"
                  sx={{
                    fontSize: '0.75rem',
                    lineHeight: 1.3,
                    height: 36,
                    overflow: 'hidden',
                  }}
                >
                  {lot.productDescription}
                </TypographyJoy>
                <TypographyJoy level="body-xs" fontWeight="md">
                  {lot.unitPrice} €/{lot.productUnit}
                </TypographyJoy>
              </CardJoy>
            ))}
          </Box>

          <IconButton
            onClick={() => scrollByAmount(300)}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'white',
              boxShadow: 'sm',
              '&:hover': { backgroundColor: '#eee' },
            }}
          >
            <ArrowForwardIosIcon fontSize="small" data-testid="arrow2" />
          </IconButton>
        </Box>
      </JoyCssVarsProvider>

      <Typography variant="body1" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Produits disponibles à la réservation
      </Typography>
      <MuiBox
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
          alignItems: 'center',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160, flexShrink: 0 }}>
          <InputLabel id="type-label">Type de produit</InputLabel>
          <Select
            labelId="type-label"
            value={selectedType}
            label="Type de produit"
            onChange={(e) => setSelectedType(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">Tous</MenuItem>
            {productTypes.map((type) => (
              <MenuItem key={type.typeId} value={type.label}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {userDetails?.role === 'MANAGER' && !isVolunteer && (
          <Button
            variant="outlined"
            size="small"
            data-testid="product-types"
            sx={{
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              minWidth: 160,
              flexShrink: 0,
            }}
            onClick={() => navigate(`/product-types`)}
          >
            Consulter les types
          </Button>
        )}

        <MuiBox
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            minWidth: 280,
            gap: 1,
          }}
        >
          <Autocomplete
            options={productOptions.map((p: Product) => p.label)}
            value={searchTerm}
            onInputChange={handleInputChange}
            onChange={(_event, value) => setSearchTerm(value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rechercher un produit"
                fullWidth
                variant="outlined"
                size="small"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2 }}
              />
            )}
            freeSolo
            sx={{ flexGrow: 1 }}
          />

          <Button
            variant="outlined"
            size="small"
            sx={{
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              flexShrink: 0,
              minWidth: 110,
            }}
            onClick={handleSearch}
          >
            Rechercher
          </Button>
        </MuiBox>
      </MuiBox>

      <MuiBox
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center',
        }}
      >
        {paginatedProducts.length === 0 && (
          <MuiBox sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Aucun produit ne correspond à votre recherche.
            </Typography>
          </MuiBox>
        )}
        {paginatedProducts.map((lot) => {
          const quantity = quantities[lot.lotId] || 1;
          return (
            <MuiBox
              key={lot.lotId}
              sx={{
                width: {
                  xs: '100%',
                  sm: '48%',
                  md: '31%',
                  lg: '23%',
                },
              }}
            >
              <Card
                sx={{
                  height: 420,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 4,
                  boxShadow: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                }}
                onClick={() => navigate(`/lots/${lot.lotId}`)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={lot.imageUrl || '/placeholder.jpg'}
                  alt={lot.productLabel}
                  sx={{ objectFit: 'cover', filter: 'brightness(0.95)' }}
                />
                <CardContent sx={{ flexGrow: 1, px: 2, py: 1.5 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {lot.productLabel}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      height: 40,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {lot.productDescription}
                  </Typography>
                  <MuiBox sx={{ mt: 1 }}>
                    <Typography fontWeight="bold" fontSize="0.95rem">
                      {lot.unitPrice} €/{lot.productUnit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      En stock : {lot.remainingQuantity} {lot.productUnit}
                    </Typography>
                  </MuiBox>
                  <MuiBox
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Quantité
                    </Typography>
                    <TextField
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
                      slotProps={{
                        htmlInput: {
                          min: 1,
                          max: lot.remainingQuantity,
                        },
                      }}
                      error={
                        typeof quantities[lot.lotId] === 'number' &&
                        quantities[lot.lotId] > lot.remainingQuantity
                      }
                      helperText={
                        <span
                          style={{
                            visibility: 'visible',
                            minHeight: 20,
                            display: 'block',
                            whiteSpace: 'nowrap',
                            fontSize: '0.75rem',
                            color:
                              typeof quantities[lot.lotId] === 'number' &&
                              quantities[lot.lotId] > lot.remainingQuantity
                                ? '#d32f2f'
                                : 'transparent',
                          }}
                        >
                          {typeof quantities[lot.lotId] === 'number' &&
                          quantities[lot.lotId] > lot.remainingQuantity
                            ? `Stock max: ${lot.remainingQuantity} ${lot.productUnit}`
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
                  </MuiBox>
                </CardContent>

                <MuiBox
                  sx={{
                    textAlign: 'center',
                    pb: 2,
                    mt: -8,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  {userDetails?.role === 'MANAGER' ? (
                    <>
                      <Button
                        data-testid="delete-button"
                        variant="outlined"
                        color="error"
                        sx={{
                          borderRadius: '20px',
                          minWidth: '40px',
                          padding: '6px',
                          height: '40px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.blur();
                          setSelectedLotForManager(lot);
                          setSelectedQuantity(quantities[lot.lotId] || 1);
                          setManagerAction('DELETE');
                          setIsDialogOpen(true);
                          handleQuantity(lot, quantity);
                        }}
                      >
                        🗑️
                      </Button>

                      <Button
                        data-testid="open-sale"
                        variant="contained"
                        sx={{
                          borderRadius: '20px',
                          px: 2,
                          textTransform: 'none',
                          fontWeight: 'medium',
                          fontSize: '0.8rem',
                          backgroundColor: '#AAB399',
                          color: 'black',
                          '&:hover': { backgroundColor: '#9BA88D' },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLotForManager(lot);
                          e.currentTarget.blur();
                          setSelectedQuantity(quantities[lot.lotId] || 1);
                          setManagerAction('FREE_SALE');
                          setIsDialogOpen(true);
                          handleQuantity(lot, quantity);
                        }}
                      >
                        Vente libre
                      </Button>
                    </>
                  ) : (
                    <Button
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
                      disabled={authenticatedUser && userDetails === null}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        e.stopPropagation();
                        if (!authenticatedUser) setOpenDialog(true);
                        else if (userDetails?.role !== 'CUSTOMER')
                          setOpenDialog2(true);
                        else handleQuantity(lot, quantity);
                      }}
                    >
                      Ajouter à la réservation
                    </Button>
                  )}
                </MuiBox>
              </Card>
            </MuiBox>
          );
        })}
      </MuiBox>

      <MuiBox sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(filteredProducts.length / productsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
        />
      </MuiBox>

      <Dialog open={isDialogOpen} onClose={cancelAddToReservation}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          {managerAction === null ? (
            <Typography>
              Voulez-vous ajouter{' '}
              <strong>
                {selectedQuantity} {selectedProduct?.productUnit} de{' '}
                {selectedProduct?.productLabel}
              </strong>{' '}
              à votre réservation ?
            </Typography>
          ) : managerAction === 'DELETE' ? (
            <Typography>
              Voulez-vous retirer{' '}
              <strong>
                {selectedQuantity} {selectedProduct?.productUnit}{' '}
                {selectedLotForManager?.productLabel}
              </strong>{' '}
              de la vente ?
            </Typography>
          ) : (
            <Typography>
              Voulez-vous ajouter {selectedQuantity}{' '}
              {selectedProduct?.productUnit} de{' '}
              {selectedLotForManager?.productLabel} en vente libre ?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelAddToReservation}>Annuler</Button>
          <Button
            onClick={() => {
              if (managerAction === 'DELETE') {
                confirmDecrease();
              } else if (managerAction === 'FREE_SALE') {
                if (selectedLotForManager) {
                  addToOpenSale(selectedLotForManager!, selectedQuantity);
                }
              } else {
                confirmAddToReservation();
              }
              setManagerAction(null);
              setSelectedLotForManager(null);
              setIsDialogOpen(false);
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent sx={{ textAlign: 'center', px: 4, pt: 4 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
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
      <Dialog open={openDialog2} onClose={() => setOpenDialog2(false)}>
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

      <MuiBox sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" gutterBottom>
          🕒 jeudi de 18h à 21h et mardi de 16h à 21h
        </Typography>
        <Typography variant="body2" gutterBottom>
          📍 Rue du Bon Terroir, 7, 6980 Valfontaine, Belgique
        </Typography>
      </MuiBox>
    </Container>
  );
};

export default HomePage;
