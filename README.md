# Auth System

A production-ready authentication system built with **Next.js 16 (App Router)**, **Prisma 8 (Prisma Next)**, and **PostgreSQL**. Features secure JWT-based authentication with access/refresh token rotation, email verification, password reset, role-based access control, profile image uploads via Cloudinary, and comprehensive password management.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16.3.4 (App Router) |
| **Runtime** | React 19.2.8 |
| **Database** | PostgreSQL ≥ 15 |
| **ORM** | Prisma 8 (Prisma Next) — contract-first, typed SQL + ORM |
| **Validation** | Zod 4.5 |
| **Auth** | JWT (jsonwebtoken) + bcrypt (12 rounds) |
| **Email** | Resend |
| **Image Upload** | Cloudinary |
| **Styling** | Tailwind CSS 4 |
| **Language** | TypeScript 5 (strict) |
| **Package Manager** | pnpm 11.20 |

---

## ✨ Features

### Authentication
- **User Registration** — name, username, email, strong password (Zod validated)
- **Email Verification** — 30-minute expiring tokens sent via Resend
- **Login** — email + password, returns HttpOnly secure cookies
- **Logout** — revokes refresh token, clears cookies
- **Token Refresh** — rotating refresh tokens (7-day expiry, 15-min access tokens)
- **Session Persistence** — cookies survive browser restarts

### Password Management
- **Forgot Password** — request reset email with 30-minute expiring token
- **Reset Password** — secure token validation, revokes all refresh tokens on change
- **Change Password** — authenticated users can change password with current password verification

### Security
- **Password Hashing** — bcrypt with 12 salt rounds
- **JWT Signing** — separate secrets for access/refresh tokens
- **HttpOnly Cookies** — `secure`, `sameSite: lax`, path-scoped
- **Refresh Token Rotation** — old token revoked on each refresh
- **Password Change/Reset** — revokes all user refresh tokens automatically
- **Rate-Limit Ready** — token hashing (SHA-256) prevents DB token leakage

### Authorization
- **Role-Based Access** — `USER` | `ADMIN` enum
- **Protected Routes** — `requireAuth()` and `requireRole("ADMIN")` helpers
- **Admin Endpoint** — `/api/admin/users` (demo)

### User Management
- **Profile** — GET/PATCH `/api/users/profile` (name, username, image, imagePublicId)
- **Current User** — GET `/api/users/me` (lightweight current user check)
- **Change Password** — PATCH `/api/users/change-password` with current password verification
- **Email Resend** — POST `/api/auth/resend-verification`
- **Profile Image Upload** — Cloudinary signed upload with automatic old image cleanup

### Developer Experience
- **Contract-First Prisma** — `prisma/schema.prisma` → `prisma/schema.d.ts` + `schema.json`
- **Typed Database Client** — `db.orm.public.User`, `db.sql` query builder
- **Zod Schemas** — shared validation (`validations/`)
- **Custom Errors** — `AuthError` with status codes
- **ESLint + TypeScript** — strict config

---

## 📁 Project Structure

