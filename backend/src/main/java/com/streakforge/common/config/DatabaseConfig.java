package com.streakforge.common.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!test")
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/streakforge}")
    private String rawUrl;

    @Value("${spring.datasource.username:streakforge}")
    private String username;

    @Value("${spring.datasource.password:streakforge}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        
        String jdbcUrl = rawUrl;
        String user = username;
        String pass = password;

        // If the URL is in standard postgres:// or postgresql:// format without jdbc: prefix
        if (rawUrl.startsWith("postgres://") || (rawUrl.startsWith("postgresql://") && !rawUrl.startsWith("jdbc:"))) {
            try {
                URI uri = new URI(rawUrl.replace("postgres://", "http://").replace("postgresql://", "http://"));
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();
                
                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                if (query != null && !query.isBlank()) {
                    jdbcUrl += "?" + query;
                } else {
                    jdbcUrl += "?sslmode=require";
                }

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    user = userInfo[0];
                    if (userInfo.length > 1) {
                        pass = userInfo[1];
                    }
                }
                log.info("Sanitized database URL to JDBC format: host={}, port={}", host, port);
            } catch (Exception e) {
                log.warn("Could not parse database URI, using raw URL with jdbc prefix: {}", e.getMessage());
                jdbcUrl = "jdbc:" + rawUrl;
            }
        }

        if (!jdbcUrl.startsWith("jdbc:")) {
            jdbcUrl = "jdbc:" + jdbcUrl;
        }

        log.info("Configuring DataSource for JDBC URL: {}", jdbcUrl.replaceAll(":[^/@]+@", ":****@"));

        config.setJdbcUrl(jdbcUrl);
        config.setUsername(user);
        config.setPassword(pass);
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(600000);
        config.setConnectionTimeout(20000);
        config.setInitializationFailTimeout(30000);
        
        config.addDataSourceProperty("connectTimeout", "15");
        config.addDataSourceProperty("socketTimeout", "30");
        config.addDataSourceProperty("tcpKeepAlive", "true");

        return new HikariDataSource(config);
    }
}
