package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.OpenSaleDto;
import be.vinci.ipl.cae.demo.models.dtos.OpenSaleProductDto;
import be.vinci.ipl.cae.demo.models.entities.OpenSale;
import be.vinci.ipl.cae.demo.models.entities.ProductLot;
import be.vinci.ipl.cae.demo.repositories.OpenSaleRepository;
import be.vinci.ipl.cae.demo.repositories.ProductLotRepository;
import be.vinci.ipl.cae.demo.repositories.ProductOpenSaleRepository;

import java.util.Optional;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OpenSaleServiceTest {

  @Mock
  private OpenSaleRepository openSaleRepository;

  @Mock
  private ProductLotRepository productLotRepository;

  @Mock
  private ProductOpenSaleRepository productOpenSaleRepository;

  @InjectMocks
  private OpenSaleService openSaleService;

  private OpenSaleDto openSaleDto;
  private ProductLot productLot;
  private OpenSaleProductDto openSaleProductDto;

  @BeforeEach
  void setUp() {
    openSaleProductDto = new OpenSaleProductDto();
    openSaleProductDto.setProductLotId(1L);
    openSaleProductDto.setQuantity(5);

    openSaleDto = new OpenSaleDto();
    openSaleDto.setReservedProducts(List.of(openSaleProductDto));

    productLot = new ProductLot();
    productLot.setLotId(1L);
    productLot.setRemainingQuantity(10);
    productLot.setReservedQuantity(0);
    productLot.setState(ProductLot.State.FOR_SALE);
  }

  @Test
  void createOpenSale_successful() {
    when(productLotRepository.findByIdForUpdate(1L))
      .thenReturn(Optional.of(productLot));
    when(openSaleRepository.save(any(OpenSale.class)))
      .thenAnswer(invocation -> invocation.getArgument(0));

    boolean result = openSaleService.createOpenSale(openSaleDto);

    assertTrue(result);
    verify(productLotRepository, times(1)).findByIdForUpdate(1L);
    verify(productLotRepository).save(any(ProductLot.class));
    verify(openSaleRepository).save(any(OpenSale.class));
    verify(productOpenSaleRepository).saveAll(anyList());
  }

  @Test
  void createOpenSale_shouldThrow_whenProductLotNotFound() {
    when(productLotRepository.findByIdForUpdate(1L))
      .thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class,
      () -> openSaleService.createOpenSale(openSaleDto));

    verify(productLotRepository).findByIdForUpdate(1L);
    verify(openSaleRepository, never()).save(any(OpenSale.class));
  }

  @Test
  void createOpenSale_shouldThrow_whenProductLotNotForSale() {
    productLot.setState(ProductLot.State.SOLD_OUT);
    when(productLotRepository.findByIdForUpdate(1L))
      .thenReturn(Optional.of(productLot));

    assertThrows(ConflictException.class,
      () -> openSaleService.createOpenSale(openSaleDto));

    verify(productLotRepository).findByIdForUpdate(1L);
  }

  @Test
  void createOpenSale_shouldThrow_whenNotEnoughQuantity() {
    productLot.setRemainingQuantity(2);
    when(productLotRepository.findByIdForUpdate(1L))
      .thenReturn(Optional.of(productLot));

    assertThrows(ConflictException.class,
      () -> openSaleService.createOpenSale(openSaleDto));

    verify(productLotRepository).findByIdForUpdate(1L);
  }
}
