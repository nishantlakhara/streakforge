package com.streakforge.common.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
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
        
        String cleanUrl = (rawUrl != null) ? rawUrl.trim() : "";
        if (cleanUrl.startsWith("jdbc:")) {
            cleanUrl = cleanUrl.substring(5);
        }
        if (cleanUrl.startsWith("postgres://")) {
            cleanUrl = cleanUrl.substring("postgres://".length());
        } else if (cleanUrl.startsWith("postgresql://")) {
            cleanUrl = cleanUrl.substring("postgresql://".length());
        }

        String user = username;
        String pass = password;
        String host = "localhost";
        int port = 5432;
        String dbName = "streakforge";
        String query = "";

        // Extract query parameters if present
        int qIdx = cleanUrl.indexOf('?');
        if (qIdx != -1) {
            query = cleanUrl.substring(qIdx + 1);
            cleanUrl = cleanUrl.substring(0, qIdx);
        }

        // Extract user:password if present before '@'
        int atIdx = cleanUrl.lastIndexOf('@');
        if (atIdx != -1) {
            String userInfo = cleanUrl.substring(0, atIdx);
            cleanUrl = cleanUrl.substring(atIdx + 1);
            int colonIdx = userInfo.indexOf(':');
            if (colonIdx != -1) {
                user = userInfo.substring(0, colonIdx);
                pass = userInfo.substring(colonIdx + 1);
            } else {
                user = userInfo;
            }
        }

        // Extract database name if present after '/'
        int slashIdx = cleanUrl.indexOf('/');
        if (slashIdx != -1) {
            dbName = cleanUrl.substring(slashIdx + 1);
            cleanUrl = cleanUrl.substring(0, slashIdx);
        }

        // Extract host and port
        int colonIdx = cleanUrl.indexOf(':');
        if (colonIdx != -1) {
            host = cleanUrl.substring(0, colonIdx);
            try {
                port = Integer.parseInt(cleanUrl.substring(colonIdx + 1));
            } catch (NumberFormatException ignored) {}
        } else if (!cleanUrl.isBlank()) {
            host = cleanUrl;
        }

        if (host == null || host.isBlank() || "null".equalsIgnoreCase(host)) {
            host = "localhost";
        }

        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + (dbName.isBlank() ? "streakforge" : dbName);
        if (!query.isBlank()) {
            jdbcUrl += "?" + query;
        } else if (!host.contains("localhost")) {
            jdbcUrl += "?sslmode=require";
        }

        log.info("Configuring DataSource: host={}, port={}, db={}, user={}", host, port, dbName, user);

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
        
        config.addDataSourceProperty("gssEncMode", "disable");
        config.addDataSourceProperty("connectTimeout", "10");
        config.addDataSourceProperty("loginTimeout", "15");
        config.addDataSourceProperty("socketTimeout", "20");
        config.addDataSourceProperty("tcpKeepAlive", "true");
        config.addDataSourceProperty("sslmode", "require");

        return new HikariDataSource(config);
    }
}
