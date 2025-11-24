package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Notification repository.
 */

@Repository
public interface NotificationRepository extends CrudRepository<Notification, Long> {
  /**
   * Finds all notifications received by a specific user, ordered by date descending.
   *
   * @param user the user whose notifications should be retrieved
   * @return a list of notifications ordered by date, most recent first
   */
  List<Notification> findByNotifiedUserOrderByNotificationDateDesc(User user);

  /**
   * Finds all unread notifications for a specific user.
   *
   * @param user the user whose notifications should be retrieved
   * @param status the status of the notifications (e.g., UNREAD)
   * @return a list of notifications with the specified status
   */

  List<Notification> findByNotifiedUserAndStatus(User user, Notification.Status status);
}