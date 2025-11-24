package be.vinci.ipl.cae.demo.exceptions;

/**
 * UnauthorizedException to handle unauthorized access exceptions.
 */
public class UnauthorizedException extends RuntimeException {

  /**
   * Constructor for UnauthorizedException.
   *
   * @param message the message.
   */
  public UnauthorizedException(String message) {
    super(message);
  }
}
