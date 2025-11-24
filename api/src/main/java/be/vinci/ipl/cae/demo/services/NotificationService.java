package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewNotification;
import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to manage notifications.
 */
@Service
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;

  /**
   * Constructs a NotificationService with the given repositories.
   *
   * @param notificationRepository the repository to manage notifications
   * @param userRepository the repository to manage users
   */

  public NotificationService(NotificationRepository notificationRepository,
                             UserRepository userRepository) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
  }

  /**
   * Creates and saves a new notification for a user.
   *
   * @param notification the notification to create
   * @throws ResourceNotFoundException if the user is not found
   */

  public void createNotification(NewNotification notification) {
    User user = userRepository.findByEmail(notification.getNotifiedUser());
    if (user == null) {
      throw new ResourceNotFoundException("User not found");
    }

    Notification notif = new Notification();
    notif.setNotifiedUser(user);
    notif.setNotificationTitle(notification.getNotificationTitle());
    notif.setMessage(notification.getMessage());
    notif.setNotificationDate(LocalDateTime.now());
    notif.setStatus(Notification.Status.UNREAD);

    notificationRepository.save(notif);
  } 

  /**
   * Retrieves the notifications for a user.
   *
   * @param email the user's email
   * @return a list of notifications
   */

  public List<NotificationDto> getNotificationsForUser(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      throw new ResourceNotFoundException("User not found");
    }

    return notificationRepository.findByNotifiedUserOrderByNotificationDateDesc(user).stream()
            .map(n -> new NotificationDto(
                    n.getId(),  
                    n.getNotifiedUser().getEmail(),
                    n.getNotificationTitle(),
                    n.getMessage(),
                    n.getNotificationDate(),
                    n.getStatus().name() 
            ))
            .collect(Collectors.toList());
  }

  /**
   * Marks a notification as read.
   *
   * @param id the notification's id
   * @param email the authenticated user's email
   */
  public void markAsRead(Long id, String email) {
    Notification notif = notificationRepository.findById(id).orElse(null);
    if (notif == null) {
      throw new ResourceNotFoundException("Notification not found");
    }
    if (!notif.getNotifiedUser().getEmail().equals(email)) {
      throw new AccessDeniedException("You are not allowed to access this user's notifications");
    }
    notif.setStatus(Notification.Status.READ);
    notificationRepository.save(notif);
  }

  /**
   * Marks all notifications of a user as read.
   *
   * @param email the user's email
   */
  @Transactional
  public void markAllAsRead(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      throw new ResourceNotFoundException("User not found");
    }

    List<Notification> notifs = notificationRepository.findByNotifiedUserAndStatus(
            user, Notification.Status.UNREAD);

    for (Notification n : notifs) {
      n.setStatus(Notification.Status.READ);
    }
    notificationRepository.saveAll(notifs);
  }
}