```
auth-system/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts             # POST — register + send verification email
│   │   │   ├── login/route.ts                # POST — login, set auth cookies
│   │   │   ├── logout/route.ts               # POST — revoke refresh token, clear cookies
│   │   │   ├── verify-email/route.ts         # POST — verify token, mark user verified
│   │   │   ├── resend-verification/route.ts  # POST — resend verification email
│   │   │   ├── refresh/route.ts              # POST — rotate access + refresh tokens
│   │   │   ├── forgot-password/route.ts      # POST — request password reset email
│   │   │   └── reset-password/route.ts       # POST — reset password with token
│   │   ├── users/
│   │   │   ├── me/route.ts                   # GET — lightweight current user check
│   │   │   ├── profile/route.ts              # GET/PATCH — current user profile (incl. image)
│   │   │   └── change-password/route.ts      # PATCH — change password + revoke tokens
│   │   ├── admin/
│   │   │   └── users/route.ts                # GET — admin-only demo endpoint
│   │   └── upload/
│   │       └── signature/route.ts            # GET — Cloudinary upload signature
│   ├── (auth)/
│   │   └── verify-email/page.tsx             # Client page — handles ?token= verification
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts                 # getCurrentUser() — reads access token from cookie
│   ├── auth-error.ts           # AuthError class
│   ├── cookie.ts               # setAuthCookies / clearAuthCookies
│   ├── email.ts                # sendEmailVerification(), sendPasswordResetEmail() via Resend
│   ├── jwt.ts                  # generate/verify access & refresh tokens
│   ├── password.ts             # hashPassword / comparePassword (bcrypt)
│   ├── require-auth.ts         # requireAuth() — throws AuthError if unauthenticated
│   ├── require-role.ts         # requireRole("ADMIN") — throws AuthError if not admin
│   ├── token.ts                # generateToken() + hashToken() (SHA-256)
│   ├── cloudinary.ts           # Cloudinary config
│   └── api.ts                  # API helpers (if any)
├── prisma/
│   ├── schema.prisma           # Prisma Next contract (source of truth)
│   ├── schema.d.ts             # Generated types (run `pnpm contract:emit`)
│   ├── schema.json             # Generated contract JSON
│   └── db.ts                   # postgres<Contract> runtime client
├── validations/
│   ├── auth.schema.ts          # registerSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema
│   └── profile.schema.ts       # updateProfileSchema
├── types/
│   └── auth.ts                 # AuthTokenPayload interface
├── migrations/                 # Prisma Next migration artifacts
│   ├── app/refs/db.json        # Current migration ref
│   └── snapshots/<hash>/       # Contract snapshots
├── .env.example                # Environment template
├── .env                        # Local env (gitignored)
├── package.json
├── tsconfig.json
├── next.config.ts
├── prisma.config.ts
└── README.md
```

---

## 🛠 Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 11 (or enable corepack: `corepack enable`)
- **PostgreSQL** ≥ 15 (local or managed — Supabase, Neon, Railway, etc.)
- **Resend Account** — for email delivery (get key at resend.com)
- **Cloudinary Account** — for image uploads (optional, for profile images)

---

## ⚙️ Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd auth-system
pnpm install
```

### 2. Configure Environment

Copy the example and fill in real values:

```bash
cp .env.example .env
```

Required variables in `.env`:

```env
# PostgreSQL connection (Prisma Next requires PostgreSQL ≥ 15)
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"

# JWT secrets — generate with: openssl rand -base64 32
ACCESS_TOKEN_SECRET="your-super-secret-access-token-key-min-32-chars"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-min-32-chars"

# Token lifetimes (jsonwebtoken `expiresIn` format)
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Resend (email delivery) — get key at resend.com
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Frontend URL for verification/reset links
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudinary (for profile image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

> **Tip:** Generate strong secrets:
> ```bash
> openssl rand -base64 32
> ```

### 3. Initialize Database (Prisma Next)

Prisma Next uses a **contract-first** workflow. The `schema.prisma` is your source of truth.

```bash
# 1. Emit contract artifacts (schema.d.ts, schema.json)
pnpm contract:emit

# 2. Create/apply migrations (plans from contract diff)
pnpm prisma migrate dev --name init

# 3. (Optional) Verify database matches contract
pnpm prisma db verify
```

> **Note:** The `prisma` CLI in this project is Prisma Next (`prisma@8.0.0-rc.12`). Commands differ from Prisma ORM 7.
> - `prisma contract emit` — generates `schema.d.ts` + `schema.json` from `schema.prisma`
> - `prisma migrate dev` — plans & applies migrations from contract changes
> - `prisma db push` — not used; use `migrate dev` instead

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📡 API Reference

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user, send verification email | — |
| `POST` | `/api/auth/login` | Login, set access + refresh cookies | — |
| `POST` | `/api/auth/logout` | Revoke refresh token, clear cookies | ✓ (refresh cookie) |
| `POST` | `/api/auth/verify-email` | Verify email token (`{ token }`) | — |
| `POST` | `/api/auth/resend-verification` | Resend verification email (`{ email }`) | — |
| `POST` | `/api/auth/refresh` | Rotate access + refresh tokens | ✓ (refresh cookie) |
| `POST` | `/api/auth/forgot-password` | Request password reset email (`{ email }`) | — |
| `POST` | `/api/auth/reset-password` | Reset password (`{ token, newPassword, confirmNewPassword }`) | — |

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users/me` | Lightweight current user check | ✓ (access cookie) |
| `GET` | `/api/users/profile` | Get current user profile | ✓ (access cookie) |
| `PATCH` | `/api/users/profile` | Update name/username/image (`{ name?, username?, image?, imagePublicId? }`) | ✓ |
| `PATCH` | `/api/users/change-password` | Change password (`{ currentPassword, newPassword, confirmNewPassword }`) | ✓ |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/users` | Admin-only demo endpoint | ✓ (ADMIN role) |

### Upload Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/upload/signature` | Get Cloudinary upload signature | ✓ (access cookie) |

---

## 📝 Request/Response Examples

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecureP@ss123"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully. Please check your email to verify your account.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "isVerified": false
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "SecureP@ss123"}' \
  -c cookies.txt
