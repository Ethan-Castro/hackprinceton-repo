# Quick Start: Authentication & Storage

## 🚀 Get Started in 3 Steps

### Step 1: Set Environment Variables

Create `.env.local` in your project root:

```bash
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Your Neon database URL (from the credentials you provided)
DATABASE_URL=postgresql://neondb_owner:npg_3CnOGubvJ8zh@ep-frosty-sound-a4g18j9l-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 2: Initialize Database

```bash
# Start dev server
pnpm dev

# In another terminal, initialize database
curl -X POST http://localhost:3000/api/db-init
```

### Step 3: Test It!

Visit these URLs:
- `http://localhost:3000/` - Use anonymously (no account needed)
- `http://localhost:3000/auth/signup` - Create an account
- `http://localhost:3000/auth/login` - Sign in
- `http://localhost:3000/textbook-studio` - See saved chats (when signed in)

## ✨ What You Get

### Anonymous Users (No Account)
- ✅ Full AI features
- ✅ No sign-up required
- ⚠️ No data saved

### Registered Users (With Account)
- ✅ Full AI features
- ✅ Chat history saved
- ✅ Access from any device
- ✅ 50 chats/day (vs 3 for anonymous)

## 🎯 Key Pages

| Page | Purpose | URL |
|------|---------|-----|
| Home | Main app (works without account) | `/` |
| Sign Up | Create account | `/auth/signup` |
| Sign In | Login | `/auth/login` |
| Textbook Studio | AI content creation + saved chats | `/textbook-studio` |

## 🔑 User Menu

Click the user avatar in the sidebar:

**When NOT signed in:**
- Create Account
- Sign In

**When signed in:**
- Account info
- Sign Out

## 📝 How It Works

```
Anonymous User → Uses app → Decides to save data → Signs up → Data persists
                    ↓
              Full features available at every step!
```

## 🛠️ Troubleshooting

### Database Connection Error
```bash
# Check your DATABASE_URL is correct
echo $DATABASE_URL

# Reinitialize database
curl -X POST http://localhost:3000/api/db-init
```

### "Unauthorized" Error
```bash
# Check NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Restart dev server
pnpm dev
```

### Can't Sign In
- Check email/password are correct
- Clear browser cookies
- Try signing up again with different email

## 📚 More Info

- **Full Setup Guide**: `AUTHENTICATION_SETUP.md`
- **Implementation Details**: `SIGNUP_IMPLEMENTATION_SUMMARY.md`
- **Database Guide**: `NEON_DB_INTEGRATION.md`

## 🎉 That's It!

Your app now supports:
- ✅ Optional authentication
- ✅ Data persistence with Neon
- ✅ Saved chat history
- ✅ Cross-device access

**Everyone can use the app, but accounts enable data persistence!**

