# Configuration Reference - Service Operator

This document provides a comprehensive reference for configuring Phoenix.

## Configuration File Location

The main configuration file is located at:
- Linux: `/etc/phoenix/config.yaml`
- Container: `/config/phoenix.yaml`

## Configuration Sections

### Server Configuration

```yaml
server:
  # Server listening address
  host: 0.0.0.0
  
  # Server port
  port: 8080
  
  # TLS configuration
  tls:
    enabled: true
    cert_file: /etc/phoenix/certs/server.crt
    key_file: /etc/phoenix/certs/server.key
```

### Database Configuration

```yaml
database:
  # Database host
  host: localhost
  
  # Database port
  port: 5432
  
  # Database name
  name: phoenix
  
  # Database user
  user: phoenix
  
  # Database password (use environment variable in production)
  password: ${DB_PASSWORD}
  
  # Connection pool settings
  pool:
    max_connections: 50
    min_connections: 10
```

### Authentication Configuration

```yaml
auth:
  # Authentication provider
  provider: ldap  # Options: local, ldap, oauth2
  
  # Session timeout (in minutes)
  session_timeout: 60
  
  # LDAP configuration (when provider is ldap)
  ldap:
    server: ldap://ldap.example.com
    base_dn: dc=example,dc=com
    bind_dn: cn=admin,dc=example,dc=com
    bind_password: ${LDAP_PASSWORD}
```

### Logging Configuration

```yaml
logging:
  # Log level: debug, info, warn, error
  level: info
  
  # Log format: json, text
  format: json
  
  # Log output: stdout, file
  output: stdout
  
  # Log file (when output is file)
  file: /var/log/phoenix/phoenix.log
```

## Environment Variables

Phoenix supports configuration via environment variables:

- `PHOENIX_CONFIG_FILE` - Path to configuration file
- `DB_PASSWORD` - Database password
- `LDAP_PASSWORD` - LDAP bind password
- `LOG_LEVEL` - Override log level

## Configuration Validation

Validate your configuration before applying:

```bash
phoenix config validate --config /etc/phoenix/config.yaml
```
