package be.vinci.ipl.cae.demo.exceptions;

import lombok.Data;

/**
 * ErrorDetails to handle error details.
 */
@Data
public class ErrorDetails {

  private int statusCode;
  private String message;
  private String details;

  /**
   * Constructor for ErrorDetails.
   *
   * @param statusCode the status code.
   * @param message    the message.
   * @param details    the details.
   */
  public ErrorDetails(int statusCode, String message, String details) {
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
  }
}