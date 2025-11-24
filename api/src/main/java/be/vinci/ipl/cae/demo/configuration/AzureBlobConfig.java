package be.vinci.ipl.cae.demo.configuration;

import com.azure.storage.blob.BlobClientBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for the BlobClientBuilder.
 */

@Configuration
public class AzureBlobConfig {
  /**
   * Bean for the BlobClientBuilder.
   *
   * @return the BlobClientBuilder
   */
  @Bean
  public BlobClientBuilder blobClientBuilder() {
    return new BlobClientBuilder();
  }
}
