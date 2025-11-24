package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;

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
import com.auth0.jwt.algorithms.Algorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;
  @Mock
  private AddressRepository addressRepository;
  @Mock
  private ProducerRepository producerRepository;
  @Mock
  private BCryptPasswordEncoder passwordEncoder;
  @InjectMocks
  private UserService userService;
  @BeforeEach
  void initAlgorithm() {

    var fakeSecret = "test-secret";
    userService.algorithm = Algorithm.HMAC256(fakeSecret);
  }
  @Test
  void loginNonExistingUser() {
    //Arrange
    String email = "user@exemple.com";
    String password = "password";

    when(userRepository.findByEmail(email)).thenReturn(null);
    //Act
    AuthenticatedUser result= userService.login(email, password);
    //Assert
    assertNull(result);
  }

  @Test
  void loginExistingUser() {
    // Arrange
    String password = "password";
    String email = "user@exemple.com";

    User user = new User();
    user.setEmail(email);
    user.setPassword(password);

    when(userRepository.findByEmail(email)).thenReturn(user);
    when(passwordEncoder.matches(password, user.getPassword())).thenReturn(true);

    // Act
    AuthenticatedUser result = userService.login(email, password);

    // Assert
    assertAll(
        () -> assertEquals(email, result.getEmail()),
        () -> assertFalse(result.getToken().isEmpty())
    );
  }

  @Test
  void loginWrongPassword() {
    String email="user@example.com";
    String correctPassword = "password";
    String wrongPassword = "wrongPassword";

    User user = new User();
    user.setEmail(email);
    user.setPassword(correctPassword);

    when(userRepository.findByEmail(email)).thenReturn(user);
    when(passwordEncoder.matches(wrongPassword, correctPassword)).thenReturn(false);

    //Act
    AuthenticatedUser result = userService.login(email, wrongPassword);
    //Assert
    assertNull(result);
  }

  @Test
  void createJwtToken_tokenWithEmail() {
    // Arrange
    String email = "user@exemple.com";

    // Act
    AuthenticatedUser result = userService.createJwtToken(email);

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(email, result.getEmail()),
        () -> assertNotNull(result.getToken()),
        () -> assertFalse(result.getToken().isEmpty())
    );
  }

  @Test
  void verifyJwtToken_tokenIsValid() {
    //Arrange
    String email = "user@exemple.com";

    AuthenticatedUser authUser = userService.createJwtToken(email);
    String token = authUser.getToken();
    //Act
    String result = userService.verifyJwtToken(token);
    //Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(email, result)
    );
  }

  @Test
  void verifyJwtToken_tokenIsInvalid() {
    //Arrange
    String invalidToken = null;

    //Act
    String result = userService.verifyJwtToken(invalidToken);

    //Assert
    assertNull(result);

  }

  @Test
  void registerNewUser_withoutProblem() {
    // Arrange
    String email = "newuser@exemple.com";
    String password = "plaintextpassword";
    String encodedPassword = "hashedpassword";
    String title = "Ms";
    String firstname = "Alice";
    String lastname = "Smith";
    String phoneNumber = "123456789";
    String ManagerUser= null;
    User.Role role= User.Role.CUSTOMER;
    String companyName = null;

    Address inputAddress = new Address();
    Address savedAddress = new Address();

    when(userRepository.findByEmail(email)).thenReturn(null);
    when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
    when(addressRepository.save(inputAddress)).thenReturn(savedAddress);

    //Act
    NewUser newUserDto = new NewUser();
    newUserDto.setEmail(email);
    newUserDto.setPassword(password);
    newUserDto.setTitle(title);
    newUserDto.setFirstname(firstname);
    newUserDto.setLastname(lastname);
    newUserDto.setPhoneNumber(phoneNumber);
    newUserDto.setAddress(savedAddress);
    newUserDto.setRole(role);
    newUserDto.setAccountCreatorManager(ManagerUser);
    newUserDto.setCompanyName(companyName);

    NewUser result = userService.register(newUserDto);
    //Assert
    assertAll(
      () -> assertEquals(email, result.getEmail()),
      () -> assertEquals(password,result.getPassword()),
      () -> assertEquals(title, result.getTitle()),
      () -> assertEquals(firstname, result.getFirstname()),
      () -> assertEquals(lastname, result.getLastname()),
      () -> assertEquals(phoneNumber, result.getPhoneNumber()),
      () -> assertEquals(inputAddress, result.getAddress()),
      () -> assertEquals(ManagerUser, result.getAccountCreatorManager()),
      () -> assertEquals(role, result.getRole())
    );
  }


  @Test
  void registerNewUser_emailAlreadyExists() {
    //Arrange
    String email = "existing@exemple.com";
    String password = "mypassword";
    String title = "Mr";
    String firstname = "John";
    String lastname = "Doe";
    String phoneNumber = "123456789";
    Address address = new Address();
    String ManagerUser= null;
    User.Role role= User.Role.CUSTOMER;
    String companyName = null;

    User existingUser = new User();
    existingUser.setEmail(email);

    when(userRepository.findByEmail(email)).thenReturn(existingUser);
    //Act
    NewUser newUserDto = new NewUser();
    newUserDto.setEmail(email);
    newUserDto.setPassword(password);
    newUserDto.setTitle(title);
    newUserDto.setFirstname(firstname);
    newUserDto.setLastname(lastname);
    newUserDto.setPhoneNumber(phoneNumber);
    newUserDto.setAddress(address);
    newUserDto.setRole(role);
    newUserDto.setAccountCreatorManager(ManagerUser);
    newUserDto.setCompanyName(companyName);

    NewUser result = userService.register(newUserDto);
    //Assert
    assertNull(result);
  }

  @Test
  void registerNewProducer_withoutProblem() {
    // Arrange
    String email = "producer@exemple.com";
    String password = "plaintextpassword";
    String encodedPassword = "hashedpassword";
    String title = "Ms";
    String firstname = "Alice";
    String lastname = "Smith";
    String phoneNumber = "123456789";
    String managerEmail = "manager@example.com";
    User.Role role = User.Role.PRODUCER; // Changé à PRODUCTER
    String companyName = "Test Company";

    Address inputAddress = new Address();
    Address savedAddress = new Address();
    User managerUser = new User(); // Création d'un vrai manager

    when(userRepository.findByEmail(email)).thenReturn(null);
    when(userRepository.findByEmail(managerEmail)).thenReturn(managerUser);
    when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
    when(addressRepository.save(inputAddress)).thenReturn(savedAddress);

    // Act
    NewUser newUserDto = new NewUser();
    newUserDto.setEmail(email);
    newUserDto.setPassword(password);
    newUserDto.setTitle(title);
    newUserDto.setFirstname(firstname);
    newUserDto.setLastname(lastname);
    newUserDto.setPhoneNumber(phoneNumber);
    newUserDto.setAddress(savedAddress);
    newUserDto.setRole(role);
    newUserDto.setAccountCreatorManager(managerEmail);
    newUserDto.setCompanyName(companyName);

    NewUser result = userService.register(newUserDto);

    // Assert
    assertAll("verify producer fields",
      () -> assertNotNull(result),
      () -> assertEquals(email, result.getEmail()),
      () -> assertEquals(role, result.getRole()),
      () -> assertEquals(companyName, result.getCompanyName())
    );
    verify(producerRepository, times(1)).save(any(Producer.class));
  }
  @Test
  void readOneFromEmail_UserExists() {
    // Arrange
    String email = "test@exemple.com";
    User user = new User();
    user.setEmail(email);

    when(userRepository.findByEmail(email)).thenReturn(user);

    // Act
    User result = userService.readOneFromEmail(email);

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(email, result.getEmail())
    );
  }

  @Test
  void readOneFromEmail_serNotFound() {
    // Arrange
    String email = "inexistant@exemple.com";
    when(userRepository.findByEmail(email)).thenReturn(null);

    // Act
    User result = userService.readOneFromEmail(email);

    // Assert
    assertNull(result);
  }

  @Test
  void createOne() {
    // Arrange
    String email = "user@example.com";
    String password = "plaintext";
    String encodedPassword = "encoded-password";
    String title = "Ms";
    String firstname = "Alice";
    String lastname = "Smith";
    String phoneNumber = "123456789";
    String accountCreatorManagerEmail = "manager@example.com";
    User.Role role = User.Role.CUSTOMER;
  
    Address inputAddress = new Address();
    Address savedAddress = new Address();
  
    when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
    when(addressRepository.save(inputAddress)).thenReturn(savedAddress);
  
    NewUser newUser = new NewUser();
    newUser.setEmail(email);
    newUser.setPassword(password);
    newUser.setTitle(title);
    newUser.setFirstname(firstname);
    newUser.setLastname(lastname);
    newUser.setPhoneNumber(phoneNumber);
    newUser.setAddress(inputAddress);
    newUser.setAccountCreatorManager(accountCreatorManagerEmail);
    newUser.setRole(role);
  
    // Act
    userService.createOne(newUser);
  
    // Assert
    verify(passwordEncoder, times(1)).encode(password);
    verify(addressRepository, times(1)).save(inputAddress);
    verify(userRepository, times(1)).save(any(User.class));
  }
  

  @Test
  void getRefreshTokenExists() {
    // Arrange
    String email = "user@exemple.com";
    User user = new User();
    user.setEmail(email);

    when(userRepository.findByEmail(email)).thenReturn(user);

    // Act
    AuthenticatedUser result = userService.getRefreshToken(email);

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(email, result.getEmail()),
        () -> assertNotNull(result.getToken()),
        () -> assertFalse(result.getToken().isEmpty())
    );
  }

  @Test
  void getRefreshTokenNotFound() {
    // Arrange
    String email = "unknown@exemple.com";

    when(userRepository.findByEmail(email)).thenReturn(null);

    // Act
    AuthenticatedUser result = userService.getRefreshToken(email);

    // Assert
    assertNull(result);
  }

  @Test
  void getUserDetailsByEmail_UserExists() {
    // Arrange
    String email = "test@example.com";
    User user = new User();
    user.setEmail(email);
    user.setTitle("Mr");
    user.setFirstname("John");
    user.setLastname("Doe");
    user.setPhoneNumber("123456789");
    user.setAddress(new Address());
    user.setRole(User.Role.CUSTOMER);
    user.setUserId(1L);


    when(userRepository.findByEmail(email)).thenReturn(user);

    // Act
    UserDetails result = userService.getUserDetailsByEmail(email);

    // Assert
    assertAll(
      () -> assertNotNull(result),
      () -> assertEquals(email, result.getEmail()),
      () -> assertEquals("John", result.getFirstname()),
      () -> assertEquals(1L, result.getId())
    );
  }

  @Test
  void getUserDetailsByEmail_NoExistingUser() {
    // Arrange
    String email = "notfoud@example.com";
    User user = new User();
    user.setEmail(email);
    user.setTitle("Mr");
    user.setFirstname("John");
    user.setLastname("Doe");
    user.setPhoneNumber("123456789");
    user.setAddress(new Address());
    user.setRole(User.Role.CUSTOMER);
    user.setUserId(1L);


    when(userRepository.findByEmail(email)).thenReturn(null);

    // Act
    UserDetails result = userService.getUserDetailsByEmail(email);

    // Assert
    assertNull(result);
  }

  @Test
  void changePassword_Successful() {
    // Arrange
    String email = "user@example.com";
    String currentPassword = "oldPass";
    String newPassword = "newPass";
    String encodedOldPass = "encodedOldPass";
    String encodedNewPass = "encodedNewPass";

    User user = new User();
    user.setPassword(encodedOldPass);

    when(userRepository.findByEmail(email)).thenReturn(user);
    when(passwordEncoder.matches(currentPassword, encodedOldPass)).thenReturn(true);
    when(passwordEncoder.encode(newPassword)).thenReturn(encodedNewPass);

    // Act
   userService.changePassword(email, currentPassword, newPassword);

    // Assert

    assertEquals(encodedNewPass, user.getPassword());

    verify(userRepository, times(1)).save(user);
  }
  @Test
  void changePassword_WrongPassword() {
    // Arrange
    String email = "user@example.com";
    String currentPassword = "oldPass";
    String newPassword = "newPass";
    String encodedOldPass = "encodedDiffOldPass";

    User user = new User();
    user.setPassword(encodedOldPass);

    when(userRepository.findByEmail(email)).thenReturn(user);
    when(passwordEncoder.matches(currentPassword, encodedOldPass)).thenReturn(false);

    // Act & Assert
    assertThrows(UnauthorizedException.class, () ->
        userService.changePassword(email, currentPassword, newPassword)
    );

    verify(userRepository, never()).save(any());
    verify(passwordEncoder, never()).encode(any());
  }


  @Test
  void changePassword_ShouldThrowWhenWrongPassword() {
    // Arrange
    String email = "user@example.com";
    String wrongPassword = "wrongPass";
    String newPassword = "newPass";
    String encodedCorrectPass = "encodedCorrectPass";

    User user = new User();
    user.setPassword(encodedCorrectPass);

    when(userRepository.findByEmail(email)).thenReturn(user);
    when(passwordEncoder.matches(wrongPassword, encodedCorrectPass)).thenReturn(false);

    // Act & Assert
    UnauthorizedException exception = assertThrows(UnauthorizedException.class,
        () -> userService.changePassword(email, wrongPassword, newPassword));

    assertEquals("Current password is incorrect", exception.getMessage());

    verify(passwordEncoder, never()).encode(any());
    verify(userRepository, never()).save(any());
  }
  @Test
