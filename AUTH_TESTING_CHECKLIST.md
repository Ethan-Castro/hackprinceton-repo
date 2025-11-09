# Authentication Testing Checklist

## ✅ Pre-Flight Checks

### 1. Environment Variables
```bash
# Check these are set in .env.local
cat .env.local | grep NEXTAUTH_SECRET
cat .env.local | grep NEXTAUTH_URL
cat .env.local | grep DATABASE_URL
```

**Expected:**
- `NEXTAUTH_SECRET` should be a long random string (32+ characters)
- `NEXTAUTH_URL` should be `http://localhost:3000`
- `DATABASE_URL` should be your Neon connection string

### 2. Database Initialization
```bash
# Check database is initialized
curl http://localhost:3000/api/db-init/status

# Expected response:
# {
#   "status": "connected",
#   "existingTables": ["users", "chat_ownership", ...],
#   "tableCount": 20+
# }
```

### 3. Dependencies
```bash
# Check packages are installed
pnpm list next-auth bcryptjs

# Should show:
# next-auth@4.24.13
# bcryptjs@3.0.3
```

## 🧪 Manual Testing Steps

### Test 1: Anonymous User Flow
1. ✅ Open `http://localhost:3000/`
2. ✅ Verify sidebar shows "Anonymous User"
3. ✅ Click user avatar in sidebar
4. ✅ Verify dropdown shows:
   - "Anonymous" / "Using without account"
   - "Create Account" button
   - "Sign In" button
   - "Sign in to save your chat history" message
5. ✅ Try using any feature (chat, health, business, etc.)
6. ✅ Verify all features work without authentication

**Expected:** Full functionality without requiring sign-up

### Test 2: Sign Up Flow
1. ✅ Visit `http://localhost:3000/auth/signup`
2. ✅ Verify form shows:
   - Name field (optional)
   - Email field
   - "Continue" button
   - "Continue Without Account" button
   - Benefits section
3. ✅ Enter email: `test@example.com`
4. ✅ Click "Continue"
5. ✅ Verify password field appears
6. ✅ Enter password: `testpassword123`
7. ✅ Click "Create Account"
8. ✅ Verify:
   - No errors displayed
   - Redirected to `/`
   - Sidebar shows user email
   - User avatar shows initials

**Expected:** Account created, auto-signed in, redirected to home

### Test 3: Sign Out Flow
1. ✅ Click user avatar in sidebar
2. ✅ Click "Log out"
3. ✅ Verify:
   - Redirected to `/`
   - Sidebar shows "Anonymous User" again
   - Can still use all features

**Expected:** Signed out successfully, back to anonymous state

### Test 4: Sign In Flow
1. ✅ Visit `http://localhost:3000/auth/login`
2. ✅ Enter email: `test@example.com`
3. ✅ Click "Continue"
4. ✅ Verify password field appears
5. ✅ Enter password: `testpassword123`
6. ✅ Click "Sign In"
7. ✅ Verify:
   - No errors displayed
   - Redirected to `/`
   - Sidebar shows user email
   - User avatar shows initials

**Expected:** Successfully signed in, redirected to home

### Test 5: Invalid Login
1. ✅ Visit `http://localhost:3000/auth/login`
2. ✅ Enter email: `test@example.com`
3. ✅ Click "Continue"
4. ✅ Enter wrong password: `wrongpassword`
5. ✅ Click "Sign In"
6. ✅ Verify error message: "Invalid email or password"

**Expected:** Login fails with clear error message

### Test 6: Duplicate Email Registration
1. ✅ Visit `http://localhost:3000/auth/signup`
2. ✅ Enter email: `test@example.com` (already exists)
3. ✅ Click "Continue"
4. ✅ Enter password: `newpassword123`
5. ✅ Click "Create Account"
6. ✅ Verify error message: "Failed to create user. Email may already be in use."

**Expected:** Registration fails with clear error message

### Test 7: Password Validation
1. ✅ Visit `http://localhost:3000/auth/signup`
2. ✅ Enter email: `test2@example.com`
3. ✅ Click "Continue"
4. ✅ Enter short password: `short`
5. ✅ Click "Create Account"
6. ✅ Verify error message: "Password must be at least 8 characters long"

**Expected:** Password validation works

### Test 8: Session Persistence
1. ✅ Sign in with valid credentials
2. ✅ Refresh the page (F5 or Cmd+R)
3. ✅ Verify:
   - Still signed in
   - User info still displayed
   - No redirect to login

**Expected:** Session persists across page refreshes

