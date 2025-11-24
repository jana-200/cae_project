package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.UnauthorizedException;
import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.ChangePassword;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.NewUser;
import be.vinci.ipl.cae.demo.models.dtos.UserDetails;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * AuthController to handle user authentication.
 */
@RestController
@RequestMapping("/auths")
public class AuthController {

  private final UserService userService;

  /**
   * Constructor for AuthController.
   *
   * @param userService the injected UserService.
   */
  public AuthController(UserService userService) {
    this.userService = userService;
  }

  /**
   * Checks whether the provided credentials are invalid.
   *
   * @param credentials The user's login credentials.
   * @return true if the email or password is null or blank, false otherwise.
   */
  private boolean isInvalidCredentials(Credentials credentials) {
    return credentials == null
        || credentials.getEmail() == null
        || credentials.getEmail().isBlank()
        || credentials.getPassword() == null
        || credentials.getPassword().isBlank();
  }

  /**
   * Checks whether the provided new user information is invalid.
   *
   * @param newUser The new user data to validate.
   * @return true if any required field is null or blank, false otherwise.
   */
  private boolean isInvalidNewUser(NewUser newUser) {
    return newUser == null
        || newUser.getEmail() == null || newUser.getEmail().isBlank()
        || newUser.getPassword() == null || newUser.getPassword().isBlank()
        || newUser.getFirstname() == null || newUser.getFirstname().isBlank()
        || newUser.getLastname() == null || newUser.getLastname().isBlank()
        || newUser.getTitle() == null || newUser.getTitle().isBlank()
        || newUser.getPhoneNumber() == null || newUser.getPhoneNumber().isBlank()
        || newUser.getAddress() == null || newUser.getRole() == null;
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Register a new user")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "User successfully registered"),
      @ApiResponse(responseCode = "400", description = "Invalid input (missing fields)"),
      @ApiResponse(responseCode = "409", description = "Email already in use")
  })
  @PostMapping("/register")
  public void register(@RequestBody NewUser newUser) {
    if (isInvalidNewUser(newUser)) {
      throw new BadRequestException("invalid input (missing fields)");
    }

    NewUser user = userService.register(newUser);

    if (user == null) {
      throw new ConflictException("Email already in use");
    }
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Login a user")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Login successful"),
      @ApiResponse(responseCode = "400", description = "Invalid credentials format"),
      @ApiResponse(responseCode = "401", description = "Invalid email or password")
  })
  @PostMapping("/login")
  public AuthenticatedUser login(@RequestBody Credentials credentials) {
    if (isInvalidCredentials(credentials)) {
      throw new BadRequestException("Invalid credentials format");
    }

    AuthenticatedUser user = userService.login(credentials.getEmail(),
        credentials.getPassword());

    if (user == null) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return user;
  }


  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Get authenticated user",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "User retrieved successfully"),
      @ApiResponse(responseCode = "401", description = "User is not authenticated"),
      @ApiResponse(responseCode = "403", description = "Forbidden – missing or invalid token")
  })
  @GetMapping("/me")
  @PreAuthorize("isAuthenticated()")
  public AuthenticatedUser getAuthenticatedUser() {
    User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String email = user.getEmail();

    AuthenticatedUser authenticatedUser = userService.getRefreshToken(email);
    if (authenticatedUser == null) {
      throw new UnauthorizedException("User is not authenticated");
    }
    return authenticatedUser;
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Retrieves the profile details of the authenticated user.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "User profile retrieved"),
      @ApiResponse(responseCode = "404", description = "User not found"),
      @ApiResponse(responseCode = "403",
          description = "User is not not authorized"),
      @ApiResponse(responseCode = "401", description = "Must be authenticated"),

  })
  @GetMapping("/profile")
  @PreAuthorize("isAuthenticated()")
  public UserDetails getUserProfile() {
    User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String email = user.getEmail();
    UserDetails userDetails = userService.getUserDetailsByEmail(email);

    if (userDetails == null) {
      throw new ResourceNotFoundException("User not found");
    }

    return userDetails;
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Change the password of the authenticated user",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Password changed successfully"),
      @ApiResponse(responseCode = "401", description = "Current password is incorrect"),
      @ApiResponse(responseCode = "400", description = "Invalid input (missing fields)"),
      @ApiResponse(responseCode = "403", description = "Forbidden – missing or invalid token")
  })
  @PostMapping("/change-password")
  @PreAuthorize("isAuthenticated()")
  public void changePassword(@RequestBody ChangePassword request) {
    if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()
        || request.getNewPassword() == null || request.getNewPassword().isBlank()) {
      throw new BadRequestException("invalid input (missing fields)");
    }
    User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String email = user.getEmail();

    userService.changePassword(
        email,
        request.getCurrentPassword(),
        request.getNewPassword()
    );

  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Deactivate a user by email",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "User successfully deactivated"),
      @ApiResponse(responseCode = "404", description = "User not found"),
      @ApiResponse(responseCode = "400", description = "Invalid input (missing fields) -"
          + " Email must not be null or blank."),
      @ApiResponse(responseCode = "403", description = "Not authorized to perform this action"),
      @ApiResponse(responseCode = "401", description = "Must be authenticated"),
  })
  @PostMapping("/deactivate/")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public void deactivateUser(@RequestParam String email) {
    if (email == null || email.isBlank()) {
      throw new BadRequestException("Email must not be null or blank.");
    }

    boolean success = userService.deactivateUserByEmail(email);
    if (!success) {
      throw new ResourceNotFoundException("User not found");
    }
  }


  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Check if a user is deactivated by email")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "User deactivation status retrieved"),
      @ApiResponse(responseCode = "404", description = "User not found"),
      @ApiResponse(responseCode = "400", description = "Invalid input (missing fields) -"
          + " Email must not be null or blank."),
  })
  @GetMapping("/deactivated/{email}")
  public boolean isUserDeactivated(@PathVariable String email) {
    if (email.isBlank()) {
      throw new BadRequestException("Email must not be blank.");
    }
    return userService.isUserDeactivated(email);
  }
}
