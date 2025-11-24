import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  useTheme,
} from '@mui/material';
import { SyntheticEvent, useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { ProductLotContextType } from '../../types';

const EditLotImagePage = () => {
  const {
    fetchExistingImage,
    existingImages,
    lot,
    updateLot,
    fetchProductSuggestions,
    productOptions,
    fetchProductLotById,
  }: ProductLotContextType = useContext(ProductLotContext);

  const theme = useTheme();
  const { lotId } = useParams<{ lotId: string }>();
  const navigate = useNavigate();

  const [image, setImage] = useState<File>();
  const [errors, setErrors] = useState<string[]>([]);
  const [, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [existing, setExisting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setExisting(false);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
      setErrors([]);
    }
  };

  useEffect(() => {
    const loadLot = async () => {
      if (lotId) {
        try {
          await fetchProductLotById(Number(lotId));
          setErrors([]);
        } catch (err) {
          console.error('Erreur lors du chargement du lot :', err);
          if (!lot) {
            setErrors(["Ce lot est introuvable ou n'existe pas."]);
          }
        }
      }
    };
    loadLot();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotId]);

  useEffect(() => {
    if (lot?.productLabel) {
      fetchProductSuggestions(lot.productLabel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lot]);

  const handleSelectExistingImage = async () => {
    try {
      if (!lot?.productLabel) {
        return;
      }
      const matchedProduct = productOptions.find(
        (p) => p.label.toLowerCase() === lot.productLabel.toLowerCase(),
      );
      if (!matchedProduct) {
        setErrors(['Produit associé non trouvé dans la liste.']);
        return;
      }
      await fetchExistingImage(matchedProduct.productId);
      setExisting(true);
    } catch (err) {
      console.error('handleSelectExistingImage::error', err);
      setErrors(['Erreur lors de la récupération des images existantes.']);
    }
  };

  const validateForm = () => {
    const newFieldErrors: { [key: string]: boolean } = {};
    const validationErrors: string[] = [];
    if (!image) {
      validationErrors.push('Veuillez sélectionner ou importer une image.');
      newFieldErrors.image = true;
    }
    setFieldErrors(newFieldErrors);
    setErrors(validationErrors);
    return validationErrors;
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      return;
    }
    try {
      await updateLot(Number(lotId), image);
      setErrors([]);
      setFieldErrors({});
      navigate('/my-lots');
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
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
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      <Box
        sx={{
          width: 1000,
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
          Modifier l'image du lot
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
              mt: 1,
            }}
          >
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{
                  py: 1,
                  px: 2,
                  fontSize: '0.9rem',
                  borderRadius: 2,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: '#fff',
                  },
                }}
              >
                Importer une image
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            </Box>

            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleSelectExistingImage}
                sx={{
                  py: 1,
                  px: 2,
                  fontSize: '0.9rem',
                  borderRadius: 2,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: '#fff',
                  },
                }}
              >
                Choisir une image existante
              </Button>
            </Box>

            {existing && existingImages.length === 0 && (
              <Box sx={{ width: '100%' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'red',
                    textAlign: 'center',
                    mt: 1,
                    fontWeight: 500,
                  }}
                >
                  Aucune image existante trouvée pour ce produit.
                </Typography>
              </Box>
            )}

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
            {image && (
              <Box sx={{ width: '100%' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'green',
                    textAlign: 'center',
                    mt: 1,
                    fontWeight: 500,
                  }}
                >
                  Image sélectionnée avec succès
                </Typography>
              </Box>
            )}
          </Box>

          {existing && existingImages.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              {existingImages.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    border:
                      selectedImageUrl === url
                        ? '2px solid #1976d2'
                        : '1px solid gray',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={async () => {
                    try {
                      const res = await fetch(url);
                      const blob = await res.blob();
                      const file = new File([blob], `image-${index}.jpg`, {
                        type: blob.type,
                      });
                      setImage(file);
                      setSelectedImageUrl(url);
                      setExisting(true);
                      setPreviewUrl(null);
                      const fileInput = document.getElementById(
                        'image',
                      ) as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    } catch (err) {
                      setErrors(['Erreur lors du chargement de cette image.']);
                    }
                  }}
                >
                  <img src={url} alt={`img-${index}`} width={100} />
                </Box>
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            type="submit"
          >
            Valider
          </Button>
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

export default EditLotImagePage;
