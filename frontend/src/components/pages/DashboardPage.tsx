import { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { DataGrid } from '@mui/x-data-grid';
import { Autocomplete } from '@mui/material';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import { ProductLotContextType, Product } from '../../types';

const DashboardPage = () => {
  const {
    fetchSalesStatistics,
    fetchProductSuggestions,
    productOptions,
  }: ProductLotContextType = useContext(ProductLotContext);

  const months = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const [productLabel, setProductLabel] = useState('');
  const [month, setMonth] = useState<number | ''>('');
  const [year, setYear] = useState<number | ''>('');
  const [graphData, setGraphData] = useState<{ x: number; sales: number }[]>(
    [],
  );
  const [tableRows, setTableRows] = useState<Record<string, string | number>[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalSold, setTotalSold] = useState(0);

  const columns = [
    { field: 'productLabel', headerName: 'Produit', flex: 1, sortable: false },
    {
      field: 'initialQuantity',
      headerName: 'Total reçues',
      flex: 1,
      sortable: false,
    },
    {
      field: 'soldQuantity',
      headerName: 'Total vendues',
      flex: 1,
      sortable: false,
    },
  ];

  const handleSearch = async () => {
    if (!productLabel.trim()) return;
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const data = await fetchSalesStatistics(
        productLabel,
        month || undefined,
        year || undefined,
      );
      const salesPerDay = data.salesPerDay || {};
      const receivedPerDay = data.receivedPerDay || {};

      let graphPoints: { x: number; sales: number }[] = [];

      if (!year) {
        const currentYear = new Date().getFullYear();
        const startYear = 2022;
        const yearlySales: Record<number, number> = {};
        const yearlyReceived: Record<number, number> = {};

        for (let y = startYear; y <= currentYear; y++) {
          yearlySales[y] = 0;
          yearlyReceived[y] = 0;
        }
        Object.entries(salesPerDay).forEach(([dateStr, sales]) => {
          const yearKey = new Date(dateStr).getFullYear();
          if (yearKey >= startYear && yearKey <= currentYear) {
            yearlySales[yearKey] += Number(sales);
          }
        });

        Object.entries(receivedPerDay).forEach(([dateStr, received]) => {
          const yearKey = new Date(dateStr).getFullYear();
          if (yearKey >= startYear && yearKey <= currentYear) {
            yearlyReceived[yearKey] += Number(received);
          }
        });

        graphPoints = Object.entries(yearlySales).map(([yearStr, sales]) => ({
          x: Number(yearStr),
          sales,
          received: yearlyReceived[Number(yearStr)],
        }));
      } else if (year && !month) {
        const monthlySales = Array(12).fill(0);
        const monthlyReceived = Array(12).fill(0);

        Object.entries(salesPerDay).forEach(([dateStr, sales]) => {
          const date = new Date(dateStr);
          const monthIndex = date.getMonth();
          monthlySales[monthIndex] += Number(sales);
        });

        Object.entries(receivedPerDay).forEach(([dateStr, received]) => {
          const date = new Date(dateStr);
          const monthIndex = date.getMonth();
          monthlyReceived[monthIndex] += Number(received);
        });

        graphPoints = monthlySales.map((sales, index) => ({
          x: index + 1,
          sales,
          received: monthlyReceived[index],
        }));
      } else {
        const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
        const dailySales = Array(daysInMonth).fill(0);
        const dailyReceived = Array(daysInMonth).fill(0);

        Object.entries(salesPerDay).forEach(([dateStr, sales]) => {
          const date = new Date(dateStr);
          const day = date.getDate();
          dailySales[day - 1] += Number(sales);
        });

        Object.entries(receivedPerDay).forEach(([dateStr, received]) => {
          const date = new Date(dateStr);
          const day = date.getDate();
          dailyReceived[day - 1] += Number(received);
        });

        graphPoints = dailySales.map((sales, i) => ({
          x: i + 1,
          sales,
          received: dailyReceived[i],
        }));
      }

      setGraphData(graphPoints);
      setTableRows([
        {
          id: 1,
          productLabel,
          initialQuantity: data.totalReceived,
          soldQuantity: data.totalSold,
        },
      ]);
      setTotalReceived(data.totalReceived);
      setTotalSold(data.totalSold);
    } catch (err) {
      console.error('Error fetching sales statistics :', err);
      setError(
        'Aucun produit correspondant trouvé. Veuillez vérifier votre saisie.',
      );
      setGraphData([]);
      setTableRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (
    _event: React.SyntheticEvent,
    value: string,
  ) => {
    setProductLabel(value);
    if (value.length >= 2) {
      await fetchProductSuggestions(value);
    }
  };

  return (
    <Box p={4}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4}>
          Tableau de bord
        </Typography>
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        mb={4}
        justifyContent="flex-start"
        alignItems="center"
      >
        <Box sx={{ minWidth: 250 }}>
          <Autocomplete
            options={productOptions.map((p: Product) => p.label)}
            value={productLabel}
            onInputChange={handleInputChange}
            onChange={(_event, value) => setProductLabel(value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nom du produit"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                size="small"
              />
            )}
            freeSolo
          />
        </Box>

        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="year-label">Année</InputLabel>
            <Select
              labelId="year-label"
              data-testid="year-select"
              value={year}
              onChange={(e) => {
                const selected =
                  e.target.value === '' ? '' : Number(e.target.value);
                setYear(selected);
                if (!selected) setMonth('');
              }}
            >
              <MenuItem value="">Toutes</MenuItem>
              {Array.from(
                { length: new Date().getFullYear() - 2022 + 1 },
                (_, i) => 2022 + i,
              ).map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth size="small" disabled={!year}>
            <InputLabel id="month-label">Mois</InputLabel>
            <Select
              labelId="month-label"
              data-testid="month-select"
              value={month}
              onChange={(e) =>
                setMonth(e.target.value === '' ? '' : Number(e.target.value))
              }
            >
              <MenuItem value="">Tous</MenuItem>
              {months.map((m, i) => (
                <MenuItem key={m} value={i + 1}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 140 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSearch}
            disabled={!productLabel.trim()}
            size="small"
            sx={{ height: '40px' }}
          >
            Rechercher
          </Button>
        </Box>
      </Box>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {!hasSearched && (
        <Typography variant="body1" color="text.secondary">
          {' '}
          veuillez sélectionner un produit pour afficher les statistiques.
        </Typography>
      )}

      {!loading && !error && hasSearched && (
        <>
          <Box display="flex" gap={4} my={4}>
            <Card sx={{ minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Total reçues</Typography>
                <Typography variant="h4">{totalReceived}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Total vendues</Typography>
                <Typography variant="h4">{totalSold}</Typography>
              </CardContent>
            </Card>
          </Box>

          <Typography variant="h6" gutterBottom>
            Évolution des ventes
          </Typography>
          <BarChart
            dataset={graphData}
            xAxis={[
              {
                scaleType: 'band',
                dataKey: 'x',
                label: !year
                  ? 'Année'
                  : year && !month
                    ? 'Mois'
                    : 'Jour du mois',
                valueFormatter: (val) =>
                  !year
                    ? `${val}`
                    : year && !month
                      ? months[val - 1]
                      : `${val}`,
              },
            ]}
            series={[
              { dataKey: 'sales', label: 'Ventes', color: '#91a893' },
              { dataKey: 'received', label: 'Reçus', color: '#4f8a8b' },
            ]}
            grid={{ horizontal: true }}
            height={300}
          />

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Résumé des ventes
            </Typography>
            <DataGrid
              rows={tableRows}
              columns={columns}
              hideFooter
              disableColumnMenu
              disableRowSelectionOnClick
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
