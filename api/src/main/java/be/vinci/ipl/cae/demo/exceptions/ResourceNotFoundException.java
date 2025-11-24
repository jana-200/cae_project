package be.vinci.ipl.cae.demo.exceptions;

/**
 * ResourceNotFoundException to handle resource not found exceptions.
 */
public class ResourceNotFoundException extends RuntimeException {

  /**
   * Constructor for ResourceNotFoundException.
   */
  public ResourceNotFoundException() {
    super();
  }

  /**
   * Constructor for ResourceNotFoundException.
   *
   * @param message the message.
   */
  public ResourceNotFoundException(String message) {
    super(message);
  }
}
