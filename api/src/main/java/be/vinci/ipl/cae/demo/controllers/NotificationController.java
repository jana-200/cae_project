package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.models.dtos.NewNotification;
import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


/**
 * Controller to manage notifications.
 */
@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

  private final NotificationService notificationService;

  /**
   * Constructs a NotificationController with the given NotificationService.
   *
   * @param notificationService the service to manage notifications
   */

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Retrieve a user's notifications.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "List of notifications of the user"),
      @ApiResponse(responseCode = "404", description = "User not found"),
      @ApiResponse(responseCode = "401", description = "Unauthorized — user must be authenticated"),
      @ApiResponse(responseCode = "403", description = "Forbidden —"
          + " cannot access another user's data"),
  })
  @GetMapping("/")
  @PreAuthorize("isAuthenticated()")
  public List<NotificationDto> getNotifications(@RequestParam String email) {
    User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String authenticatedEmail = user.getEmail();
    if (!authenticatedEmail.equals(email)) {
      throw new AccessDeniedException("You are not allowed to access this user's notifications");
    }
    return notificationService.getNotificationsForUser(email);
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Create a notification for a user.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Notification created"),
      @ApiResponse(responseCode = "404", description = "User not found"),
      @ApiResponse(responseCode = "400", description = "Invalid input for notification")
  })
  @PostMapping()
  public void createNotification(@RequestBody NewNotification notification) {
    if (notification.getNotifiedUser() == null || notification.getNotifiedUser().isEmpty()
        || notification.getNotificationTitle() == null
        || notification.getNotificationTitle().isEmpty()
        || notification.getMessage() == null || notification.getMessage().isEmpty()) {
      throw new BadRequestException("Invalid input for notification");
    }
    notificationService.createNotification(notification);
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Mark a notification as read.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Notification marked as read"),
    @ApiResponse(responseCode = "404", description = "Notification not found"),
    @ApiResponse(responseCode = "400", description = "Invalid id in path variable"),
    @ApiResponse(responseCode = "401", description = "Unauthorized — user must be authenticated"),
    @ApiResponse(responseCode = "403", description = "Forbidden"
        + " — cannot access another user's data"),
  })
  @PutMapping("/{id}/read")
  @PreAuthorize("isAuthenticated()")
  public void markAsRead(@PathVariable Long id) {
    User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String email = user.getEmail();
    notificationService.markAsRead(id, email);
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Mark all notifications of a user as read.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Notifications marked as read"),
    @ApiResponse(responseCode = "404", description = "User not found"),
    @ApiResponse(responseCode = "401", description = "Unauthorized — user must be authenticated"),
    @ApiResponse(responseCode = "403", description = "Forbidden "
        + "— cannot access another user's data"),
  })
  @PutMapping("/read-all")
  @PreAuthorize("isAuthenticated()")
  public void markAllAsRead(@RequestParam String email) {
    User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String emailAuth = user.getEmail();
    if (!email.equals(emailAuth)) {
      throw new AccessDeniedException("You are not allowed to access this user's notifications");
    }
    notificationService.markAllAsRead(email);
  }
}
