# MindFlow Authentication Testing Guide

**Created:** 2025-11-07
**Status:** Ready for Testing with New Test Users

---

## 🎯 What Was Fixed

### Critical Fixes Implemented:
1. ✅ **Token Storage Key Mismatch** - Fixed `auth_token` → `accessToken` alignment
2. ✅ **Test Users Added** - 5 users with different roles seeded in database
3. ✅ **Protected Routes** - All frontend routes now require authentication
4. ✅ **Auth System Complete** - Full JWT auth with access + refresh tokens

---

## 📋 Pre-Flight Checklist

Before testing, ensure:
- [ ] Docker Desktop is running
- [ ] PostgreSQL is on port 5433
- [ ] Backend and frontend are stopped (we'll restart them)

---

## 🚀 Step 1: Reset Database with New Test Users

Run this command in your project root:

```bash
# Option A: Using Python manager
python project_manager.py --reset-db

# Option B: Manual reset
docker compose down -v
docker compose up -d
cd backend
npm run prisma:migrate
npm run prisma:seed
```

**Expected Output:**
```
👤 Creating test users...
✅ Created user: admin@mindflow.com (ADMIN)
✅ Created user: estimator@mindflow.com (ESTIMATOR)
✅ Created user: pm@mindflow.com (PROJECT_MANAGER)
✅ Created user: field@mindflow.com (FIELD_USER)
✅ Created user: viewer@mindflow.com (VIEWER)

📊 Seed Summary:
   Users: 5
   Customers: 3
   Contacts: 7
   Pricing Tiers: 3
   External IDs: 6

✨ Seed completed successfully!
```

---

## 🔐 Step 2: Test User Credentials

### Available Test Users:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@mindflow.com` | `Admin123!` | Full access |
| **Estimator** | `estimator@mindflow.com` | `Estimator123!` | Create/edit estimates |
| **Project Manager** | `pm@mindflow.com` | `ProjectManager123!` | Manage jobs |
| **Field User** | `field@mindflow.com` | `FieldUser123!` | Field operations |
| **Viewer** | `viewer@mindflow.com` | `Viewer123!` | Read-only access |

---

## 🧪 Step 3: Start Development Servers

```bash
# Option A: Use launch script
launch.bat

# Option B: Manual start
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Expected Output:**
```
Backend:  ⚡️ [server]: Server is running at http://localhost:3001
Frontend: ➜  Local:   http://localhost:5173/
```

---

## ✅ Step 4: Verify Backend Health

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "MindFlow API is running",
  "database": "connected",
  "timestamp": "2025-11-07T..."
}
```

### Test 2: API Root
```bash
curl http://localhost:3001/
```

**Expected Response:**
```json
{
  "message": "Welcome to MindFlow API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "customers": "/api/customers",
    ...
  }
}
```

---

## 🔑 Step 5: Test Authentication API

### Test 1: Login as Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@mindflow.com\",\"password\":\"Admin123!\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@mindflow.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**💡 TIP:** Copy the `accessToken` value - you'll need it for the next tests!

### Test 2: Get Current User (with Token)
```bash
# Replace YOUR_TOKEN_HERE with the accessToken from login
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "admin@mindflow.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Test 3: Test Without Token (Should Fail)
```bash
curl http://localhost:3001/api/auth/me
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Access token is required"
}
```

---

## 👥 Step 6: Test Customer API (Protected Routes)

### Test 1: List Customers (No Auth - Should Fail)
```bash
curl http://localhost:3001/api/customers
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Access token is required"
}
```

### Test 2: List Customers (With Auth - Should Work)
```bash
# Replace YOUR_TOKEN_HERE with your accessToken
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "customerName": "Richmond American Homes",
      "customerType": "PRODUCTION",
      "pricingTier": "TIER_1",
      ...
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 3,
    "totalPages": 1
  }
}
```

### Test 3: Create Customer (As Estimator)
```bash
# Login as estimator first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"estimator@mindflow.com\",\"password\":\"Estimator123!\"}"

# Copy the accessToken, then:
curl -X POST http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_ESTIMATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"customerName\":\"Test Builder Inc\",\"customerType\":\"PRODUCTION\",\"pricingTier\":\"TIER_2\",\"notes\":\"Test customer created via API\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "...",
    "customerName": "Test Builder Inc",
    "customerType": "PRODUCTION",
    "pricingTier": "TIER_2",
    "notes": "Test customer created via API",
    ...
  }
}
```

### Test 4: Create Customer (As Viewer - Should Fail)
```bash
# Login as viewer first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"viewer@mindflow.com\",\"password\":\"Viewer123!\"}"

