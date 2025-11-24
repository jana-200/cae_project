package be.vinci.ipl.cae.demo.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

/**
 * GlobalExceptionHandler to handle exceptions globally.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

  private Logger logger = LoggerFactory.getLogger("GlobalExceptionHandler");

  private ErrorDetails createErrorDetails(HttpStatus status, Exception ex, WebRequest request,
      HttpServletRequest httpRequest, boolean forLog) {
    String description =
        forLog ? "httpMethod=" + httpRequest.getMethod() + ";" + request.getDescription(true)
            : request.getDescription(false);
    return new ErrorDetails(status.value(),
        ex.getClass().getName() + " : " + ex.getMessage() + ". Cause: " + ex.getCause(),
        description);
  }

  /**
   * Handle ResourceNotFoundException.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex,
      WebRequest request, HttpServletRequest httpRequest) {
    ErrorDetails errorDetailsClient = createErrorDetails(HttpStatus.NOT_FOUND, ex, request,
        httpRequest, false);
    ErrorDetails errorDetailsLog = createErrorDetails(HttpStatus.NOT_FOUND, ex, request,
        httpRequest, true);

    logger.info("Resource not found: {}", errorDetailsLog);

    if (ex.getMessage() == null) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    return new ResponseEntity<>(errorDetailsClient, HttpStatus.NOT_FOUND);
  }

  /**
   * Handle BadRequestException.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<?> handleBadRequestException(BadRequestException ex,
      WebRequest request, HttpServletRequest httpRequest) {
    ErrorDetails errorDetailsClient = createErrorDetails(HttpStatus.BAD_REQUEST, ex, request,
        httpRequest, false);
    ErrorDetails errorDetailsLog = createErrorDetails(HttpStatus.BAD_REQUEST, ex, request,
        httpRequest, true);

    logger.info("Bad Request: {}", errorDetailsLog);

    if (ex.getMessage() == null) {
      return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    return new ResponseEntity<>(errorDetailsClient, HttpStatus.BAD_REQUEST);
  }

  /**
   * Handle ConflictException.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<?> handleBadRequestException(ConflictException ex,
      WebRequest request, HttpServletRequest httpRequest) {
    ErrorDetails errorDetailsClient = createErrorDetails(HttpStatus.CONFLICT, ex, request,
        httpRequest, false);
    ErrorDetails errorDetailsLog = createErrorDetails(HttpStatus.CONFLICT, ex, request,
        httpRequest, true);

    logger.info("Conflict: {}", errorDetailsLog);

    if (ex.getMessage() == null) {
      return new ResponseEntity<>(HttpStatus.CONFLICT);
    }

    return new ResponseEntity<>(errorDetailsClient, HttpStatus.CONFLICT);
  }

  /**
   * Handle UnauthorizedException.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<?> handleUnauthorizedException(UnauthorizedException ex,
      WebRequest request, HttpServletRequest httpRequest) {

    ErrorDetails errorDetailsClient = createErrorDetails(HttpStatus.UNAUTHORIZED, ex, request,
        httpRequest, false);
    ErrorDetails errorDetailsLog = createErrorDetails(HttpStatus.UNAUTHORIZED, ex, request,
        httpRequest, true);

    logger.info("Unauthorized: {}", errorDetailsLog);

    if (ex.getMessage() == null) {
      return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    return new ResponseEntity<>(errorDetailsClient, HttpStatus.UNAUTHORIZED);
  }


  /**
   * Handle ResponseStatusException.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<?> handleResponseStatusException(ResponseStatusException ex,
      WebRequest request, HttpServletRequest httpRequest) {
    ErrorDetails errorDetailsClient = createErrorDetails(
        HttpStatus.valueOf(ex.getStatusCode().value()), ex, request,
        httpRequest, false);
    ErrorDetails errorDetailsLog = createErrorDetails(
        HttpStatus.valueOf(ex.getStatusCode().value()), ex, request, httpRequest,
        true);

    logger.info("Response status exception: {}", errorDetailsLog);

    if (ex.getReason() == null) {
      return new ResponseEntity<>(ex.getStatusCode());
    }

    return new ResponseEntity<>(errorDetailsClient, ex.getStatusCode());
  }

  /**
   * Handle AccessDeniedException.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<?> handleAccessDeniedException(AccessDeniedException ex, WebRequest request,
      HttpServletRequest httpRequest) {
    if (request.getHeader("Authorization") == null) {
      ErrorDetails errorDetailsClient = createErrorDetails(HttpStatus.UNAUTHORIZED, ex, request,
          httpRequest, false);
      ErrorDetails errorDetails = createErrorDetails(HttpStatus.UNAUTHORIZED, ex, request,
          httpRequest, true);
      logger.info("Unauthorized access: {}", errorDetails);
      return new ResponseEntity<>(errorDetailsClient, HttpStatus.UNAUTHORIZED);
    }

    ErrorDetails errorDetailsClient = createErrorDetails(HttpStatus.FORBIDDEN, ex, request,
        httpRequest, false);
    ErrorDetails errorDetailsLog = createErrorDetails(HttpStatus.FORBIDDEN, ex, request,
        httpRequest, true);

    logger.info("Forbidden access: {}", errorDetailsLog);
    return new ResponseEntity<>(errorDetailsClient, HttpStatus.FORBIDDEN);
  }

  /**
   * Handle MethodArgumentTypeMismatchException (invalid path variables, e.g. non-numeric ID).
   *
   * @param ex          the exception.
   * @param request     the request.
   * @param httpRequest the HTTP servlet request.
   * @return the response entity.
   */
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<?> handleMethodArgumentTypeMismatchException(
      MethodArgumentTypeMismatchException ex,
      WebRequest request,
      HttpServletRequest httpRequest) {

    String message = String.format("Invalid value for parameter '%s': '%s'. Expected a number.",
        ex.getName(), ex.getValue());

    ErrorDetails errorDetailsClient = createErrorDetails(HttpStatus.BAD_REQUEST,
        new RuntimeException(message), request, httpRequest, false);
    ErrorDetails errorDetailsLog = createErrorDetails(HttpStatus.BAD_REQUEST,
        new RuntimeException(message), request, httpRequest, true);

    logger.info("Bad request: {}", errorDetailsLog);
    return new ResponseEntity<>(errorDetailsClient, HttpStatus.BAD_REQUEST);
  }

  /**
   * Handle all other exceptions.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleGlobalException(Exception ex, WebRequest request,
      HttpServletRequest httpRequest) {
    ErrorDetails errorDetailsClient = createErrorDetails(HttpStatus.INTERNAL_SERVER_ERROR, ex,
        request, httpRequest, false);
    ErrorDetails errorDetailsLog = createErrorDetails(HttpStatus.INTERNAL_SERVER_ERROR, ex, request,
        httpRequest, true);

    logger.error("Internal server error: {}", errorDetailsLog);

    return new ResponseEntity<>(errorDetailsClient, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}