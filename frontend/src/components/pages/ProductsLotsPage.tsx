import React, { useContext, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Pagination,
} from '@mui/material';
import { ProductLotContext } from '../../contexts/ProductLotContext';
import AvailableLotCard from '../AvailableLotCard';
import SoldOutLotCard from '../SoldOutLotCard';
import PendingLotCard from '../PendingLotCard';
import { ProductLot } from '../../types';

const ProductsLotsPage = () => {
  const {
    pendingLots,
    acceptedLots,
    refusedLots,
    availableLots,
    soldOutLots,
    fetchPendingLots,
    fetchAcceptedLots,
    fetchRefusedLots,
    fetchAvailableLots,
    fetchSoldOutLots,
  } = useContext(ProductLotContext);

  const [selectedTab, setSelectedTab] = useState(0);
  const [lotsToDisplay, setLotsToDisplay] = useState<ProductLot[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  const totalPages = Math.ceil(lotsToDisplay.length / itemsPerPage);
  const paginatedLots = lotsToDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleTabChange = async (
    _event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setSelectedTab(newValue);
    setCurrentPage(1);
    if (newValue === 0) await fetchPendingLots();
    if (newValue === 1) await fetchAcceptedLots();
    if (newValue === 2) await fetchRefusedLots();
    if (newValue === 3) await fetchAvailableLots();
    if (newValue === 4) await fetchSoldOutLots();
  };

  useEffect(() => {
    const loadInitialLots = async () => {
      await fetchPendingLots();
    };
    loadInitialLots();
  }, [fetchPendingLots]);

  useEffect(() => {
    if (selectedTab === 0) setLotsToDisplay(pendingLots);
    if (selectedTab === 1) setLotsToDisplay(acceptedLots);
    if (selectedTab === 2) setLotsToDisplay(refusedLots);
    if (selectedTab === 3) setLotsToDisplay(availableLots);
    if (selectedTab === 4) setLotsToDisplay(soldOutLots);
  }, [
    selectedTab,
    pendingLots,
    acceptedLots,
    refusedLots,
    availableLots,
    soldOutLots,
  ]);

  const CardComponent =
    selectedTab === 0 || selectedTab === 1 || selectedTab === 2
      ? PendingLotCard
      : selectedTab === 4
        ? SoldOutLotCard
        : AvailableLotCard;

  return (
    <Container sx={{ py: 4 }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        width="100%"
      >
        <Typography variant="h5" gutterBottom>
          Mes propositions de lots
        </Typography>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="en attente" />
          <Tab label="acceptés" />
          <Tab label="refusés" />
          <Tab label="en vente" />
          <Tab label="vendus" />
        </Tabs>

        {paginatedLots.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Aucun lot à afficher.
          </Typography>
        ) : (
          <>
            {paginatedLots.map((lot, index) => (
              <Box key={index} sx={{ mb: 3, width: '100%', maxWidth: 900 }}>
                <CardComponent lot={lot} />
              </Box>
            ))}

            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, value) => setCurrentPage(value)}
                color="primary"
                sx={{ mt: 2 }}
              />
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default ProductsLotsPage;
