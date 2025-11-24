package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.UnauthorizedException;
import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.NewUser;
import be.vinci.ipl.cae.demo.models.dtos.UserDetails;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User service.
 */
@Service
public class UserService {

  @Value("${JWT_SECRET}")
  private String jwtSecret;
  private static final long lifetimeJwt = 24 * 60 * 60 * 1000; // 24 hours

  //not in private so the mock tests have access to it
  Algorithm algorithm;

  private final BCryptPasswordEncoder passwordEncoder;
  private final UserRepository userRepository;
  private final AddressRepository addressRepository;
  private final ProducerRepository producerRepository;


  /**
   * Constructor.
   */
  @PostConstruct
  public void init() {
    this.algorithm = Algorithm.HMAC256(jwtSecret);
  }

  /**
   * Constructor.
   *
   * @param passwordEncoder the password encoder
   * @param userRepository  the user repository
   */
  public UserService(BCryptPasswordEncoder passwordEncoder, UserRepository userRepository,
      AddressRepository addressRepository, ProducerRepository producerRepository) {
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
    this.addressRepository = addressRepository;
    this.producerRepository = producerRepository;

  }

  /**
   * Create a JWT token.
   *
   * @param email the email to included in the claim
   * @return the JWT token
   */
  public AuthenticatedUser createJwtToken(String email) {
    String token = JWT.create().withIssuer("auth0").withClaim("email", email)
        .withIssuedAt(new Date()).withExpiresAt(new Date(System.currentTimeMillis() + lifetimeJwt))
        .sign(algorithm);

    AuthenticatedUser authenticatedUser = new AuthenticatedUser();
    authenticatedUser.setEmail(email);
    authenticatedUser.setToken(token);

    return authenticatedUser;
  }

  /**
   * Verify a JWT token.
   *
   * @param token the token to verify
   * @return the email if the token is valid, null otherwise
   */
  public String verifyJwtToken(String token) {
    try {
      return JWT.require(algorithm).build().verify(token).getClaim("email").asString();
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Login a user.
   *
   * @param email    the email
   * @param password the password
   * @return the authenticated user if the login is successful, null otherwise
   */
  public AuthenticatedUser login(String email, String password) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      return null;
    }

    if (user.isDeactivated()) {
      return null;
    }

    if (!passwordEncoder.matches(password, user.getPassword())) {
      return null;
    }

    return createJwtToken(email);
  }

  /**
   * Register a new user.
   *
   * @param newUserDto the new user to register
   * @return the authenticated user if the registration is successful, null otherwise
   */
  @Transactional
  public NewUser register(NewUser newUserDto) {

    if (userRepository.findByEmail(newUserDto.getEmail()) != null) {
      return null;
    }

    User user = createOne(newUserDto);

    if (newUserDto.getRole() == User.Role.PRODUCER 
        && newUserDto.getCompanyName() != null 
        && !newUserDto.getCompanyName().isBlank()) {

      Producer producer = new Producer();
      producer.setUser(user);
      producer.setCompanyName(newUserDto.getCompanyName());
      producerRepository.save(producer);
    }

    return newUserDto;
  }


  /**
   * Read a user from its email.
   *
   * @param email the email
   * @return the user if it exists, null otherwise
   */
  public User readOneFromEmail(String email) {
    return userRepository.findByEmail(email);
  }

  /**
   * Create a new user.
   *
   * @param newUser the new user to create
   */
  public User createOne(NewUser newUser) {
    
    User accountCreator = null;
    if (newUser.getAccountCreatorManager() != null
        && !newUser.getAccountCreatorManager().isBlank()) {
      accountCreator = userRepository.findByEmail(newUser.getAccountCreatorManager());
    }

    String hashedPassword = passwordEncoder.encode(newUser.getPassword());
    Address savedAddress = addressRepository.save(newUser.getAddress());

    User user = new User();
    user.setEmail(newUser.getEmail());
    user.setPassword(hashedPassword);
    user.setTitle(newUser.getTitle());
    user.setFirstname(newUser.getFirstname());
    user.setLastname(newUser.getLastname());
    user.setPhoneNumber(newUser.getPhoneNumber());
    user.setAddress(savedAddress);
    user.setRegistrationDate(LocalDateTime.now());
    user.setAccountCreatorManager(accountCreator);
    user.setRole(newUser.getRole());
    System.out.println("new User" + user);

    return userRepository.save(user);
  }


  /**
   * Refreshes the JWT token for an existing user.
   *
   * @param email The user's email.
   * @return An AuthenticatedUser with a new JWT token, or null if the user does not exist.
   */
  public AuthenticatedUser getRefreshToken(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      return null;
    }
    return createJwtToken(email);
  }


  /**
   * Retrieves user details by email.
   *
   * @param email The user's email.
   * @return A UserDetails object if the user exists, otherwise null.
   */

  public UserDetails getUserDetailsByEmail(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      return null;
    }
    UserDetails userDetails = new UserDetails();
    userDetails.setEmail(user.getEmail());
    userDetails.setTitle(user.getTitle());
    userDetails.setFirstname(user.getFirstname());
    userDetails.setLastname(user.getLastname());
    userDetails.setPhoneNumber(user.getPhoneNumber());
    userDetails.setAddress(user.getAddress());
    userDetails.setRole(user.getRole());
    userDetails.setId(user.getUserId());
    userDetails.setDeactivated(user.isDeactivated());
    if (user.getRole() == User.Role.PRODUCER) {
      Producer producer = producerRepository.findByUserEmail(user.getEmail());
      if (producer != null) {
        userDetails.setCompanyName(producer.getCompanyName());
      }
    } else {
      userDetails.setCompanyName(null);
    }

    return userDetails;
  }

  /**
   * Changes the user's password.
   *
   * @param email           The user's email.
   * @param currentPassword The current password.
   * @param newPassword     The new password.
   */
  public void changePassword(String email, String currentPassword, String newPassword) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      throw new UnauthorizedException("User not found");
    }
    if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
      throw new UnauthorizedException("Current password is incorrect");
    }
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
  }

  /**
   * Deactivates a user by email.
   *
   * @param email The user's email.
   * @return true if the user was deactivated, false if the user does not exist.
   */
  public boolean deactivateUserByEmail(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      return false;
    }
    user.setDeactivated(!user.isDeactivated());
    userRepository.save(user);
    return true;
  }

  /**
   * Checks if a user is deactivated.
   *
   * @param email The user's email.
   * @return true if the user is deactivated, false otherwise.
   * @throws ResourceNotFoundException if the user is not found.
   */
  public boolean isUserDeactivated(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      throw new ResourceNotFoundException("User not found");
    }
    return user.isDeactivated();
  }
}

