package be.vinci.ipl.cae.demo.exceptions;

/**
 * BadRequestException to handle bad request exceptions.
 */
public class BadRequestException extends RuntimeException {

  /**
   * Constructor for BadRequestException.
   *
   * @param message the message.
   */
  public BadRequestException(String message) {
    super(message);
  }

  /**
   * Constructor for BadRequestException.
   *
   * @param message the message.
   * @param cause the cause.
   */
  public BadRequestException(String message, Throwable cause) {
    super(message, cause);
  }
}
