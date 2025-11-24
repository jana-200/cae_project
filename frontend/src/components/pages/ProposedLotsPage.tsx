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
import ProposedLotCard from '../ProposedLotCard';
import { ProductLot } from '../../types';

const ProposedLotsPage = () => {
  const { allLotsForManager, fetchAllLotsForManager } =
    useContext(ProductLotContext);
  const [selectedTab, setSelectedTab] = useState(3);
  const [filteredLots, setFilteredLots] = useState<ProductLot[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredLots.length / itemsPerPage);

  const paginatedLots = filteredLots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchAllLotsForManager();
  }, [fetchAllLotsForManager]);

  useEffect(() => {
    let filtered: ProductLot[] = [];
    switch (selectedTab) {
      case 0:
        filtered = allLotsForManager.filter(
          (lot) => lot.productLotState === 'PENDING',
        );
        break;
      case 1:
        filtered = allLotsForManager.filter(
          (lot) => lot.productLotState === 'ACCEPTED',
        );
        break;
      case 2:
        filtered = allLotsForManager.filter(
          (lot) => lot.productLotState === 'REJECTED',
        );
        break;
      case 3:
        filtered = allLotsForManager.filter(
          (lot) => lot.productLotState === 'FOR_SALE',
        );
        break;
      case 4:
        filtered = allLotsForManager.filter(
          (lot) => lot.productLotState === 'SOLD_OUT',
        );
        break;
    }
    setFilteredLots(filtered);
  }, [selectedTab, allLotsForManager]);

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
          Propositions de lots
        </Typography>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
          centered
        >
          <Tab label="En attente" />
          <Tab label="Acceptés" />
          <Tab label="Refusés" />
          <Tab label="En vente" />
          <Tab label="épuisé" />
        </Tabs>

        {paginatedLots.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Aucun lot à afficher.
          </Typography>
        ) : (
          <>
            {paginatedLots.map((lot, index) => (
              <Box
                key={index}
                sx={{ mb: 3, width: '100%', maxWidth: 900 }}
                data-testid="proposed-lot-card"
              >
                <Typography data-testid="lot-state" sx={{ display: 'none' }}>
                  {lot.productLotState === 'PENDING' && 'En attente'}
                  {lot.productLotState === 'ACCEPTED' && 'Accepté'}
                  {lot.productLotState === 'REJECTED' && 'Refusé'}
                  {lot.productLotState === 'FOR_SALE' && 'En vente'}
                  {lot.productLotState === 'SOLD_OUT' && 'Épuisé'}
                </Typography>
                <ProposedLotCard
                  lot={lot}
                  fetchAllLots={fetchAllLotsForManager}
                />
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

export default ProposedLotsPage;