void registerUserWithEmptyAccountCreatorManager_ShouldWork() {
  // Arrange
  String email = "test@exemple.com";
  String password = "password";
  Address address = new Address();
  String encodedPassword = "encoded";

  when(userRepository.findByEmail(email)).thenReturn(null);
  when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
  when(addressRepository.save(address)).thenReturn(address);

  NewUser newUser = new NewUser();
  newUser.setEmail(email);
  newUser.setPassword(password);
  newUser.setTitle("Mr");
  newUser.setFirstname("Jean");
  newUser.setLastname("Dupont");
  newUser.setPhoneNumber("12345");
  newUser.setAddress(address);
  newUser.setAccountCreatorManager(null); // <- Important ici
  newUser.setRole(User.Role.CUSTOMER);
  newUser.setCompanyName(null);

  // Act
  NewUser result = userService.register(newUser);

  // Assert
  assertAll(
      () -> assertNotNull(result),
      () -> assertEquals(email, result.getEmail()),
      () -> assertEquals(User.Role.CUSTOMER, result.getRole())
  );
  verify(producerRepository, times(0)).save(any());
}

@Test
void registerProducerWithBlankCompanyName_ShouldNotCreateProducer() {
  // Arrange
  String email = "producer@exemple.com";
  String password = "pass";
  Address address = new Address();
  String encodedPassword = "encoded";

  when(userRepository.findByEmail(email)).thenReturn(null);
  when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
  when(addressRepository.save(address)).thenReturn(address);

  NewUser newUser = new NewUser();
  newUser.setEmail(email);
  newUser.setPassword(password);
  newUser.setTitle("Mme");
  newUser.setFirstname("Anna");
  newUser.setLastname("Smith");
  newUser.setPhoneNumber("123456");
  newUser.setAddress(address);
  newUser.setAccountCreatorManager(null);
  newUser.setRole(User.Role.PRODUCER);
  newUser.setCompanyName(""); 
  // Act
  NewUser result = userService.register(newUser);

  // Assert
  assertAll(
      () -> assertNotNull(result),
      () -> assertEquals(User.Role.PRODUCER, result.getRole())
  );
  verify(producerRepository, times(0)).save(any());
}

  @Test
  void getUserDetailsByEmail_ProducerWithoutProducerEntry() {
    // Arrange
    String email = "producer@example.com";
    User user = new User();
    user.setEmail(email);
    user.setTitle("Mr");
    user.setFirstname("John");
    user.setLastname("Doe");
    user.setPhoneNumber("123456789");
    user.setAddress(new Address());
    user.setRole(User.Role.PRODUCER);
    user.setUserId(1L);

    when(userRepository.findByEmail(email)).thenReturn(user);
    when(producerRepository.findByUserEmail(email)).thenReturn(null); 

    // Act
    UserDetails result = userService.getUserDetailsByEmail(email);

    // Assert
    assertNotNull(result);
    assertNull(result.getCompanyName()); 
  }
  
  @Test
  void getUserDetailsByEmail_ProducerWithProducerEntry() {
    String email = "producer@example.com";
    String companyName = "Super Company";

    User user = new User();
    user.setEmail(email);
    user.setTitle("Mme");
    user.setFirstname("Anna");
    user.setLastname("Smith");
    user.setPhoneNumber("123456789");
    user.setAddress(new Address());
    user.setRole(User.Role.PRODUCER);
    user.setUserId(42L);

    Producer producer = new Producer();
    producer.setCompanyName(companyName);

    when(userRepository.findByEmail(email)).thenReturn(user);
    when(producerRepository.findByUserEmail(email)).thenReturn(producer);

    //Act
    UserDetails result = userService.getUserDetailsByEmail(email);

    //Assert
    assertAll(
      () -> assertNotNull(result), 
      () -> assertEquals(companyName, result.getCompanyName()), 
      () -> assertEquals(email, result.getEmail()), 
      () -> assertEquals("Anna", result.getFirstname())
    );
  }

}