package be.vinci.ipl.cae.demo.configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for OpenAPI (Swagger) documentation.
 */
@Configuration
public class OpenApiConfig {

  /**
   * Bean definition for customizing the OpenAPI documentation.
   *
   * @return an OpenAPI object with custom configuration
   */
  @Bean
  public OpenAPI customOpenApi() {
    return new OpenAPI()
        .info(new Info().title("Terroir Cie API").version("1.0"))
        .components(new Components().addSecuritySchemes("bearerAuth",
            new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization")
        ));
  }
}
