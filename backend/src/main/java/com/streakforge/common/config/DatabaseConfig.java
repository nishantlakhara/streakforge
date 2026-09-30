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

        String cleanUrl = (rawUrl != null) ? rawUrl.trim() : "";
        if (cleanUrl.startsWith("jdbc:")) {
            cleanUrl = cleanUrl.substring(5);
        }
        if (cleanUrl.startsWith("postgres://")) {
            cleanUrl = "postgresql://" + cleanUrl.substring("postgres://".length());
        }

        if (cleanUrl.contains("@")) {
            try {
                URI uri = new URI(cleanUrl.replace("postgresql://", "http://"));
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();
                
                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + (path != null ? path : "/streakforge");
                if (query != null && !query.isBlank()) {
                    jdbcUrl += "?" + query;
                } else if (!jdbcUrl.contains("localhost")) {
                    jdbcUrl += "?sslmode=require";
                }

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    user = userInfo[0];
                    if (userInfo.length > 1) {
                        pass = userInfo[1];
                    }
                }
                log.info("Parsed and sanitized database URI: host={}, port={}, user={}", host, port, user);
            } catch (Exception e) {
                log.warn("Could not parse database URI ({}), falling back to direct format", e.getMessage());
                jdbcUrl = rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:" + rawUrl;
            }
        } else {
            if (!cleanUrl.startsWith("postgresql://") && !cleanUrl.startsWith("h2:")) {
                cleanUrl = "postgresql://" + cleanUrl;
            }
            jdbcUrl = "jdbc:" + cleanUrl;
            if (!jdbcUrl.contains("sslmode=") && !jdbcUrl.contains("localhost") && !jdbcUrl.contains("h2:")) {
                jdbcUrl += (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=require";
            }
        }

        log.info("Configuring DataSource for JDBC URL: {} with user: {}", jdbcUrl.replaceAll(":[^/@]+@", ":****@"), user);

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