```

**Response (200):** Sets `accessToken` (15min) and `refreshToken` (7d) HttpOnly cookies.

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt -c cookies.txt
```

### Get Profile

```bash
curl http://localhost:3000/api/users/profile -b cookies.txt
```

### Update Profile (with image)

```bash
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "John Updated",
    "username": "johnupdated",
    "image": "https://res.cloudinary.com/.../image.jpg",
    "imagePublicId": "auth-system/profile-images/abc123"
  }'
```

### Change Password

```bash
curl -X PATCH http://localhost:3000/api/users/change-password \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "currentPassword": "SecureP@ss123",
    "newPassword": "NewSecureP@ss456",
    "confirmNewPassword": "NewSecureP@ss456"
  }'
```

### Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

### Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "NewSecureP@ss456",
    "confirmNewPassword": "NewSecureP@ss456"
  }'
```

### Get Upload Signature (for Cloudinary direct upload)

```bash
curl http://localhost:3000/api/upload/signature -b cookies.txt
```

---

## 🗄 Database Schema (Prisma Next)

### Models

```prisma
enum UserRole { USER, ADMIN }

model User {
  id                      Int    @id @default(autoincrement())
  name                    String
  username                String @unique
  email                   String @unique
  password                String // bcrypt hash
  image                   String?
  imagePublicId           String?
  role                    UserRole @default(USER)
  isVerified              Boolean  @default(false)
  emailVerificationTokens EmailVerificationToken[]
  passwordResetTokens     PasswordResetToken[]
  refreshTokens           RefreshToken[]
  createdAt               TimestamptzString @default(now())
  updatedAt               TimestamptzString @updatedAt
}

model EmailVerificationToken {
  id        Int      @id @default(autoincrement())
  tokenHash String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt TimestamptzString
  createdAt TimestamptzString @default(now())
}

model PasswordResetToken {
  id        Int      @id @default(autoincrement())
  tokenHash String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt TimestamptzString
  used      Boolean  @default(false)
  createdAt TimestamptzString @default(now())
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  tokenHash String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt TimestamptzString
  revoked   Boolean  @default(false)
  createdAt TimestamptzString @default(now())
}
```

### Key Design Decisions

- **Token Hashing** — Raw tokens never stored; only SHA-256 hashes in DB
- **Cascade Delete** — User deletion removes all associated tokens
- **Indexes** — `userId` indexed on all token tables for fast lookups
- **Timestamps** — `TimestamptzString` (PostgreSQL `timestamptz`) with ISO strings
- **Soft Delete Pattern** — `RefreshToken.revoked` + `PasswordResetToken.used`
- **Profile Images** — `image` (URL) + `imagePublicId` (Cloudinary public_id) for management

---

## 🔧 Prisma Next Workflow

### Daily Development

```bash
# 1. Edit schema.prisma (add field, model, relation, index, etc.)
# 2. Emit updated contract artifacts
pnpm contract:emit

# 3. Plan migration (review before applying)
pnpm prisma migrate dev --name descriptive-name

