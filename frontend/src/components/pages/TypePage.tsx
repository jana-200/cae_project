import { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
} from '@mui/material';
import { ProductTypeContext } from '../../contexts/ProductTypeContext';
import { UserContext } from '../../contexts/UserContext';
import { ProductType } from '../../types';

export default function ProductTypeListPage() {
  const [newType, setNewType] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedType, setEditedType] = useState<ProductType | null>(null);
  const [editedLabel, setEditedLabel] = useState('');
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');

  const { productTypes, fetchProductTypes } = useContext(ProductTypeContext);
  const { authenticatedUser } = useContext(UserContext);

  const handleConfirmAdd = async () => {
    setAddError('');
    if (!newType.trim()) {
      setAddError('Le nom du type ne peut pas être vide.');
      setDialogOpen(false);
      return;
    }

    try {
      const res = await fetch('/api/product-types/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token || ''}`,
        },
        body: JSON.stringify({ label: newType }),
      });

      if (res.status === 409) {
        setAddError('Ce type existe déjà.');
        setDialogOpen(false);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Erreur lors de l’ajout du type');
      }

      await res.json();
      fetchProductTypes();
      setNewType('');
      setDialogOpen(false);
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : 'Une erreur est survenue.',
      );
      setDialogOpen(false);
    }
  };

  const handleAddClick = () => {
    setAddError('');
    if (!newType.trim()) {
      setAddError('Le nom du type ne peut pas être vide.');
      return;
    }

    if (!/^(?=.*[a-zA-ZÀ-ÿ])[a-zA-ZÀ-ÿ\s-]+$/.test(newType)) {
      setAddError(
        'Le nom du type doit contenir au moins une lettre et seulement des caractères valides.',
      );
      return;
    }

    setDialogOpen(true);
  };

  const handleEditConfirm = () => {
    setEditError('');
    if (!editedLabel.trim()) {
      setEditError('Le nom du type ne peut pas être vide.');
      return;
    }

    const alreadyExists = productTypes.some(
      (type) =>
        type.label.toLowerCase() === editedLabel.trim().toLowerCase() &&
        type.typeId !== editedType?.typeId,
    );

    if (alreadyExists) {
      setEditError('Ce type existe déjà.');
      return;
    }

    fetch(`/api/product-types/${editedType?.typeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${authenticatedUser?.token || ''}`,
      },
      body: JSON.stringify({ label: editedLabel }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors de la modification');
        return res.json();
      })
      .then(() => {
        fetchProductTypes();
        setEditDialogOpen(false);
      })
      .catch((err) => setEditError(err.message));
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Liste des types de produits
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
        <Table>
          <TableBody>
            {productTypes.map((type) => (
              <TableRow key={type.typeId}>
                <TableCell>{type.label}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 40,
                      minWidth: 120,
                      borderRadius: 2,
                      textTransform: 'none',
                      flexShrink: 0,
                    }}
                    onClick={() => {
                      setEditedType(type);
                      setEditedLabel(type.label);
                      setEditDialogOpen(true);
                      setEditError('');
                    }}
                  >
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mt: 4,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 300,
            flexGrow: 1,
            gap: 1,
          }}
        >
          <TextField
            label="Ajouter un type"
            value={newType}
            onChange={(e) => {
              setNewType(e.target.value);
              if (addError) setAddError('');
            }}
            error={!!addError}
            helperText={addError}
            fullWidth
            size="small"
          />

          <Button
            variant="contained"
            size="small"
            sx={{
              height: 40,
              minWidth: 120,
              borderRadius: 2,
              textTransform: 'none',
              flexShrink: 0,
            }}
            onClick={handleAddClick}
          >
            Ajouter
          </Button>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veux-tu vraiment ajouter le type <strong>{newType}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleConfirmAdd}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Modifier le type</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Entrez le nouveau nom pour le type{' '}
            <strong>{editedType?.label}</strong> :
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={editedLabel}
            onChange={(e) => {
              setEditedLabel(e.target.value);
              if (editError) setEditError('');
            }}
            error={!!editError}
            helperText={editError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleEditConfirm}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