### Test 9: Textbook Studio Integration
1. ✅ Sign in with valid credentials
2. ✅ Visit `http://localhost:3000/textbook-studio`
3. ✅ Create a new chat
4. ✅ Verify "Saved Chats" section appears
5. ✅ Verify new chat appears in saved chats list
6. ✅ Click on saved chat
7. ✅ Verify chat loads with previous messages

**Expected:** Chats are saved and can be reloaded

### Test 10: Anonymous Textbook Studio
1. ✅ Sign out (if signed in)
2. ✅ Visit `http://localhost:3000/textbook-studio`
3. ✅ Create a new chat
4. ✅ Verify "Saved Chats" section does NOT appear
5. ✅ Verify chat works but isn't saved

**Expected:** Anonymous users can use features but data isn't saved

## 🔍 Database Verification

### Check User Created
```bash
# Connect to your Neon database and run:
SELECT id, email, name, user_type, daily_chat_limit, created_at 
FROM users 
WHERE email = 'test@example.com';

# Expected output:
# id | email              | name | user_type  | daily_chat_limit | created_at
# 1  | test@example.com   | NULL | registered | 50               | 2024-...
```

### Check Password Hash
```bash
# Verify password is hashed (not plain text)
SELECT password_hash FROM users WHERE email = 'test@example.com';

# Expected: A bcrypt hash starting with $2a$ or $2b$
# Example: $2b$10$abcdefghijklmnopqrstuvwxyz...
```

### Check Chat Ownership
```bash
# After creating a chat in Textbook Studio:
SELECT * FROM chat_ownership WHERE user_id = 1;

# Expected: Rows showing v0_chat_id linked to user_id
```

## 🐛 Common Issues & Solutions

### Issue 1: "NEXTAUTH_SECRET is not set"
**Solution:**
```bash
# Generate a secret
openssl rand -base64 32

# Add to .env.local
echo "NEXTAUTH_SECRET=<generated_secret>" >> .env.local

# Restart dev server
pnpm dev
```

### Issue 2: "Database connection failed"
**Solution:**
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
curl http://localhost:3000/api/db-init/status

# Reinitialize if needed
curl -X POST http://localhost:3000/api/db-init
```

### Issue 3: "Table does not exist"
**Solution:**
```bash
# Initialize database
curl -X POST http://localhost:3000/api/db-init

# Verify tables created
curl http://localhost:3000/api/db-init/status
```

### Issue 4: Session not persisting
**Solution:**
- Clear browser cookies
- Check NEXTAUTH_URL matches your dev server URL
- Restart dev server
- Try in incognito/private window

### Issue 5: "Invalid email or password" on correct credentials
**Solution:**
- Check user exists in database
- Verify password was hashed correctly
- Try creating a new account
- Check browser console for errors

### Issue 6: Redirect loop
**Solution:**
- Check `lib/auth.ts` pages config points to `/auth/login`
- Clear browser cookies
- Restart dev server

## ✅ Final Verification

Run all tests above and check:

- [ ] Anonymous users can use all features
- [ ] Sign up creates account successfully
- [ ] Sign in works with correct credentials
- [ ] Sign in fails with incorrect credentials
- [ ] Sign out works correctly
- [ ] Session persists across page refreshes
- [ ] User menu shows correct state
- [ ] Textbook Studio saves chats for authenticated users
- [ ] Textbook Studio doesn't save for anonymous users
- [ ] Database has correct user records
- [ ] Passwords are hashed (not plain text)
- [ ] No console errors
- [ ] No linter errors

## 🎉 Success Criteria

All tests should pass with:
- ✅ No errors in browser console
- ✅ No errors in terminal
- ✅ Smooth user experience
- ✅ Data persists correctly
- ✅ Security best practices followed

## 📝 Test Results Template

Copy this template to document your test results:

```
# Authentication Test Results
Date: ___________
Tester: ___________

## Pre-Flight Checks
- [ ] Environment variables set
- [ ] Database initialized
- [ ] Dependencies installed

## Manual Tests
- [ ] Test 1: Anonymous User Flow
- [ ] Test 2: Sign Up Flow
- [ ] Test 3: Sign Out Flow
- [ ] Test 4: Sign In Flow
- [ ] Test 5: Invalid Login
- [ ] Test 6: Duplicate Email Registration
- [ ] Test 7: Password Validation
- [ ] Test 8: Session Persistence
- [ ] Test 9: Textbook Studio Integration
- [ ] Test 10: Anonymous Textbook Studio

## Database Verification
- [ ] User created correctly
- [ ] Password hashed
- [ ] Chat ownership tracked

## Issues Found
1. ___________
2. ___________

## Overall Status
- [ ] All tests passed
- [ ] Ready for production
```

