package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewNotification;
import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {
    @Mock
    private NotificationRepository notificationRepository;

    @Mock 
    private UserRepository userRepository;

    @InjectMocks 
    private NotificationService notificationService;

    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("test@example.com");

        notification = new Notification();
        notification.setId(1L);
        notification.setNotifiedUser(user);
        notification.setNotificationTitle("Test Title");
        notification.setMessage("Test Message");
        notification.setNotificationDate(LocalDateTime.now());
        notification.setStatus(Notification.Status.UNREAD);
    }

    @Test
    void createNotificationShouldSaveNotificationWhenUserExists() {
        //Arrange
        NewNotification newNotification = new NewNotification();
        newNotification.setNotifiedUser(user.getEmail());
        newNotification.setNotificationTitle("Test title");
        newNotification.setMessage("Test message");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user);

        //Act
        notificationService.createNotification(newNotification);

        //Assert
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createNotificationShouldThrowExceptionWhenUserDoesNotExist() {
        //Arrange
        NewNotification newNotification = new NewNotification();
        newNotification.setNotifiedUser("unknow@example.com"); 
        newNotification.setNotificationTitle("Test title");
        newNotification.setMessage("Test Message");

        when(userRepository.findByEmail(newNotification.getNotifiedUser())).thenReturn(null);

        //Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> notificationService.createNotification(newNotification));
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void getNotificationsForUserShouldReturnNotificationListWhenUserExists() {
        //Arrange
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user);
        when(notificationRepository.findByNotifiedUserOrderByNotificationDateDesc(user)).thenReturn(List.of(notification));

        //Act
        List<NotificationDto> result = notificationService.getNotificationsForUser(user.getEmail());

        //Assert
        assertAll(
            () -> assertNotNull(result), 
            () -> assertEquals(1, result.size()),
            () -> assertEquals(notification.getNotificationTitle(), result.get(0).getNotificationTitle())
        );
        verify(notificationRepository).findByNotifiedUserOrderByNotificationDateDesc(user);
    }

    @Test 
    void getNotificationsForUserShouldThrowExceptionWhenUserDoesNotExist() {
        //Arrange
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(null);

        //Act & Assert 
        assertThrows(ResourceNotFoundException.class, () -> notificationService.getNotificationsForUser("unknown@example.com"));
        verify(notificationRepository, never()).findByNotifiedUserOrderByNotificationDateDesc(any());
    }

    @Test
    void markAsReadShouldUpdateNotificationStatusWhenNotificationExists() {
        //Arrange 
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));

        //Act
        notificationService.markAsRead(notification.getId(),user.getEmail());

        //Assert
        assertEquals(Notification.Status.READ, notification.getStatus());
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsReadShouldThrowWhenNotificationDoesNotExist() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            notificationService.markAsRead(1L, user.getEmail())
        );

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void markAllAsReadShouldUpdateAllUnreadNotifications() {
        // Arrange
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user);
        when(notificationRepository.findByNotifiedUserAndStatus(user, Notification.Status.UNREAD))
        .thenReturn(List.of(notification));

        // Act
        notificationService.markAllAsRead(user.getEmail());

        // Assert
        assertEquals(Notification.Status.READ, notification.getStatus());
        verify(notificationRepository).saveAll(List.of(notification));
  }

  @Test
  void markAllAsReadShouldThrowExceptionWhenUserDoesNotExist() {
        // Arrange
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(null);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> notificationService.markAllAsRead("unknown@example.com"));
        verify(notificationRepository, never()).saveAll(any());
  }
}
