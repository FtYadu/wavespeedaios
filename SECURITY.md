# Security Considerations

This document outlines the security measures implemented in the AI Chat Interface application and best practices for maintaining security.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API Key Security](#api-key-security)
3. [Data Protection](#data-protection)
4. [Input Validation](#input-validation)
5. [Rate Limiting](#rate-limiting)
6. [CORS Configuration](#cors-configuration)
7. [HTTPS Enforcement](#https-enforcement)
8. [Database Security](#database-security)
9. [Frontend Security](#frontend-security)
10. [Backend Security](#backend-security)
11. [Monitoring & Logging](#monitoring--logging)
12. [Security Best Practices](#security-best-practices)

## Authentication & Authorization

### JWT Implementation

- **Token Generation**: Uses JWT with RS256 algorithm for secure token generation
- **Token Expiration**: Configurable expiration (default 7 days)
- **Refresh Tokens**: Not implemented (consider for production)
- **Secret Management**: Environment variable with strong random value

```typescript
// JWT Configuration
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
});
```

### Password Security

- **Hashing**: bcrypt with 10 rounds (configurable)
- **Password Requirements**: Minimum 8 characters, uppercase, lowercase, number
- **Password Storage**: Never stored in plain text

```typescript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Password validation
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
  message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
})
```

### NextAuth.js Configuration

- **Session Strategy**: JWT with secure cookie storage
- **CSRF Protection**: Enabled by default
- **Secure Cookies**: HTTPS only in production

## API Key Security

### WaveSpeed API Key Storage

**⚠️ CRITICAL**: API keys are stored on the backend only and never exposed to the frontend.

```typescript
// Backend storage (encrypted with AES-256-GCM)
const encryptedKey = this.encryptionService.encrypt(apiKey);
await this.prisma.user.update({
  where: { id: userId },
  data: { apiKey: encryptedKey },
});

// API calls from backend only
const resolvedKey = await this.authService.getUserApiKey(userId);
const response = await this.httpService.post(
  `${this.apiUrl}/chat/completions`,
  payload,
  {
    headers: {
      'Authorization': `Bearer ${resolvedKey}`,
    },
  },
);
```

### Key Rotation

- **System Keys**: Rotate quarterly
- **User Keys**: Allow users to update their keys
- **Key Validation**: Validate keys before storing

## Data Protection

### Encryption

- **Passwords**: Hashed using bcrypt (not encrypted)
- **API Keys**: Should be encrypted in database (use crypto module)
- **Data in Transit**: HTTPS enforced
- **Data at Rest**: Database encryption (provider-dependent)

### Sensitive Data Handling

```typescript
// Remove sensitive fields before returning user data
const { password, apiKey, ...safeUserData } = user;
return safeUserData;
```

### Session Management

- **Session Storage**: Secure HTTP-only cookies
- **Session Timeout**: 7 days (configurable)
- **Concurrent Sessions**: Multiple sessions allowed
- **Session Invalidation**: On logout

## Input Validation

### Backend Validation (NestJS)

```typescript
// DTO with validation decorators
export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  message: string;

  @IsString()
  @IsIn(['gpt-3.5-turbo', 'gpt-4'])
  model: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ModelParameters)
  parameters?: ModelParameters;
}
```

### Frontend Validation

```typescript
// Client-side validation
const handleSendMessage = (content: string) => {
  if (!content.trim() || isLoading) return;
  if (content.length > 10000) {
    showError('Message too long');
    return;
  }
  // ... send message
};
```

### SQL Injection Prevention

- **Prisma ORM**: Parameterized queries by default
- **Raw Queries**: Avoid when possible, use parameters when necessary

```typescript
// Safe query with Prisma
const user = await this.prisma.user.findUnique({
  where: { email },
});

// If raw query needed, use parameters
const result = await this.prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

## Rate Limiting

### Implementation

```typescript
// Rate limiting configuration
ThrottlerModule.forRoot([
  {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
    limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
  },
]),

// Apply to controllers
@UseGuards(ThrottlerGuard)
@Controller('chat')
export class ChatController {
  // ... endpoints
}
```

### Rate Limiting Rules

- **Authentication**: 5 requests per minute
- **Chat Messages**: 10 requests per minute
- **API Key Management**: 20 requests per minute

## CORS Configuration

### Strict CORS Policy

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL, // Specific origin only
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### CORS Headers

- **Access-Control-Allow-Origin**: Specific domain only
- **Access-Control-Allow-Credentials**: true
- **Access-Control-Allow-Methods**: Limited HTTP methods

## HTTPS Enforcement

### Production Configuration

```typescript
// Helmet for security headers
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

## Database Security

### Connection Security

```typescript
// SSL connection (when supported by provider)
const databaseUrl = process.env.DATABASE_URL;
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { ssl: { rejectUnauthorized: false } }
  : {};
```

### Access Control

- **Principle of Least Privilege**: Minimal database permissions
- **Connection Pooling**: Limit concurrent connections
- **Prepared Statements**: Use Prisma ORM

### Data Retention

```typescript
// Implement data retention policy
async cleanupOldData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await this.prisma.message.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
      session: {
        updatedAt: { lt: thirtyDaysAgo },
      },
    },
  });
}
```

## Frontend Security

### XSS Prevention

```typescript
// React automatically escapes content
// For dangerouslySetInnerHTML, sanitize first
import DOMPurify from 'dompurify';

const safeHtml = DOMPurify.sanitize(untrustedHtml);
```

### CSRF Protection

```typescript
// NextAuth.js provides CSRF protection
// Custom CSRF token implementation if needed
```

### Content Security Policy

```html
<!-- In _app.tsx or _document.tsx -->
<meta
  httpEquiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
/>
```

## Backend Security

### Security Headers

```typescript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: false, // Let frontend handle CSP
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
}));
```

### Error Handling

```typescript
// Don't expose sensitive information in errors
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong'
        : message,
    });
  }
}
```

## Monitoring & Logging

### Security Event Logging

```typescript
// Log security events
@Injectable()
export class SecurityLogger {
  constructor(private prisma: PrismaService) {}

  async logSecurityEvent(
    userId: string,
    eventType: string,
    details: any,
  ) {
    await this.prisma.securityEvent.create({
      data: {
        userId,
        eventType,
        details,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
      },
    });
  }
}
```

### Events to Log

- Failed login attempts
- API key changes
- Unusual activity patterns
- Permission denied errors
- Rate limit violations

## Security Best Practices

### 1. Regular Security Audits

- **Dependency Scanning**: Use `npm audit` regularly
- **Code Reviews**: Security-focused code reviews
- **Penetration Testing**: Regular security testing

### 2. Keep Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### 3. Environment Security

- **Separate Environments**: Development, staging, production
- **Environment Variables**: Use secure secret management
- **Access Control**: Limit access to production systems

### 4. Data Privacy

- **GDPR Compliance**: Implement data deletion requests
- **Data Minimization**: Only collect necessary data
- **Encryption**: Encrypt sensitive data at rest

### 5. Incident Response

- **Incident Response Plan**: Document procedures
- **Backup Strategy**: Regular backups and restoration testing
- **Communication**: Clear escalation procedures

## Security Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Strong secrets generated
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error handling secure
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security headers configured

### Post-Deployment

- [ ] Monitor error logs
- [ ] Set up alerting
- [ ] Regular security audits
- [ ] Backup verification
- [ ] Performance monitoring
- [ ] User activity monitoring

## Additional Security Measures

### Two-Factor Authentication (Future Enhancement)

```typescript
// TOTP implementation for admin users
import * as speakeasy from 'speakeasy';

const secret = speakeasy.generateSecret({
  name: 'AI Chat App',
  length: 32,
});
```

### API Key Rotation

```typescript
// Automated key rotation
@Cron('0 0 1 * *') // Monthly
async rotateApiKeys() {
  // Implementation for key rotation
}
```

### Advanced Threat Protection

- **Rate Limiting by IP**: Additional IP-based rate limiting
- **Geolocation Filtering**: Block requests from specific regions
- **Device Fingerprinting**: Detect suspicious devices

## Compliance

### GDPR Considerations

- **Data Processing Agreement**: With service providers
- **User Rights**: Right to deletion, portability
- **Consent Management**: Clear consent for data processing
- **Data Breach Notification**: Procedures for breach notification

### CCPA Considerations

- **Privacy Policy**: Clear privacy policy
- **Do Not Sell**: Opt-out mechanisms
- **Data Deletion**: User-initiated deletion

## Emergency Procedures

### Security Incident Response

1. **Immediate Actions**:
   - Isolate affected systems
   - Preserve logs
   - Notify security team

2. **Investigation**:
   - Analyze logs
   - Identify root cause
   - Assess impact

3. **Recovery**:
   - Patch vulnerabilities
   - Restore services
   - Monitor for recurrence

4. **Post-Incident**:
   - Document incident
   - Improve procedures
   - Share lessons learned

### Contact Information

- **Security Team**: security@yourcompany.com
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Management**: management@yourcompany.com

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks)
- [NestJS Security](https://docs.nestjs.com/security)

## Conclusion

Security is an ongoing process, not a one-time setup. Regular audits, updates, and monitoring are essential for maintaining a secure application. This document should be reviewed and updated regularly as new threats emerge and the application evolves.
