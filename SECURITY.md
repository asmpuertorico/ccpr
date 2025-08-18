# Security Configuration

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Admin Authentication
ADMIN_PASSWORD=your-secure-admin-password

# JWT Configuration (minimum 32 characters)
JWT_SECRET=your-jwt-secret-key-minimum-32-characters

# CSRF Protection (minimum 32 characters)  
CSRF_SECRET=your-csrf-secret-key-minimum-32-characters

# Database (for future use)
DATABASE_URL=postgresql://user:password@localhost:5432/prconvention

# File Storage
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

## Security Features Implemented

### Phase 1: Critical Security ✅

1. **JWT-based Session Management**
   - Replaced simple cookies with secure JWT tokens
   - 12-hour token expiration
   - Signed and verified tokens with HS256

2. **Logout Functionality**
   - Secure logout endpoint that clears tokens
   - Session cleanup on logout

3. **Rate Limiting**
   - 5 failed login attempts per IP address
   - 15-minute lockout period
   - Automatic cleanup of old attempts

4. **CSRF Protection**
   - CSRF tokens for all admin operations
   - Token validation on server-side
   - Automatic token refresh

5. **Input Validation & Sanitization**
   - Comprehensive validation for all event data
   - HTML sanitization using DOMPurify
   - Server-side validation with detailed error messages

6. **Session Timeout Warnings**
   - Automatic session expiration checks
   - Warning notifications 30 minutes before expiration
   - Automatic logout on session expiry

## Password Security

The system includes password strength validation:
- Minimum 8 characters
- Must contain uppercase, lowercase, numbers, and special characters
- Blocks common weak passwords

## API Security

All admin API endpoints now include:
- JWT authentication verification
- CSRF token validation
- Input sanitization
- Error handling without information leakage

## Production Deployment

For production deployment, ensure:
1. Use strong, unique secrets for JWT_SECRET and CSRF_SECRET
2. Enable HTTPS (handled by Vercel)
3. Set secure environment variables in Vercel dashboard
4. Monitor logs for security events

