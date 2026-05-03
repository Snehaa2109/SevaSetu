# SevaSetu — Implementation Log

## ✅ Completed Work

---

### Session 1 — Google OAuth Fix
| File | Change |
|---|---|
| `backend/services/googleAuth.js` | Read `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from env vars (was hardcoded) |
| `backend/services/googleAuth.js` | Changed `callbackURL` to absolute URL (`BACKEND_URL/api/auth/google/callback`) |
| `backend/server.js` | `dotenv.config()` moved to **very top** (before `require('./config/passport')`) — this was the root cause of "Unknown authentication strategy 'google'" |
| `backend/server.js` | Configured CORS with `origin: process.env.FRONTEND_URL` + `credentials: true` |
| `frontend/Login.js` | `handleGoogleAuth` uses `process.env.REACT_APP_BACKEND_URL` (absolute URL) for browser redirect |
| `frontend/Signup.js` | Added "Continue with Google" button |

---

### Session 2 — UI Overhaul

| File | Change |
|---|---|
| `frontend/RequestService.js` | Full rewrite — sidebar stepper, 3 service cards (Maid/Babysitter/Elderly Care), OSM map preview, schedule toggle, timing dropdown, footer |
| `frontend/Support.js` | Full rewrite — contact card sidebar, FAQ accordion, message form |
| `frontend/Navbar.js` | Rewrite with cream palette, orange-brown brand, SVG icon buttons (bell/chat/heart), dark avatar dropdown. **Links: Dashboard / Services / Support** |

---

### Session 3 — Full-Stack Connection

#### Backend
| File | Change |
|---|---|
| `models/Booking.js` | Added `schedule`, `timing`, `address`, `rejectionReason`; made `date`/`time` optional |
| `models/SupportMessage.js` | **NEW** — persists support form submissions |
| `controllers/userController.js` | Fixed `createBookingRequest` (new fields + non-blocking WhatsApp); added `updateProfile` |
| `controllers/supportController.js` | **NEW** — `POST /api/support/message`, `GET /api/support/messages` (admin) |
| `routes/users.js` | Removed `roleAuth('USER')` blocker; added `PUT /api/user/profile` |
| `routes/support.js` | **NEW** — mounts support controller |
| `server.js` | Mounted `/api/bookings` and `/api/support` routes |

#### Frontend
| File | Change |
|---|---|
| `utils/api.js` | Added `profileAPI.update()`, `supportAPI.sendMessage()` |
| `Profile.js` | Full rewrite — editable form wired to `PUT /api/user/profile`; updates context on save |
| `Support.js` | Contact form POSTs to `/api/support/message`; pre-fills user name/email from context |
| `RequestService.js` | Submit payload now includes `address` field; handles missing-provider gracefully |

---

### Session 4 — Provider Signup Flow

#### Was it working before? ❌ NO

**Root causes found:**
1. "Become a Seva Provider" on Landing → `/signup` (regular user form, no provider fields, role always `USER`)
2. `RegisterProvider.js` called `POST /api/provider/register` which only upgrades an **existing logged-in user** — it never creates a new account
3. `jwtAuth.js::registerUser` always hardcoded `role: 'USER'` and `status: 'active'`
4. `getServices` (what users search) requires `role:'PROVIDER'` + `isVerified:true` + `status:'active'` — so providers only appear after admin approval

#### Fixes applied:
| File | Change |
|---|---|
| `LandingPage.js` | "Become a Seva Provider" now links to `/signup?role=provider` |
| `Signup.js` | Full rewrite — detects `?role=provider`, shows provider-specific fields (service type, experience), **Google OAuth button is hidden for provider flow**, shows "pending review" notice |
| `Signup.js` | Role switcher pills let the user toggle between "I need services" / "I am a provider" |
| `backend/services/jwtAuth.js` | `registerUser` now accepts `role`, `serviceType`, `experience`; providers are created with `role:'PROVIDER'`, `status:'pending'`, `isVerified:false` |
| `backend/controllers/authController.js` | Passes new fields through to `registerUser` |

---

## 🔄 Provider Visibility Flow (end-to-end)

```
Provider registers via /signup?role=provider
  → DB: role=PROVIDER, status=pending, isVerified=false
  → NOT visible in /api/services yet ✅

Admin goes to admin panel
  → PUT /api/admin/provider/:id/approve
  → DB: status=active, isVerified=true

User searches RequestService
  → GET /api/services returns this provider ✅
  → User can now book them
```

---

## ⚠️ Still Needed (future)

| Item | Notes |
|---|---|
| Admin approval UI | Admin panel exists (`/api/admin/provider/:id/approve`) but no frontend page to trigger it easily |
| Provider dashboard | Providers log in but see user dashboard — need provider-specific view showing their bookings |
| `RegisterProvider.js` | This page still exists and is reachable but its API call only works for already-logged-in users — consider removing or redirecting to `/signup?role=provider` |
| Email/SMS notification to provider | When admin approves, WhatsApp message is sent but email isn't |