# Try to create customer (should fail)
curl -X POST http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"customerName\":\"Should Fail\",\"customerType\":\"PRODUCTION\"}"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "requiredRoles": ["ADMIN", "ESTIMATOR"],
  "userRole": "VIEWER"
}
```

---

## 🌐 Step 7: Test Frontend Authentication

### Test 1: Protected Routes Redirect
1. Open browser to `http://localhost:5173/`
2. You should be **redirected to** `http://localhost:5173/login`
3. ✅ If redirected, route protection is working!

### Test 2: Login via UI
1. Go to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `admin@mindflow.com`
   - Password: `Admin123!`
3. Click "Login"
4. ✅ Should redirect to Dashboard

### Test 3: Access Protected Page
1. After login, navigate to `http://localhost:5173/foundation/customers`
2. ✅ Should load Customer List page with 3 customers
3. ✅ Should see: Richmond American Homes, Holt Homes, Mountain View Custom Homes

### Test 4: Logout
1. Click user menu (if available) or check localStorage
2. Open browser DevTools → Application → Local Storage
3. ✅ Should see `accessToken`, `refreshToken`, `user` stored
4. Logout (or manually clear localStorage)
5. Try accessing `/foundation/customers`
6. ✅ Should redirect to `/login`

---

## ✅ Sprint 1-2 Success Criteria Test

Now test the complete workflow from Sprint 1-2:

### Workflow Test:
1. ✅ **Login** as `admin@mindflow.com`
2. ✅ Navigate to `/foundation/customers`
3. ✅ Click "Create Customer"
4. ✅ Create customer:
   - Name: "Test Builder Inc"
   - Type: "Production"
   - Pricing Tier: "TIER_2"
5. ✅ Add pricing tier: "Tier 2" at 7% discount
6. ✅ Add 3 contacts with different roles
7. ✅ Map to external system "Hyphen BuildPro"
8. ✅ Verify everything saves and displays correctly

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'bcrypt'"
**Solution:**
```bash
cd backend
npm install bcrypt
```

### Issue: "Access token is required"
**Solution:**
- Make sure you're sending the token in the Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN_HERE`
- No extra spaces or quotes

### Issue: "Invalid or expired token"
**Solutions:**
- Token expired (default: 7 days) - login again
- Token malformed - copy the entire token string
- Check JWT_SECRET in backend/.env

### Issue: Frontend not redirecting to login
**Solution:**
- Check browser console for errors
- Verify `ProtectedRoute` component in App.tsx
- Check `AuthContext` is wrapping the app

### Issue: CORS errors
**Solution:**
- Backend should have CORS enabled by default
- Check `backend/src/index.ts` has `app.use(cors())`
- Try restarting backend server

---

## 📊 Expected State After All Tests

### Database:
- ✅ 5 users (Admin, Estimator, PM, Field, Viewer)
- ✅ 4 customers (3 seeded + 1 "Test Builder Inc")
- ✅ Multiple contacts
- ✅ Multiple pricing tiers
- ✅ External ID mappings

### Frontend:
- ✅ Login page works
- ✅ All routes protected
- ✅ Token stored in localStorage
- ✅ Customer list displays
- ✅ Can create/edit customers (with proper role)

### Backend:
- ✅ Health check responds
- ✅ Auth endpoints working
- ✅ Customer API protected
- ✅ RBAC enforced

---

## 🎉 Success Checklist

Mark these off as you test:

- [ ] Database reset completed with 5 users
- [ ] Backend /health endpoint responds
- [ ] Can login as admin via API
- [ ] Auth token works with /api/auth/me
- [ ] Customer API requires authentication
- [ ] Customer API respects RBAC (Viewer can't create)
- [ ] Frontend redirects to /login when not authenticated
- [ ] Can login via frontend UI
- [ ] Can access /foundation/customers after login
- [ ] Can create "Test Builder Inc" customer
- [ ] Can add contacts and pricing tiers
- [ ] Can logout and lose access

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Document any issues** you encounter
2. **Take screenshots** of successful frontend login/customer creation
3. **Commit your test results** to a TEST_RESULTS.md file
4. **Move on to Sprint 3: Plans Management**

---

## 💡 Tips for Success

- **Use Postman or Thunder Client** instead of curl for easier testing
- **Save your tokens** in a text file during testing
- **Check browser DevTools Console** for frontend errors
- **Check terminal output** for backend errors
- **Test with different user roles** to verify RBAC

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify Docker is running and PostgreSQL is on port 5433
3. Check backend terminal for error messages
4. Check frontend console for React errors
5. Verify .env files exist in both backend/ and frontend/

---

**Ready to test? Start with Step 1: Reset Database!** 🚀
