package be.vinci.ipl.cae.demo.exceptions;

/**
 * ConflictException to handle conflict exceptions.
 */
public class ConflictException extends RuntimeException {

  /**
   * Constructor for ConflictException.
   *
   * @param message the message.
   */
  public ConflictException(String message) {
    super(message);
  }

}