# 4. Verify database matches contract
pnpm prisma db verify
```

### Migration Commands

| Command | Purpose |
|---------|---------|
| `pnpm contract:emit` | Generate `schema.d.ts` + `schema.json` from `schema.prisma` |
| `pnpm prisma migrate dev --name <name>` | Plan & apply migration in dev |
| `pnpm prisma migrate deploy` | Apply pending migrations (CI/prod) |
| `pnpm prisma migrate status` | Show migration status |
| `pnpm prisma db verify` | Verify DB matches contract |
| `pnpm prisma db schema` | Introspect DB → print contract |

### Contract Artifacts (committed)

- `prisma/schema.d.ts` — TypeScript types for `db.orm` / `db.sql`
- `prisma/schema.json` — Machine-readable contract for runtime
- `migrations/app/refs/db.json` — Current migration ref hash
- `migrations/snapshots/<hash>/` — Immutable contract snapshots

> **Never edit generated files.** Always modify `schema.prisma` and re-emit.

---

## 🔐 Security Details

### Token Flow

```
┌─────────────┐     Login      ┌──────────────┐
│   Client    │ ─────────────▶ │   Server     │
└─────────────┘                └──────────────┘
      │                              │
      │  accessToken (15m, HttpOnly) │
      │◀─────────────────────────────┤
      │  refreshToken (7d, HttpOnly) │
      │◀─────────────────────────────┤
      │                              │
      │  API calls with accessToken  │
      │ ───────────────────────────▶ │
      │                              │
      │  401? → POST /auth/refresh   │
      │ ───────────────────────────▶ │
      │  new accessToken +           │
      │  rotated refreshToken        │
      │◀─────────────────────────────┤
```

### Password Requirements (Zod)

- Min 8, max 100 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special char (`@$!%*?&`)

### Username Requirements

- 2–30 characters (register) / 3–30 characters (profile update)
- Alphanumeric + underscore only

---

## 🧪 Testing the Flow

1. **Register** → Check email for verification link
2. **Click link** → Opens `/verify-email?token=...` → calls `/api/auth/verify-email`
3. **Login** → Cookies set
4. **Access `/api/users/profile`** → Returns user data
5. **Upload profile image** → Get signature from `/api/upload/signature`, upload to Cloudinary, update profile with `image` + `imagePublicId`
6. **Wait 15+ min** → Access token expires
7. **Call any protected route** → Auto-refresh via `/api/auth/refresh`
8. **Forgot password** → Request reset email → Click link → Reset password
9. **Change password** → All refresh tokens revoked, re-login required

---

## 📦 Build & Deploy

### Production Build

```bash
pnpm build
pnpm start
```

### Environment Variables (Production)

Ensure all `.env` vars are set in your deployment platform (Vercel, Railway, etc.):
- `DATABASE_URL` — managed Postgres URL
- `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` — strong random strings
- `RESEND_API_KEY` — production Resend key
- `NEXT_PUBLIC_APP_URL` — your production domain (e.g., `https://app.example.com`)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — for image uploads
- `NODE_ENV=production` — enables `secure: true` on cookies

### Database Migrations (CI/CD)

```bash
# In CI pipeline before deploy
pnpm prisma migrate deploy
```

---

## 🐛 Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `DATABASE_URL` not found | `.env` missing or malformed | Check `.env` exists, no quotes around URL |
| `contract emit` fails | Schema syntax error | Fix `schema.prisma`, re-run |
| Migration fails | DB drift / failed migration | `prisma migrate status`, resolve manually |
| Cookies not set | `secure: true` on localhost | Use `lvh.me:3000` or set `NODE_ENV=development` |
| Email not sent | Invalid `RESEND_API_KEY` | Verify key at resend.com, check domain verification |
| `AuthError: Authentication required` | Access token expired/missing | Call `/api/auth/refresh` or re-login |
| Image upload fails | Missing Cloudinary config | Add `CLOUDINARY_*` env vars |
| Old image not deleted | Cloudinary API error | Check Cloudinary credentials, errors logged to console |

---

## 📚 Learn More

- [Prisma Next Docs](https://www.prisma.io/docs/orm/overview/introduction/prisma-next) — Contract-first ORM
- [Next.js App Router](https://nextjs.org/docs/app) — Framework conventions
- [Zod](https://zod.dev/) — Schema validation
- [Resend](https://resend.com/docs) — Email API
- [Cloudinary](https://cloudinary.com/documentation) — Image management
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JWT implementation

---

## 📄 License

MIT — feel free to use in your projects.