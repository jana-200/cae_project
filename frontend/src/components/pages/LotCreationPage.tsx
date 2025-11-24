import { useState, SyntheticEvent, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductLotContextType, ProductTypeContextType } from '../../types';
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
  Container,
  useTheme,
  InputAdornment,
  MenuItem,
  Select,
  Autocomplete,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import './index.css';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { ProductTypeContext } from '../../contexts/ProductTypeContext';
import { UserContext } from '../../contexts/UserContext';

const LotCreationPage = () => {
  const {
    createLot,
    fetchExistingImage,
    fetchProductSuggestions,
    productOptions,
    existingImages,
  }: ProductLotContextType = useContext(ProductLotContext);
  const { authenticatedUser, fetchUserDetails } = useContext(UserContext);
  const { productTypes }: ProductTypeContextType =
    useContext(ProductTypeContext);
  const theme = useTheme();
  const navigate = useNavigate();
  const [productLabel, setProductLabel] = useState('');
  const [productType, setProductType] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [initialQuantity, setInitialQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [image, setImage] = useState<File>();
  const [producerId, setProducerId] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [existing, setExisting] = useState(false);
  const [isExistingProductSelected, setIsExistingProductSelected] =
    useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExisting(false);
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageError(null);
      setSelectedImageUrl(null);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
      setSelectedImageUrl(null);
      setExisting(false);
    }
  };

  const handleSelectExistingImage = async () => {
    setExisting(true);
    setImage(undefined);
    setPreviewUrl(null);
    setSelectedImageUrl(null);
    const matchedProduct = productOptions.find(
      (p) => p.label.toLowerCase() === productLabel.toLowerCase(),
    );
    if (!matchedProduct) {
      setImageError('Aucune image existante pour ce produit.');
      setExisting(false);
      return;
    }
    await fetchExistingImage(matchedProduct.productId);
  };

  const validateForm = () => {
    const newFieldErrors: { [key: string]: boolean } = {};
    const validationErrors: string[] = [];
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 2);
    if (new Date(availabilityDate).getTime() < threeDaysLater.getTime()) {
      validationErrors.push(
        'La date de disponibilité doit être au moins dans 3 jours.',
      );
      newFieldErrors.availabilityDate = true;
    }

    if (isNaN(Number(initialQuantity)) || Number(initialQuantity) <= 0) {
      validationErrors.push(
        'La quantité initiale doit être un nombre positif.',
      );
      newFieldErrors.initialQuantity = true;
    }
    if (productDescription.length > 120) {
      validationErrors.push(
        'La description du produit ne peut pas dépasser les 120 caractères.',
      );
      newFieldErrors.productDescription = true;
    }
    if (isNaN(Number(unitPrice)) || Number(unitPrice) <= 0) {
      validationErrors.push('Le prix unitaire doit être un nombre positif.');
      newFieldErrors.unitPrice = true;
    }
    if (!image) {
      validationErrors.push('Veuillez sélectionner ou importer une image.');
      newFieldErrors.image = true;
    }

    setFieldErrors(newFieldErrors);
    setErrors(validationErrors);
    return validationErrors;
  };
  useEffect(() => {
    const loadUser = async () => {
      if (!authenticatedUser) return;
      try {
        const user = await fetchUserDetails();
        setProducerId(user.id);
      } catch (err) {
        console.error('Erreur lors de la récupération du user');
      }
    };

    loadUser();
  }, [authenticatedUser, fetchUserDetails]);
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (producerId === null) {
      setErrors(['Impossible de récupérer votre identifiant producteur.']);
      return;
    }
    const newLot = {
      productLabel,
      productDescription,
      unit,
      productType,
      producer: producerId,
      unitPrice: parseFloat(unitPrice),
      initialQuantity: parseInt(initialQuantity),
      availabilityDate: new Date(availabilityDate).toISOString().split('.')[0],
      image,
    };

    try {
      await createLot(newLot);
      setProductLabel('');
      setImageError(null);
      setExisting(false);
      navigate('/my-lots');

      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            notifiedUser: authenticatedUser?.email,
            notificationTitle: 'Lot proposé avec succés',
            message: `Votre lot de ${productLabel} a été proposé avec succès.`,
          }),
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
      }
    } catch (err) {
      setErrors(['Une erreur est survenue. Veuillez réessayer plus tard.']);
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'auto',
        paddingTop: 3,
        paddingBottom: 2,
      }}
    >
      <Box
        sx={{
          width: 900,
          padding: 5,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.secondary.main,
          border: 2,
          borderColor: theme.palette.primary.main,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Proposer un nouveau lot
        </Typography>
        <form onSubmit={handleSubmit} data-testid="lot-form">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 100%' }}>
              <Autocomplete
                freeSolo
                options={productOptions}
                getOptionLabel={(option) =>
                  typeof option === 'string' ? option : option.label
                }
                onInputChange={(_, newInputValue) => {
                  setProductLabel(newInputValue);
                  fetchProductSuggestions(newInputValue);
                  setImageError(null);
                  if (!newInputValue) {
                    setIsExistingProductSelected(false);
                    setProductDescription('');
                    setProductType('');
                    setUnit('');
                  }
                }}
                onChange={(_, value) => {
                  if (value && typeof value !== 'string') {
                    setProductLabel(value.label);
                    setProductDescription(value.description);
                    setProductType(value.type);
                    setUnit(value.unit);
                    setIsExistingProductSelected(true);
                  } else {
                    setIsExistingProductSelected(false);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    data-testid="productLabelInput"
                    label="Nom du produit"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    error={fieldErrors.productLabel}
                    required
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {fieldErrors.productLabel && (
                              <InputAdornment position="end">
                                <ErrorOutlineIcon color="error" />
                              </InputAdornment>
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      },
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    sx={{
                      input: { color: theme.palette.secondary.contrastText },
                    }}
                  />
                )}
              />
            </Box>

            <Box sx={{ flex: '1 1 48%' }}>
              <Select
                fullWidth
                id="productType"
                name="productType"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                error={fieldErrors.productType}
                displayEmpty
                disabled={isExistingProductSelected}
                required
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.secondary.contrastText,
                  mt: 2,
                }}
              >
                <MenuItem value="" disabled>
                  Type de produit
                </MenuItem>
                {productTypes.map((type) => (
                  <MenuItem key={type.typeId} value={type.label}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ flex: '1 1 48%' }}>
              <TextField
                fullWidth
                id="unit"
                label="Unité"
                variant="outlined"
                margin="normal"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                error={fieldErrors.unit}
                required
                disabled={isExistingProductSelected}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>

            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                id="productDescription"
                label="Description du produit"
                variant="outlined"
                margin="normal"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                error={fieldErrors.productDescription}
                disabled={isExistingProductSelected}
                required
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>

            <Box sx={{ flex: '1 1 33%' }}>
              <TextField
                fullWidth
                id="availabilityDate"
                name="availabilityDate"
                label="Date de disponibilité"
                variant="outlined"
                type="date"
                slotProps={{
                  htmlInput: {
                    min: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0],
                  },
                  inputLabel: {
                    shrink: true,
                  },
                  input: {
                    endAdornment: fieldErrors.availabilityDate ? (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon color="error" />
                      </InputAdornment>
                    ) : null,
                  },
                }}
                margin="normal"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                error={fieldErrors.availabilityDate}
                required
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>

            <Box sx={{ flex: '1 1 20%' }}>
              <TextField
                fullWidth
                id="initialQuantity"
                label="Quantité initiale"
                variant="outlined"
                margin="normal"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
                error={fieldErrors.initialQuantity}
                required
                slotProps={{
                  input: {
                    endAdornment: fieldErrors.initialQuantity ? (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon color="error" />
                      </InputAdornment>
                    ) : null,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>

            <Box sx={{ flex: '1 1 20%' }}>
              <TextField
                fullWidth
                id="unitPrice"
                label="Prix unitaire"
                variant="outlined"
                margin="normal"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                error={fieldErrors.unitPrice}
                required
                slotProps={{
                  input: {
                    endAdornment: fieldErrors.unitPrice ? (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon color="error" />
                      </InputAdornment>
                    ) : null,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                width: '100%',
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                component="label"
                sx={{ flex: '1 1 48%' }}
              >
                Importer une image
                <input
                  hidden
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              <Button
                variant="outlined"
                onClick={handleSelectExistingImage}
                sx={{ flex: '1 1 48%' }}
              >
                Choisir une image existante
              </Button>
            </Box>

            {previewUrl && (
              <Box sx={{ mt: 3, width: '100%' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Aperçu de l'image sélectionnée :
                </Typography>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Aperçu"
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    border: '1px solid gray',
                  }}
                />
              </Box>
            )}

            {imageError && (
              <Box
                data-testid="image-error"
                sx={{
                  backgroundColor: '#fdecea',
                  color: '#b71c1c',
                  border: '1px solid #f44336',
                  borderRadius: 2,
                  p: 1,
                  mt: 2,
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                {imageError}
              </Box>
            )}

            {existingImages.length > 0 && existing && (
              <Box sx={{ mt: 2, width: '100%' }}>
                {/* Images en flex-wrap */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: 'center',
                  }}
                >
                  {existingImages.map((url, idx) => (
                    <Box
                      key={idx}
                      onClick={async () => {
                        const res = await fetch(url);
                        const blob = await res.blob();
                        const file = new File([blob], `image-${idx}.jpg`, {
                          type: blob.type,
                        });
                        setImage(file);
                        setSelectedImageUrl(url);
                        setImageError(null);
                        setPreviewUrl(null);
                      }}
                      sx={{
                        border:
                          selectedImageUrl === url
                            ? '2px solid #1976d2'
                            : '1px solid gray',
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      <img src={url} alt={`img-${idx}`} width={100} />
                    </Box>
                  ))}
                </Box>

                {/* 🔥 Message sous les images, bien centré */}
                {image && !imageError && (
                  <Typography
                    variant="body2"
                    sx={{ color: 'green', textAlign: 'center', mt: 2 }}
                  >
                    Image sélectionnée avec succès
                  </Typography>
                )}
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              type="submit"
            >
              Valider
            </Button>
          </Box>
        </form>

        {errors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {errors.map((error, index) => (
              <Alert
                key={index}
                severity="error"
                role="alert"
                data-testid={`error-${index}`}
              >
                <Typography variant="body2">{error}</Typography>
              </Alert>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default LotCreationPage;
