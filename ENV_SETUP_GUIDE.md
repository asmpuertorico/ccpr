# 🔧 Environment Variables Setup Guide

## 📋 **Required Environment Variables**

Copy this to your `.env.local` file in the `prconvention/` directory:

```bash
# =============================================================================
# PUERTO RICO CONVENTION CENTER - ENVIRONMENT VARIABLES
# =============================================================================

# =============================================================================
# AUTHENTICATION & SECURITY (REQUIRED)
# =============================================================================

# Admin login password - Use a strong password!
ADMIN_PASSWORD=YourSecureAdminPassword123!

# JWT Secret - MUST be at least 32 characters
# Generate with: openssl rand -base64 32
JWT_SECRET=your-jwt-secret-must-be-at-least-32-characters-long-random-string

# CSRF Secret - For form protection
# Generate with: openssl rand -base64 32  
CSRF_SECRET=your-csrf-secret-must-be-at-least-32-characters-long-random-string

# =============================================================================
# DATABASE (REQUIRED)
# =============================================================================

# PostgreSQL connection string
# For Neon (recommended): https://neon.tech
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# =============================================================================
# FILE STORAGE (REQUIRED)
# =============================================================================

# Vercel Blob Storage Token
# Get from: https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxx

# =============================================================================
# MONITORING (OPTIONAL)
# =============================================================================

# Sentry for error tracking
SENTRY_DSN=https://xxxxxxxxx@xxxxxxxxx.ingest.sentry.io/xxxxxxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxx@xxxxxxxxx.ingest.sentry.io/xxxxxxxxx
```

## 🚀 **Setup Instructions**

### **Step 1: Database Setup (Neon - Recommended)**
1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project: "PR Convention Center"
3. Copy the connection string
4. Add to `DATABASE_URL` in `.env.local`

### **Step 2: Blob Storage Setup (Vercel)**
1. Go to [vercel.com/dashboard/stores](https://vercel.com/dashboard/stores)
2. Create new Blob store: "pr-convention-images"
3. Copy the read/write token
4. Add to `BLOB_READ_WRITE_TOKEN` in `.env.local`

### **Step 3: Generate Secrets**
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate CSRF secret  
openssl rand -base64 32
```

### **Step 4: Error Tracking Setup (Optional)**
1. Go to [sentry.io](https://sentry.io) and create account
2. Create new project: "PR Convention Admin"
3. Copy both DSN values
4. Add to `.env.local`

### **Step 5: Create .env.local File**
```bash
cd prconvention/
touch .env.local
# Copy the environment variables above into this file
```

## ✅ **Verification**

Run this command to check your setup:
```bash
npm run build
```

If successful, all environment variables are configured correctly!

## 🔒 **Security Notes**

- **Never commit** `.env.local` to git
- Use **strong passwords** (12+ characters, mixed case, numbers, symbols)
- **Rotate secrets** regularly in production
- Use **different secrets** for development and production

## 🌐 **Production Deployment (Vercel)**

Set these in Vercel dashboard → Project Settings → Environment Variables:
- `ADMIN_PASSWORD`
- `JWT_SECRET` 
- `CSRF_SECRET`
- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `SENTRY_DSN` (optional)
- `NEXT_PUBLIC_SENTRY_DSN` (optional)

